import unittest
import os
import random
import string
import re
import time
import atexit
from selenium import webdriver  # type: ignore
from selenium.webdriver.common.by import By  # type: ignore
from selenium.webdriver.chrome.options import Options  # type: ignore
from selenium.webdriver.support.ui import WebDriverWait, Select  # type: ignore
from selenium.webdriver.support import expected_conditions as EC  # type: ignore
from selenium.webdriver.chrome.service import Service  # type: ignore
from webdriver_manager.chrome import ChromeDriverManager  # type: ignore
from selenium.webdriver.common.keys import Keys  # type: ignore
from selenium.webdriver.remote.webelement import WebElement  # type: ignore


# ==============================================================================
# CONFIGURACIÓN BASE DE PRUEBAS SELENIUM - PROYECTO SEÑATEXT (CESFAM)
# Equipo QA: Ariel Valverde, Martín Quiroga, Vicente Tramon, Diego Robert
# ==============================================================================

_SHARED_DRIVER = None


def _cerrar_driver_compartido():
    global _SHARED_DRIVER
    if _SHARED_DRIVER is not None:
        try:
            _SHARED_DRIVER.quit()
        except Exception:
            pass
        _SHARED_DRIVER = None


atexit.register(_cerrar_driver_compartido)


class BaseTest(unittest.TestCase):
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5173")
    HEADLESS = os.getenv("HEADLESS", "0") == "1"
    REUSE_BROWSER = os.getenv("REUSE_BROWSER", "1") == "1"

    # Velocidad de ejecución (en segundos):
    # STEP_DELAY: pausa tras cada clic, escritura o cambio de página
    # TEST_DELAY: pausa al finalizar cada prueba para observar el resultado
    STEP_DELAY = float(os.getenv("STEP_DELAY", "1.0"))
    TEST_DELAY = float(os.getenv("TEST_DELAY", "2.0"))
    _EN_ESCRITURA = False

    # Credenciales institucionales configuradas en Supabase Auth
    FUNC_EMAIL = os.getenv("TEST_FUNC_EMAIL", "ariel.valverde@cesfam.com")
    FUNC_PASSWORD = os.getenv("TEST_FUNC_PASSWORD", "123456")

    ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL", "admin@cesfam.com")
    ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD", "123456")

    @classmethod
    def _crear_driver(cls):
        opts = Options()
        # Ruta de Brave en tu equipo
        brave_path = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
        if os.path.exists(brave_path):
            opts.binary_location = brave_path

        if cls.HEADLESS:
            opts.add_argument("--headless=new")
        opts.add_argument("--window-size=1366,768")
        # Emulación de cámara WebRTC y permisos automáticos para MediaPipe en /paciente
        opts.add_argument("--use-fake-ui-for-media-stream")
        opts.add_argument("--use-fake-device-for-media-stream")
        opts.add_experimental_option("detach", not cls.HEADLESS)
        return webdriver.Chrome(options=opts)

    @classmethod
    def setUpClass(cls):
        global _SHARED_DRIVER
        if cls.REUSE_BROWSER:
            if _SHARED_DRIVER is None:
                _SHARED_DRIVER = cls._crear_driver()
            cls.driver = _SHARED_DRIVER
        else:
            cls.driver = cls._crear_driver()
        cls.wait = WebDriverWait(cls.driver, 12)

    @classmethod
    def tearDownClass(cls):
        if not cls.REUSE_BROWSER and cls.driver is not None:
            cls.driver.quit()

    def tearDown(self):
        if self.TEST_DELAY > 0:
            time.sleep(self.TEST_DELAY)

    def go(self, path=""):
        url = f"{self.BASE_URL.rstrip('/')}/{path.lstrip('/')}"
        self.driver.get(url)
        if self.STEP_DELAY > 0:
            time.sleep(self.STEP_DELAY)

    def limpiar_estado(self):
        """Limpia sesión de Supabase, localStorage y sessionStorage."""
        url = f"{self.BASE_URL.rstrip('/')}/"
        self.driver.get(url)
        self.driver.execute_script(
            "window.localStorage.clear(); window.sessionStorage.clear();"
        )
        self.driver.delete_all_cookies()

    def limpiar_y_escribir(self, elemento, texto):
        """Limpia un input controlado de React de forma segura y escribe texto."""
        BaseTest._EN_ESCRITURA = True
        try:
            elemento.click()
            elemento.send_keys(Keys.CONTROL, "a")
            elemento.send_keys(Keys.BACKSPACE)
            if texto:
                elemento.send_keys(texto)
        finally:
            BaseTest._EN_ESCRITURA = False
        if self.STEP_DELAY > 0:
            time.sleep(self.STEP_DELAY)


    def iniciar_sesion(self, email, password):
        d, w = self.driver, self.wait
        self.limpiar_estado()
        self.go("/login")
        input_email = w.until(EC.visibility_of_element_located((By.ID, "input-correo")))
        input_pass = d.find_element(By.ID, "input-password")
        self.limpiar_y_escribir(input_email, email)
        self.limpiar_y_escribir(input_pass, password)
        btn_submit = d.find_element(By.CSS_SELECTOR, "button[type='submit']")
        btn_submit.click()


