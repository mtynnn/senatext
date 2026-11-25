param(
    [string]$BackendDir = (Join-Path $env:LOCALAPPDATA 'SeñaText/backend-v2')
)
$ErrorActionPreference = 'Stop'
$apiPath = Join-Path $BackendDir 'api_local.py'
$source = [IO.File]::ReadAllText($apiPath)
$marker = '# Respuestas generales en todos los contextos de la API local.'
if ($source.Contains($marker)) {
    Write-Output 'La API local ya incluye las respuestas generales. Reinicia el backend si sigue abierto.'
    exit 0
}
$anchor = 'SENATEXT = SenaText(PAQUETE_DIR)'
if (-not $source.Contains($anchor)) { throw 'API local no reconocida: falta la instancia SenaText.' }
$block = @'
# Respuestas generales en todos los contextos de la API local.
for _contexto, _clases in SENATEXT.config['grupos'].items():
    if _contexto != 'comunicacion':
        SENATEXT.config['grupos'][_contexto] = list(dict.fromkeys(_clases + SENATEXT.config['grupos']['comunicacion']))
print('POLITICA: respuestas generales habilitadas en todos los contextos', flush=True)
'@
$backup = "$apiPath.antes-comunicacion.bak"
if (-not (Test-Path -LiteralPath $backup)) { Copy-Item -LiteralPath $apiPath -Destination $backup }
[IO.File]::WriteAllText($apiPath, $source.Replace($anchor, $anchor + "`n" + $block), [Text.UTF8Encoding]::new($false))
Write-Output 'API local actualizada. Reinicia el backend. Pesos y config.json originales sin cambios.'
