# Mapa de capacidades — NexoHarness Codex

**Estado:** aprobado por el usuario el 2026-10-26. Superficie inicial: app de escritorio de Codex en Windows. La especificación del producto pasa ahora a revisión.

## Objetivo del producto

Crear un harness local y portable que reúna capacidades seleccionadas para Codex, permita instalarlas desde un marketplace local del repo y las opere con flujos de trabajo verificables. La instalación inicial se valida en la app de escritorio de Codex sobre Windows. La fuente del plugin no dependerá de carpetas globales, symlinks ni archivos del NexoHarness anterior. Puede usar servicios en línea con cuenta solo como integraciones opcionales, declaradas y sin credenciales empaquetadas.

## Principios heredados que vale conservar

Del repo anterior conservaría como principios —no como copia íntegra del producto— la fuente de verdad controlada, separación entre definiciones y herramientas, trazabilidad de procedencia, adaptación nativa a Codex, evaluación basada en evidencia y mejora continua mediante propuestas revisadas. Su política de no auto-promoción se conserva como límite de seguridad.

## Módulos propuestos

| ID | Responsabilidad | Depende de |
|---|---|---|
| `codex-core` | Reglas, contratos, límites de autoridad, formatos y criterios comunes del harness Codex | — |
| `capability-catalog` | Inventariar, evaluar e importar copias locales de skills, agentes, plugins, MCP y utilidades; detectar duplicados; registrar licencia, versión, origen y cambios | `codex-core` |
| `codex-adapter` | Producir la configuración y los paquetes nativos que Codex descubre, sin rutas personales ni enlaces externos | `codex-core`, `capability-catalog` |
| `workforce` | Seleccionar roles Codex y coordinar tareas independientes, handoffs, síntesis y verificación | `codex-core`, `codex-adapter` |
| `mcp-operations` | Registrar MCPs locales y proveedores externos opcionales, sus capacidades, permisos, autenticación y disponibilidad | `codex-core`, `capability-catalog`, `codex-adapter` |
| `context-efficiency` | Carga progresiva, selección de skills y herramientas, límites de salida, resúmenes y evaluación de coste/fidelidad | `codex-core`, `codex-adapter`, `workforce` |
| `installer-doctor` | Instalar, inspeccionar, actualizar y retirar el conjunto local de forma acotada y recuperable | `codex-adapter`, `capability-catalog`, `mcp-operations` |
| `observer-evals` | Registrar señales locales, comparar calidad/uso de contexto y proponer mejoras con evaluaciones y revisión antes de promoción | `codex-core`, `workforce`, `context-efficiency` |

La primera entrega probará el plugin desde `.agents/plugins/marketplace.json` y una ruta de origen dentro del propio repo. No incluye publicación pública en el directorio universal de plugins.

## Orden inicial propuesto

1. Aprobar o corregir este mapa y las preguntas abiertas.
2. Especificar `codex-core` y el manifiesto de procedencia del catálogo.
3. Diseñar la importación local selectiva y el adaptador nativo de Codex.
4. Añadir los roles/workforce y el registro mínimo de MCPs.
5. Medir eficiencia de contexto y comportamiento antes de integrar compresión automática.
6. Añadir instalador/doctor y, después, observer/evals con propuestas revisables.

## Límites

- Un componente encontrado o descargado no se considera integrado hasta que su código, licencia, dependencias, permisos y comportamiento se hayan revisado.
- El paquete de salida debe contener sus dependencias locales necesarias. Los secretos y servicios remotos no se convierten en archivos vendorizados.
- MCP es una forma posible de proporcionar herramientas, no un requisito para cada capacidad; preferir una CLI o una función nativa de Codex si ofrece el mismo resultado con menos superficie y contexto.
- La compresión puede omitir datos importantes. Toda opción debe tener modo conservador, recuperación de detalle y una evaluación de fidelidad.
- La mejora automática puede observar, clasificar, generar candidatos y ejecutar pruebas aisladas; la promoción de reglas, permisos o contenido canónico requiere revisión explícita.
- El checkout anterior permanece intacto. Ningún archivo se copiará desde allí sin selección y trazabilidad.

## Preguntas abiertas para la especificación

1. ¿Qué son exactamente “MultiAgent Workforce” y “TAC Ops Server” en la documentación y el repo que faltan por revisar, y qué límites de licencia tienen?
2. ¿Qué skills, plugins y MCP instalados se deben empaquetar? Se hará inventario y decisión componente por componente.
3. ¿Qué estado local puede persistir el Observer, durante cuánto tiempo y con qué forma de borrado/exportación?
4. ¿Qué prueba de referencia definirá éxito y ahorro de tokens sin degradar la tarea?
5. ¿Qué licencia tendrá el nuevo repo y cómo atribuiremos componentes adaptados?

## Criterios de aceptación del mapa

- El producto apunta solo a Codex y la primera superficie queda identificada antes de certificar compatibilidad.
- Cada módulo tiene responsabilidad única, dependencias en una sola dirección y consumidor identificable.
- Los componentes seleccionados pueden instalarse desde el proyecto sin leer carpetas globales o enlaces externos.
- Integraciones con cuenta, credenciales o API están separadas del paquete local y pueden omitirse.
- El ahorro de tokens se mide junto a fidelidad y calidad; no se acepta una reducción de contexto que rompa las tareas.
- El Observer no puede promover sus propios cambios ni ampliar permisos.