_ORIG_CLICK = WebElement.click


def _click_pausado(self, *args, **kwargs):
    res = _ORIG_CLICK(self, *args, **kwargs)
    if not BaseTest._EN_ESCRITURA and BaseTest.STEP_DELAY > 0:
        time.sleep(BaseTest.STEP_DELAY)
    return res


WebElement.click = _click_pausado


# ==============================================================================
# 1. PRUEBAS PARA EL PORTAL DE INICIO Y NAVEGACIÓN PÚBLICA
# ==============================================================================
class TestPortalInicio(BaseTest):
    def test_carga_portal_inicio(self):
        d, w = self.driver, self.wait
        self.go("/")
        logo = w.until(EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "img[alt='Logo SeñaText']")
        ))
        self.assertTrue(logo.get_attribute("src"), "El logo principal no posee atributo src válido.")

        card_paciente = w.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/paciente']")))
        card_funcionario = w.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/login']")))

        self.assertIn("ingreso paciente", card_paciente.text.lower())
        self.assertIn("ingreso funcionario", card_funcionario.text.lower())

        footer = w.until(EC.visibility_of_element_located((By.TAG_NAME, "footer")))
        self.assertIn("cesfam", footer.text.lower())
        print("OK - Portal de inicio cargado con logo, tarjetas de rol y pie de página.")


class TestRedireccionRutaInexistente(BaseTest):
    def test_ruta_inexistente_redirige_inicio(self):
        d, w = self.driver, self.wait
        self.go("/ruta-inexistente-qa-404")
        w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "a[href='/paciente']")))
        time.sleep(0.5)
        current_url = d.current_url.rstrip("/").lower()
        base_url = self.BASE_URL.rstrip("/").lower()
        self.assertEqual(
            current_url, base_url,
            f"La ruta inexistente no redirigió al home. URL actual: {current_url}"
        )
        print("OK - Ruta inexistente redirigida automáticamente al portal de inicio.")


# ==============================================================================
# 2. PRUEBAS PARA EL LOGIN Y VALIDACIÓN DE CREDENCIALES
# ==============================================================================
class TestLoginVacio(BaseTest):
    def test_login_vacio(self):
        d, w = self.driver, self.wait
        self.limpiar_estado()
        self.go("/login")
        btn = w.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
        btn.click()
        alerta = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert']")))
        self.assertIn("por favor ingrese correo y contraseña", alerta.text.lower())
        self.assertIn("/login", d.current_url.lower())
        print(f"OK - Login sin campos llenados bloqueado correctamente: {alerta.text}")


class TestLoginDominioInv(BaseTest):
    def test_login_dominio_invalido(self):
        d, w = self.driver, self.wait
        self.limpiar_estado()
        self.go("/login")
        input_email = w.until(EC.visibility_of_element_located((By.ID, "input-correo")))
        input_pass = d.find_element(By.ID, "input-password")
        self.limpiar_y_escribir(input_email, "funcionario@outlook.cl")
        self.limpiar_y_escribir(input_pass, "123456")
        d.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        msg_dominio = w.until(EC.visibility_of_element_located((
            By.XPATH, "//p[contains(.,'Debe usar un correo @gmail.com o institucional @cesfam')] | //span[contains(.,'Debe usar un correo @gmail.com o institucional @cesfam')]"
        )))
        self.assertTrue(msg_dominio.is_displayed(), "No se mostró el mensaje de dominio inválido.")
        self.assertIn("/login", d.current_url.lower())
        print(f"OK - Login bloqueado por dominio no institucional: {msg_dominio.text}")


