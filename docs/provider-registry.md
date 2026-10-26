# Registro de MCPs y providers

`catalog/providers.json` conserva un inventario estructurado de providers observados durante esta sesión. No es configuración de Codex ni autoriza una conexión.

El registro marca Codebase Memory, Playwright y REA como `host-managed`, limita la evidencia al entorno de esta conversación y mantiene versión, licencia, precio o autenticación como desconocidos cuando no fueron comprobados. Por eso ninguno está incluido en el paquete. REA expone algunas acciones con efectos; se conserva ese límite en permisos.

OpenAI Developer Docs MCP figura como candidato oficial. Su documentación describe acceso anónimo y de solo lectura a documentación de OpenAI, pero no especifica el precio del servicio; tampoco hemos verificado su descubrimiento e invocación en Codex Desktop. Por eso sigue excluido. No se hizo ninguna conexión a ese endpoint. Consulta la [documentación oficial del servicio](https://developers.openai.com/resources/docs-mcp).

Valida el inventario sin red con:

```powershell
node .\tools\validate-providers.mjs
node .\tools\doctor.mjs
```

El validador también puede revisar otro JSON relativo al repo para comprobar rechazos; por ejemplo, `node .\tools\validate-providers.mjs catalog/providers-invalid-included.json` debe fallar porque no se puede incluir un provider con precio de servicio desconocido.

No se guardan endpoints privados, comandos de arranque, valores de entorno ni credenciales. Un provider nuevo necesita fuente verificable, licencia, coste, requisitos de cuenta, transporte, límites de datos y permisos antes de marcarse como aprobado o distribuirlo. Un provider empaquetado debe tener precio de servicio verificado como gratuito. La comprobación del doctor solo certifica el archivo local y no afirma que Codex Desktop tenga los mismos providers.
