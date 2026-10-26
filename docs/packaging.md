# Empaquetar el plugin local

El paquete distribuible es solo el plugin de Codex: `plugin.json`, skills incluidas en el catálogo, sus referencias y avisos/licencias dentro de `plugins/nexo-harness`. No incluye `.codex/` del proyecto, marketplace, herramientas de desarrollo, perfil de Codex ni credenciales.

Requiere Python 3.9 o posterior y usa únicamente la biblioteca estándar:

```powershell
python .\tools\package_plugin.py
python .\tools\package_plugin.py --json
```

El comando crea `dist/nexo-harness-<version>.zip`. Para una ruta concreta, usa `--output D:\ruta\nexo-harness.zip`. Si el destino ya existe, el script se detiene; `--force` lo reemplaza después de construir el ZIP temporal y verificarlo.

Antes de reportar éxito, el empaquetador comprueba que cada skill esté registrada, que sus referencias incluidas estén presentes, que no haya enlaces simbólicos ni rutas inseguras, que los nombres del ZIP coincidan con la fuente y que los bytes de cada archivo y su CRC se lean correctamente. Los paths se ordenan y se normalizan las fechas y permisos. El hash del ZIP puede diferir entre versiones de Python/zlib; compara los hashes de los archivos internos para verificar equivalencia entre toolchains.

Este artefacto permite distribuir el plugin. Los perfiles de agentes Codex y herramientas del harness permanecen en el repositorio y se instalan/documentan por separado; el ZIP no declara compatibilidad visual de Codex Desktop.

## Registro de verificación

El 2026-10-26, Python 3.14.9 generó dos ZIP a partir de la misma fuente. Ambos incluyeron ocho archivos, pasaron la comprobación de CRC/lectura y la comparación de bytes fuente, excluyeron los perfiles `.codex/` del proyecto y produjeron el mismo SHA-256 local. No se promete identidad binaria entre versiones de Python porque puede variar la implementación deflate.