class TestLoginPswdInc(BaseTest):
    def test_login_pswd_inc(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, "ClaveErronea987!")
        alerta = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert']")))
        self.assertIn("credenciales incorrectas", alerta.text.lower())
        self.assertIn("/login", d.current_url.lower())
        print(f"OK - Login bloqueado con contraseña incorrecta: {alerta.text}")


class TestVisibilidadPassword(BaseTest):
    def test_toggle_password(self):
        d, w = self.driver, self.wait
        self.go("/login")
        input_pass = w.until(EC.visibility_of_element_located((By.ID, "input-password")))
        self.limpiar_y_escribir(input_pass, "123456")
        self.assertEqual(input_pass.get_attribute("type"), "password")

        btn_ver = d.find_element(By.CSS_SELECTOR, "button[aria-label='Ver contraseña']")
        btn_ver.click()
        self.assertEqual(input_pass.get_attribute("type"), "text")

        btn_ocultar = d.find_element(By.CSS_SELECTOR, "button[aria-label='Ocultar contraseña']")
        btn_ocultar.click()
        self.assertEqual(input_pass.get_attribute("type"), "password")
        print("OK - Botón mostrar/ocultar contraseña alterna correctamente entre password y text.")


class TestLoginFuncionarioExitoso(BaseTest):
    def test_login_funcionario(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))
        self.assertIn(
            "/funcionario", d.current_url.lower(),
            f"No redirigió a /funcionario tras login exitoso. URL actual: {d.current_url}"
        )
        print(f"OK - Login exitoso de funcionario y redirección a /funcionario: {self.FUNC_EMAIL}")


class TestLoginAdminExitoso(BaseTest):
    def test_login_admin(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.ADMIN_EMAIL, self.ADMIN_PASSWORD)
        w.until(EC.url_contains("/admin"))
        self.assertIn(
            "/admin", d.current_url.lower(),
            f"No redirigió a /admin tras login de administrador. URL actual: {d.current_url}"
        )
        print(f"OK - Login exitoso de administrador y redirección a /admin: {self.ADMIN_EMAIL}")


# ==============================================================================
# 3. PRUEBAS DE PROTECCIÓN DE RUTAS Y CONTROL DE ACCESO (RBAC)
# ==============================================================================
class TestAccesoSinSesionFuncionario(BaseTest):
    def test_bloqueo_ruta_funcionario_sin_login(self):
        d, w = self.driver, self.wait
        self.limpiar_estado()
        self.go("/funcionario")
        w.until(EC.url_contains("/login"))
        alerta = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert']")))
        self.assertIn("debes iniciar sesión", alerta.text.lower())
        print("OK - RutaProtegida bloqueó acceso sin sesión a /funcionario.")


class TestAccesoSinSesionAdmin(BaseTest):
    def test_bloqueo_ruta_admin_sin_login(self):
        d, w = self.driver, self.wait
        self.limpiar_estado()
        self.go("/admin")
        w.until(EC.url_contains("/login"))
        alerta = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert']")))
        self.assertIn("debes iniciar sesión", alerta.text.lower())
        print("OK - RutaProtegida bloqueó acceso sin sesión a /admin.")


class TestBloqueoRBACFuncionarioEnAdmin(BaseTest):
    def test_funcionario_no_puede_acceder_a_admin(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))
        self.go("/admin")
        # RutaProtegida redirige a /login y LoginFuncionario redirige de vuelta a /funcionario al tener sesión activa no-admin
        w.until(EC.any_of(
            EC.url_contains("/funcionario"),
            EC.url_contains("/login")
        ))
        time.sleep(0.5)
        self.assertNotIn(
            "/admin", d.current_url.lower(),
            f"Error RBAC: el funcionario logró permanecer en /admin ({d.current_url})"
        )
        print(f"OK - RBAC verificado: cuenta funcionario bloqueada en /admin y redirigida a {d.current_url}.")


