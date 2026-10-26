# Inventario inicial de capacidades y fuentes

**Fecha de referencia:** 2026-10-26
**Propósito:** baseline para decidir importaciones; no es manifiesto de instalación.
**Regla:** “disponible en el entorno” no significa copiado, integrado ni probado dentro del plugin.

## Decisiones iniciales

| Fuente/capacidad | Evidencia disponible | Decisión | Motivo / siguiente comprobación |
|---|---|---|---|
| A Team | `RBraga01/a-team`, caché local `awesome-codex-plugins/a-team/1.4.1`; manifiesto y `LICENSE` inspeccionados | No copiar | Versión 1.4.1, MIT. El paquete reúne muchos agentes y flujos; se solapa con Aegis, skills globales y el objetivo de una biblioteca pequeña. Revisar una skill concreta solo ante una brecha identificada. |
| Aegis | `GanyuanRan/Aegis`, caché local `awesome-codex-plugins/aegis/2.14.2`; `package.json`, manifiesto y `LICENSE` inspeccionados | No copiar | Versión 2.14.2, MIT. Método-pack grande con flujos ya disponibles en el entorno; el producto busca Codex-only y una selección menor. No importar el paquete entero. |
| Agent Harness Skills — `repo-harness-assessment` | `yfge/agent-harness-skills`, versión 0.2.0, commit `cbc6910e76cbc349bda44711f220265b62d60181`; fuente fijada y archivos requeridos inspeccionados | Adaptar e incluir la skill individual | MIT. La copia instalada tenía referencias ausentes; se usó el checkout fuente fijado. Se limitó el contenido a Codex/`AGENTS.md`, se retiraron rutas a skills no incluidas y se empaquetaron las referencias necesarias. No se copiaron instaladores, scripts ni otras skills. Atribución y licencia están en `THIRD-PARTY-NOTICES.md` y `plugins/nexo-harness/vendor/agent-harness-skills/LICENSE`. |
| Skills personales y de plugins Codex instalados | Catálogo visible de la sesión | No importar en bloque | Comparar capacidad por capacidad; las skills locales incluidas en el plugin deben ser copias autónomas con procedencia y sin referencias a la caché global. |
| Conectores de GitHub, Google Drive, Figma, Cloudflare y Sentry | Biblioteca global de Codex, revisión 2026-10-26 | Mantener como capacidades del entorno; no incluir un MCP duplicado | Se usarán solo cuando el usuario autorice y la tarea requiera la conexión. No copiar tokens, OAuth ni configuración personal. |
| `codebase-memory`, `agent-deck`, Playwright y REA | Herramientas/MCP disponibles en el entorno de trabajo | No empaquetar en la prueba mínima | Confirmar licencia, método de distribución, runtime local portable, permisos y brecha concreta antes de elegir alguno. |
| MCPs observados en esta sesión: Codebase Memory, Playwright y REA | Namespaces de herramientas visibles en esta sesión | Registrar como host-managed; no distribuir | El registro `catalog/providers.json` captura solo capacidades visibles. Licencia, versión, coste y configuración no se han verificado; esta observación no demuestra disponibilidad en Codex Desktop. |
| OpenAI Developer Docs MCP | Documentación oficial describe endpoint público, acceso anónimo y consultas de solo lectura | Candidato documentado; no integrar todavía | La página consultada no compromete que el servicio sea gratuito y Codex Desktop sigue sin comprobarse. No se conectó el endpoint. |
| `context-compress` | Repositorio de investigación local previamente descargado | No instalar ni ejecutar; mantener como candidato de evaluación | Revisar licencia y ruta sin API, riesgos de ejecución y fidelidad con datos sintéticos antes de considerar adaptación. |
| `playwright-cli` | Repositorio de investigación local previamente descargado | No empaquetar aún | Comparar contra Playwright MCP ya disponible; verificar versión, licencia, runtime Node y carga de contexto en tareas iguales. |
| `superpowers` y servidores MCP de referencia | Repositorios de investigación local previamente descargados | No importar como paquetes | Revisar licencia, compatibilidad Windows, mantenimiento, seguridad y solapamiento por componente. |
| Repositorio NexoHarness anterior | Checkout separado indicado por el usuario | Solo evidencia de diseño; no es dependencia | Revisar decisiones concretas; no copiar el árbol ni modificar ese checkout desde este proyecto. |
| MultiAgent Workforce y TAC Ops Server | Fuentes aún no entregadas por el usuario | Pendiente | Solicitar/revisar sus documentos y repos antes de tomar decisiones sobre protocolos, código o integración. |

## Componentes propios del primer paquete

| Componente | Origen | Versión | Licencia | Cambios | Dependencias | Destino |
|---|---|---|---|---|---|---|
| `harness-workflow` | Escrito para este proyecto con base en `AGENTS.md` y `SPEC.md` | 0.1.0 del plugin | Pendiente de licencia del repositorio | Original; no vendorizado | Formato `SKILL.md` de Codex | `plugins/nexo-harness/skills/harness-workflow/` |

El paquete no incluye por ahora componentes de terceros. Al resolver la licencia del repositorio, completar la fila propia y conservar atribución obligatoria de cada futura importación.
