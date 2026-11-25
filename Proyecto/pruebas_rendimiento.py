"""
Pruebas de Rendimiento y Carga — Proyecto SeñaText (CESFAM)
Mide tiempos de respuesta (latencia, promedio, p95, throughput y tasa de éxito)
sobre el despliegue real en producción: https://senatext.netlify.app/
"""

import os
import time
import json
import statistics
import urllib.request
import urllib.error
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = os.getenv("PERF_BASE_URL", "https://senatext.netlify.app").rstrip("/")
RUTAS = ["/", "/paciente", "/login", "/funcionario", "/admin"]
CONCURRENCIA = 10
TOTAL_PETICIONES_CARGA = 30
TIMEOUT_S = 15


def medir_peticion(url: str) -> dict:
    inicio = time.perf_counter()
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "SenaText-PerfTest/1.0"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            cuerpo = resp.read()
            ms = (time.perf_counter() - inicio) * 1000
            return {
                "url": url,
                "status": resp.status,
                "ok": 200 <= resp.status < 400,
                "ms": round(ms, 2),
                "bytes": len(cuerpo),
                "error": None,
            }
    except urllib.error.HTTPError as e:
        ms = (time.perf_counter() - inicio) * 1000
        return {
            "url": url,
            "status": e.code,
            "ok": False,
            "ms": round(ms, 2),
            "bytes": 0,
            "error": str(e),
        }
    except Exception as e:
        ms = (time.perf_counter() - inicio) * 1000
        return {
            "url": url,
            "status": 0,
            "ok": False,
            "ms": round(ms, 2),
            "bytes": 0,
            "error": str(e),
        }


def percentil(valores, p):
    if not valores:
        return 0.0
    ordenados = sorted(valores)
    idx = int(round((p / 100.0) * (len(ordenados) - 1)))
    return round(ordenados[idx], 2)


def main():
    print("=" * 72)
    print(f"PRUEBAS DE RENDIMIENTO SEÑATEXT — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Entorno objetivo: {BASE_URL}")
    print("=" * 72)

    # 1. Prueba de latencia por ruta (3 muestras por ruta)
    print("\n[1] Latencia por ruta (3 peticiones secuenciales c/u):")
    resumen_rutas = []
    for ruta in RUTAS:
        url = f"{BASE_URL}{ruta}"
        muestras = [medir_peticion(url) for _ in range(3)]
        tiempos = [m["ms"] for m in muestras]
        ok_count = sum(1 for m in muestras if m["ok"])
        avg_ms = round(statistics.mean(tiempos), 2)
        bytes_avg = round(statistics.mean([m["bytes"] for m in muestras]) / 1024, 2)
        item = {
            "ruta": ruta,
            "ok": f"{ok_count}/3",
            "status": muestras[-1]["status"],
            "min_ms": min(tiempos),
            "avg_ms": avg_ms,
            "max_ms": max(tiempos),
            "kb": bytes_avg,
        }
        resumen_rutas.append(item)
        print(
            f"  {ruta:<14} | HTTP {item['status']} ({item['ok']}) | "
            f"min={item['min_ms']} ms | avg={item['avg_ms']} ms | max={item['max_ms']} ms | {item['kb']} KB"
        )

    # 2. Prueba de carga concurrente (10 usuarios simultáneos, 30 peticiones)
    print(
        f"\n[2] Prueba de carga concurrente ({CONCURRENCIA} usuarios simultáneos, "
        f"{TOTAL_PETICIONES_CARGA} peticiones totales a / y /paciente):"
    )
    urls_carga = [
        f"{BASE_URL}{'/paciente' if i % 2 else '/'}"
        for i in range(TOTAL_PETICIONES_CARGA)
    ]
    t0 = time.perf_counter()
    resultados_carga = []
    with ThreadPoolExecutor(max_workers=CONCURRENCIA) as pool:
        futuros = [pool.submit(medir_peticion, u) for u in urls_carga]
        for fut in as_completed(futuros):
            resultados_carga.append(fut.result())
    duracion_total_s = round(time.perf_counter() - t0, 2)

    tiempos_carga = [r["ms"] for r in resultados_carga]
    exitosas = sum(1 for r in resultados_carga if r["ok"])
    tasa_exito = round((exitosas / TOTAL_PETICIONES_CARGA) * 100, 2)
    throughput = round(TOTAL_PETICIONES_CARGA / max(duracion_total_s, 0.001), 2)

    metricas_carga = {
        "usuarios_concurrentes": CONCURRENCIA,
        "total_peticiones": TOTAL_PETICIONES_CARGA,
        "exitosas": exitosas,
        "fallidas": TOTAL_PETICIONES_CARGA - exitosas,
        "tasa_exito_pct": tasa_exito,
        "duracion_total_s": duracion_total_s,
        "throughput_req_s": throughput,
        "min_ms": min(tiempos_carga),
        "avg_ms": round(statistics.mean(tiempos_carga), 2),
        "p50_ms": percentil(tiempos_carga, 50),
        "p95_ms": percentil(tiempos_carga, 95),
        "max_ms": max(tiempos_carga),
    }

    print(f"  Exitosas:         {exitosas}/{TOTAL_PETICIONES_CARGA} ({tasa_exito}%)")
    print(f"  Duración total:   {duracion_total_s} s  |  Throughput: {throughput} req/s")
    print(
        f"  Latencia (ms):    min={metricas_carga['min_ms']} | avg={metricas_carga['avg_ms']} | "
        f"p50={metricas_carga['p50_ms']} | p95={metricas_carga['p95_ms']} | max={metricas_carga['max_ms']}"
    )

    # Criterios de aceptación de rendimiento (Web SPA)
    aprobado = tasa_exito == 100.0 and metricas_carga["p95_ms"] < 2000.0
    print("\n" + "=" * 72)
    print(f"RESULTADO GLOBAL DE RENDIMIENTO: {'APROBADO (OK)' if aprobado else 'REVISAR'}")
    print("Criterio: 100% tasa de éxito y p95 < 2000 ms")
    print("=" * 72)

    reporte = {
        "fecha": datetime.now().isoformat(),
        "base_url": BASE_URL,
        "rutas": resumen_rutas,
        "carga_concurrente": metricas_carga,
        "aprobado": aprobado,
    }
    with open("reporte_rendimiento.json", "w", encoding="utf-8") as f:
        json.dump(reporte, f, ensure_ascii=False, indent=2)
    print("Reporte guardado en reporte_rendimiento.json")


if __name__ == "__main__":
    main()