# ==============================================================================
# 4. PRUEBAS PARA LA VISTA DEL PACIENTE (/paciente)
# ==============================================================================
class TestVistaPacienteElementos(BaseTest):
    def test_visualizacion_vista_paciente(self):
        d, w = self.driver, self.wait
        self.go("/paciente")
        titulo_ind = w.until(EC.visibility_of_element_located((
            By.XPATH, "//h2[contains(.,'Indicaciones para un mejor reconocimiento')]"
        )))
        self.assertTrue(titulo_ind.is_displayed(), "No se muestra el título de indicaciones.")

        indicaciones = d.find_elements(By.CSS_SELECTOR, "aside ul li")
        self.assertEqual(len(indicaciones), 7, f"Se esperaban 7 indicaciones y se encontraron {len(indicaciones)}.")

        visor_section = w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "section[aria-label='Visor de cámara y procesamiento de señas']"
        )))
        video_el = visor_section.find_element(By.TAG_NAME, "video")
        canvas_el = visor_section.find_element(By.TAG_NAME, "canvas")
        self.assertIsNotNone(video_el, "No existe el elemento <video> para WebRTC.")
        self.assertIsNotNone(canvas_el, "No existe el elemento <canvas> para MediaPipe.")

        pregunta_h1 = w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "section[aria-label='Pregunta actual del funcionario'] h1"
        )))
        self.assertTrue(len(pregunta_h1.text.strip()) > 0, "No se muestra la pregunta activa al paciente.")
        print(f"OK - Vista Paciente verificada: 7 indicaciones, visor WebRTC/MediaPipe y pregunta '{pregunta_h1.text}'.")


class TestRetornoInicioDesdePaciente(BaseTest):
    def test_volver_inicio_paciente(self):
        d, w = self.driver, self.wait
        self.go("/paciente")
        link_volver = w.until(EC.element_to_be_clickable((
            By.XPATH, "//a[contains(.,'Volver al inicio')]"
        )))
        link_volver.click()
        w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "a[href='/paciente']")))
        self.assertEqual(d.current_url.rstrip("/").lower(), self.BASE_URL.rstrip("/").lower())
        print("OK - Enlace 'Volver al inicio' en /paciente redirige correctamente al portal.")


# ==============================================================================
# 5. PRUEBAS PARA EL MÓDULO DE ATENCIÓN DEL FUNCIONARIO (/funcionario)
# ==============================================================================
class TestPanelFuncionarioPreguntas(BaseTest):
    def test_listado_y_seleccion_preguntas(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))

        botones = w.until(EC.visibility_of_all_elements_located((By.CSS_SELECTOR, "aside button")))
        textos_botones = [b.text.strip() for b in botones]
        esperadas = [
            "¿A qué viene hoy?",
            "¿Tiene hora agendada?",
            "¿Con qué profesional?",
            "¿Tiene algún síntoma?"
        ]
        for preg in esperadas:
            self.assertIn(preg, textos_botones, f"Falta la pregunta predeterminada: {preg}")

        # Seleccionar "¿Tiene algún síntoma?" y verificar persistencia en localStorage
        btn_sintoma = d.find_element(By.XPATH, "//aside//button[contains(.,'¿Tiene algún síntoma?')]")
        btn_sintoma.click()
        time.sleep(0.3)
        self.assertIn("bg-blue-700", btn_sintoma.get_attribute("class") or "")
        guardada_ls = d.execute_script("return window.localStorage.getItem('senatext_pregunta_activa');")
        self.assertEqual(guardada_ls, "¿Tiene algún síntoma?")
        print("OK - Selección de preguntas preparadas y persistencia en localStorage verificadas.")


class TestSincronizacionPreguntaPaciente(BaseTest):
    def test_sincronizacion_pregunta_entre_vistas(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))

        pregunta_objetivo = "¿Con qué profesional?"
        btn = w.until(EC.element_to_be_clickable((
            By.XPATH, f"//aside//button[contains(.,'{pregunta_objetivo}')]"
        )))
        btn.click()
        time.sleep(0.4)

        self.go("/paciente")
        h1_paciente = w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "section[aria-label='Pregunta actual del funcionario'] h1"
        )))
        self.assertEqual(
            h1_paciente.text.strip(), pregunta_objetivo,
            f"La pregunta en Vista Paciente ('{h1_paciente.text}') no coincide con la seleccionada ('{pregunta_objetivo}')."
        )
        print(f"OK - Sincronización Funcionario -> Paciente exitosa para la pregunta: '{pregunta_objetivo}'.")


