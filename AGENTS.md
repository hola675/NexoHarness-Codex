# NexoHarness Codex — instrucciones del repositorio

## Alcance

- Este producto apunta exclusivamente a OpenAI Codex.
- Usa el NexoHarness anterior como evidencia y material de evaluación, no como árbol de origen ni dependencia de ejecución.
- Revisa y migra componentes uno por uno. No copies un catálogo completo ni dupliques una capacidad ya presente en el entorno Codex.
- Mantén los componentes seleccionados y sus archivos de soporte dentro de este repositorio o dentro del proyecto donde se instale el harness. No dependas de symlinks ni de rutas personales externas.
- Las credenciales nunca se copian, registran ni incluyen en paquetes. Los MCP remotos o servicios con cuenta se declaran opcionales.

## Reglas de trabajo

- Mantén clara la separación entre reglas, skills, roles de agente, flujos, herramientas/MCP, adaptadores, evaluaciones y estado runtime.
- Registra para cada componente de terceros su origen, versión o commit, licencia, modificaciones, dependencias y destino local.
- No ejecutes instaladores de una fuente nueva para inspeccionarla.
- Prefiere capacidades locales, gratuitas y de menor privilegio; verifica disponibilidad, licencia, permisos y coste del servicio antes de integrarlas.
- Optimiza contexto mediante carga bajo demanda, herramientas acotadas y salidas pequeñas; mide fidelidad además del ahorro de tokens.
- Los subagentes solo reciben tareas acotadas e independientes; quien coordina integra y verifica.
- La observación puede proponer cambios y generar evaluaciones. Nunca se autoaprueban cambios canónicos, permisos o reglas de seguridad.
- No declares que algo está instalado, integrado, validado o listo para usar sin evidencia de Codex en la superficie objetivo.

## Estado actual

El mapa de capacidades, la especificación y el plan están aprobados. La base del harness incluye marketplace/plugin local, tres skills, tres roles de agente Codex por proyecto, instalador/retiro de roles, catálogo, doctor, evaluación local de contexto/candidatos, empaquetado del plugin y registro local de MCPs observados. La CLI confirmó descubrimiento e instalación desde una fuente local aislada. Falta confirmar en Codex Desktop el descubrimiento e invocación de skills y roles siguiendo `docs/codex-desktop-compatibility.md`. Revisa `CAPABILITY-MAP.md` y `SPEC.md` antes de ampliar contratos o incorporar componentes.