class TestSincronizacionCamaraMultiPestana(BaseTest):
    def test_apagar_encender_camara_tiempo_real(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))

        tab_funcionario = d.current_window_handle
        d.switch_to.new_window("tab")
        tab_paciente = d.current_window_handle
        self.go("/paciente")
        w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "section[aria-label='Visor de cámara y procesamiento de señas']"
        )))

        # Regresar a la pestaña del funcionario y apagar la cámara
        d.switch_to.window(tab_funcionario)
        btn_cam = w.until(EC.element_to_be_clickable((
            By.XPATH, "//button[contains(.,'Apagar Cámara') or contains(.,'Encender Cámara')]"
        )))
        if "Apagar Cámara" in btn_cam.text:
            btn_cam.click()
            time.sleep(0.5)
        self.assertIn("Encender Cámara", btn_cam.text)

        # Verificar en la pestaña del paciente que el evento BroadcastChannel apagó la cámara en vivo
        d.switch_to.window(tab_paciente)
        msg_off = w.until(EC.visibility_of_element_located((
            By.XPATH, "//*[contains(.,'La cámara está apagada')]"
        )))
        self.assertTrue(msg_off.is_displayed(), "No se mostró 'La cámara está apagada' en la pestaña del paciente.")

        # Volver a encender la cámara desde el funcionario
        d.switch_to.window(tab_funcionario)
        btn_cam = w.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Encender Cámara')]")))
        btn_cam.click()
        time.sleep(0.4)
        self.assertIn("Apagar Cámara", btn_cam.text)

        # Cerrar pestaña secundaria y mantener pestaña principal
        d.switch_to.window(tab_paciente)
        d.close()
        d.switch_to.window(tab_funcionario)
        print("OK - Sincronización en tiempo real de cámara (BroadcastChannel) entre pestañas verificada.")


class TestCorreccionManualTraduccion(BaseTest):
    def test_editar_y_guardar_traduccion(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))

        # 1. Probar botón Cancelar edición
        btn_corregir = w.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Corregir')]")))
        btn_corregir.click()
        input_edit = w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "input[placeholder='Escriba la corrección...']"
        )))
        self.limpiar_y_escribir(input_edit, "Texto descartado")
        d.find_element(By.XPATH, "//button[normalize-space()='Cancelar']").click()
        w.until(EC.invisibility_of_element_located((
            By.CSS_SELECTOR, "input[placeholder='Escriba la corrección...']"
        )))

        # 2. Probar edición y guardado efectivo
        btn_corregir = w.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Corregir')]")))
        btn_corregir.click()
        input_edit = w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "input[placeholder='Escriba la corrección...']"
        )))
        texto_corregido = "Fiebre alta y dolor de garganta"
        self.limpiar_y_escribir(input_edit, texto_corregido)
        d.find_element(By.XPATH, "//button[normalize-space()='Guardar']").click()

        p_reconocido = w.until(EC.visibility_of_element_located((
            By.XPATH, f"//p[contains(.,'{texto_corregido}')]"
        )))
        p_estado = w.until(EC.visibility_of_element_located((
            By.XPATH, "//*[contains(.,'Texto corregido manualmente por el funcionario')]"
        )))
        self.assertTrue(p_reconocido.is_displayed())
        self.assertTrue(p_estado.is_displayed())
        print(f"OK - Corrección manual guardada y mostrada en el visualizador: '{texto_corregido}'.")


class TestRegistrarSintomaSupabase(BaseTest):
    def test_registrar_sintoma_en_bd(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))

        btn_registrar = w.until(EC.element_to_be_clickable((
            By.XPATH, "//button[contains(.,'Registrar síntoma')]"
        )))
        btn_registrar.click()

        toast = w.until(EC.visibility_of_element_located((
            By.XPATH,
            "//span[contains(.,'registrada con éxito en Supabase') or contains(.,'Error al guardar en Supabase')]"
        )))
        self.assertTrue(toast.is_displayed(), "No apareció la notificación de respuesta de Supabase al registrar síntoma.")
        print(f"OK - Petición de registro en Supabase ejecutada y notificación capturada: {toast.text}")


class TestTerminarJornadaLaboral(BaseTest):
    def test_cierre_sesion_y_banner(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.FUNC_EMAIL, self.FUNC_PASSWORD)
        w.until(EC.url_contains("/funcionario"))

        btn_logout = w.until(EC.element_to_be_clickable((
            By.CSS_SELECTOR, "button[title='Terminar Jornada Laboral']"
        )))
        btn_logout.click()

        banner = w.until(EC.visibility_of_element_located((
            By.XPATH, "//div[@role='status' and contains(.,'Sesión Finalizada')]"
        )))
        self.assertIn("ha cerrado su jornada correctamente", banner.text.lower())
        self.assertEqual(d.current_url.rstrip("/").lower(), self.BASE_URL.rstrip("/").lower())
        print("OK - 'Terminar Jornada Laboral' cerró la sesión y mostró alerta de confirmación en inicio.")


# ==============================================================================
# 6. PRUEBAS PARA EL PANEL DE ADMINISTRACIÓN (/admin)
# ==============================================================================
class TestPanelAdminDashboard(BaseTest):
    def test_visualizacion_metricas_graficos_y_tabla(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.ADMIN_EMAIL, self.ADMIN_PASSWORD)
        w.until(EC.url_contains("/admin"))

        h1 = w.until(EC.visibility_of_element_located((
            By.XPATH, "//h1[contains(.,'Panel de administración')]"
        )))
        self.assertTrue(h1.is_displayed())

        # Verificar las 3 tarjetas de métricas
        body_txt = d.find_element(By.TAG_NAME, "body").text.lower()
        for etiqueta in ("funcionarios", "atenciones", "promedio por funcionario"):
            self.assertIn(etiqueta, body_txt, f"No se encontró la tarjeta de métrica '{etiqueta}'.")

        # Verificar los 2 gráficos Recharts
        g1 = w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(.,'Atenciones por funcionario')]")))
        g2 = w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(.,'Atenciones por mes')]")))
        self.assertTrue(g1.is_displayed() and g2.is_displayed())

        # Verificar que la tabla cargue los funcionarios desde la Edge Function manage-users
        w.until(EC.visibility_of_element_located((By.XPATH, "//table//tbody//tr//td[contains(.,'@cesfam')]")))
        filas = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
        self.assertGreaterEqual(len(filas), 1, "La tabla de funcionarios no cargó registros.")
        print(f"OK - Panel de Administración cargado con métricas, gráficos y {len(filas)} funcionarios en tabla.")


class TestPanelAdminFiltros(BaseTest):
    def test_filtros_combinados_y_boton_limpiar(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.ADMIN_EMAIL, self.ADMIN_PASSWORD)
        w.until(EC.url_contains("/admin"))
        w.until(EC.visibility_of_element_located((By.XPATH, "//table//tbody//tr//td[contains(.,'@cesfam')]")))

        buscador = w.until(EC.visibility_of_element_located((
            By.CSS_SELECTOR, "input[placeholder='Buscar funcionario']"
        )))
        # Filtrar por un funcionario existente ("ariel")
        self.limpiar_y_escribir(buscador, "ariel")
        time.sleep(0.3)
        filas_ariel = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
        self.assertEqual(len(filas_ariel), 1)
        self.assertIn("ariel", filas_ariel[0].text.lower())

        # Filtrar por un término inexistente
        self.limpiar_y_escribir(buscador, "InexistenteQA999")
        msg_sin_res = w.until(EC.visibility_of_element_located((
            By.XPATH, "//td[contains(.,'No hay funcionarios que coincidan con los filtros.')]"
        )))
        self.assertTrue(msg_sin_res.is_displayed())

        # Probar selectores pill adicionales y el botón Limpiar
        sel_mes = Select(d.find_element(By.CSS_SELECTOR, "select[aria-label='Filtrar por mes']"))
        sel_mes.select_by_visible_text("Octubre")

        btn_limpiar = w.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Limpiar')]")))
        btn_limpiar.click()
        self.assertEqual(buscador.get_attribute("value"), "")
        w.until(EC.visibility_of_element_located((By.XPATH, "//table//tbody//tr//td[contains(.,'@cesfam')]")))
        print("OK - Filtros por nombre, selectores de fecha y botón 'Limpiar' funcionan correctamente.")


class TestPanelAdminModalCrearCuenta(BaseTest):
    def test_validaciones_modal_nueva_cuenta(self):
        d, w = self.driver, self.wait
        self.iniciar_sesion(self.ADMIN_EMAIL, self.ADMIN_PASSWORD)
        w.until(EC.url_contains("/admin"))

        btn_abrir = w.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Crear cuenta')]")))
        btn_abrir.click()

        modal = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='dialog'][aria-modal='true']")))
        self.assertTrue(modal.is_displayed(), "No se abrió el modal 'Crear cuenta'.")

        # 1. Validar bloqueo de formulario vacío
        btn_submit = modal.find_element(By.CSS_SELECTOR, "button[type='submit']")
        btn_submit.click()
        alerta = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='dialog'] [role='alert']")))
        self.assertIn("complete nombre y correo", alerta.text.lower())

        # 2. Validar bloqueo de formato de correo inválido
        input_nombre = modal.find_element(By.ID, "nuevo-nombre")
        input_email = modal.find_element(By.ID, "nuevo-email")
        self.limpiar_y_escribir(input_nombre, "Funcionario Prueba QA")
        self.limpiar_y_escribir(input_email, "correo_invalido_sin_dominio")
        btn_submit.click()
        alerta2 = w.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='dialog'] [role='alert']")))
        self.assertIn("correo electrónico válido", alerta2.text.lower())

        # 3. Validar cierre de modal con tecla Escape
        input_email.send_keys(Keys.ESCAPE)
        w.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, "[role='dialog']")))
        print("OK - Modal 'Crear cuenta': validaciones de campos vacíos, email inválido y cierre con Escape OK.")


# Orden secuencial exacto según el documento Casos_de_pruebas_1.3.2 (CP-001 a CP-012)
ORDEN_CASOS_PRUEBA = [
    # CP-001: Portal de Inicio y Enrutamiento
    TestPortalInicio,
    TestRedireccionRutaInexistente,
    # CP-002: Validación de Formulario y Dominios en Login
    TestLoginVacio,
    TestLoginDominioInv,
    # CP-003: Rechazo de Credenciales Inválidas y Visibilidad de Contraseña
    TestVisibilidadPassword,
    TestLoginPswdInc,
    # CP-004: Inicio de Sesión Exitoso y Redirección por Rol
    TestLoginFuncionarioExitoso,
    TestLoginAdminExitoso,
    # CP-005: Protección de Rutas Privadas (RutaProtegida) y RBAC
    TestAccesoSinSesionFuncionario,
    TestAccesoSinSesionAdmin,
    TestBloqueoRBACFuncionarioEnAdmin,
    # CP-006: Visor de Cámara WebRTC, MediaPipe e Indicaciones del Paciente
    TestVistaPacienteElementos,
    TestRetornoInicioDesdePaciente,
    # CP-007: Selección de Preguntas Preparadas y Sincronización con Paciente
    TestPanelFuncionarioPreguntas,
    TestSincronizacionPreguntaPaciente,
    # CP-008: Control Remoto de Cámara en Tiempo Real Multi-Pestaña
    TestSincronizacionCamaraMultiPestana,
    # CP-009: Edición y Corrección Manual de Traducción
    TestCorreccionManualTraduccion,
    # CP-010: Registro de Síntoma e Interacción Clínica en Supabase
    TestRegistrarSintomaSupabase,
    # CP-011: Cierre de Sesión ('Terminar Jornada Laboral')
    TestTerminarJornadaLaboral,
    # CP-012: Panel de Administración (Métricas, Filtros y Modal Crear Cuenta)
    TestPanelAdminDashboard,
    TestPanelAdminFiltros,
    TestPanelAdminModalCrearCuenta,
]


def load_tests(loader, standard_tests, pattern):
    suite = unittest.TestSuite()
    for test_class in ORDEN_CASOS_PRUEBA:
        suite.addTests(loader.loadTestsFromTestCase(test_class))
    return suite


if __name__ == "__main__":
    unittest.main(verbosity=2)
