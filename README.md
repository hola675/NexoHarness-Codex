# NexoHarness Codex

Harness local, instalable y verificable para la aplicación de escritorio de OpenAI Codex en Windows. Este repositorio es un proyecto nuevo: estudia el NexoHarness anterior como referencia y migra solo decisiones y componentes aprobados; no copia ni depende de su checkout.

## Objetivo

Reunir en este repositorio las skills, roles de agente, flujos, MCPs locales y adaptadores que seleccionemos para Codex, con procedencia, licencias y versiones visibles. El plugin se probará desde un marketplace local del repo; sus componentes empaquetados no dependerán de rutas o enlaces a carpetas globales. Los servicios que requieran cuenta o conexión externa se declararán opcionales y nunca incluirán credenciales.

## Estado

**Estado: paquete local comprobado por CLI y ZIP verificado; base del harness implementada.** Codex instaló las tres skills y sus referencias desde este repo en un perfil temporal aislado. El empaquetador verificó los ocho archivos del plugin y reprodujo el mismo hash en dos construcciones locales. El doctor, el catálogo y los modos de simulación de instalar/retirar agentes pasan comprobaciones. Falta confirmar que Codex Desktop descubre e invoca las skills y los perfiles en una sesión de proyecto.

## Punto de partida

- [Mapa de capacidades](CAPABILITY-MAP.md)
- [Especificación del producto](SPEC.md)
- [Plan técnico](tasks/plan.md)
- [Lista de trabajo](tasks/todo.md)
- [Inventario inicial de fuentes](catalog/source-inventory.md)
- [Catálogo de componentes](catalog/components.json)
- [Avisos de terceros](THIRD-PARTY-NOTICES.md)
- [Arquitectura y límites de ejecución](docs/architecture.md)
- [Roles y workforce Codex](docs/workforce.md)
- [Instalación en otros proyectos](docs/installing.md)
- [Compatibilidad Codex Desktop](docs/codex-desktop-compatibility.md)
- [Evaluación local de contexto](docs/context-evaluations.md)
- [Registro y evaluación inicial de componentes](docs/component-intake.md)
- [Empaquetado del plugin](docs/packaging.md)
- [Registro de MCPs y providers](docs/provider-registry.md)
- [Instrucciones del repositorio](AGENTS.md)

## Prueba local

La fuente del marketplace está en `.agents/plugins/marketplace.json` y apunta a `plugins/nexo-harness`. Sigue [la guía de instalación local](docs/codex-desktop-compatibility.md) para añadir la carpeta del repositorio en Codex Desktop. La app instala una copia en su caché; esta carpeta continúa siendo la fuente editable.

Valida el catálogo local con `node tools/validate-catalog.mjs`.
Revisa el estado local del harness con `node tools/doctor.mjs` o `node tools/doctor.mjs --json`.
Compara una salida original y candidata con `node tools/evaluate-context.mjs <original.txt> <candidata.txt> <hechos-criticos.txt>`.
Revisa si una ficha de componente tiene los datos mínimos con `node tools/check-candidate.mjs <candidato.json>`.
Empaqueta y verifica el plugin con `python tools/package_plugin.py` (Python 3.9 o posterior).

## Política de mejora

El sistema podrá recoger señales locales, generar propuestas y ejecutar evaluaciones. No cambiará sus propias reglas, permisos o componentes canónicos sin una revisión y aprobación explícitas.

## Licencia

La licencia del contenido propio del repositorio está pendiente de decisión. Hasta que se añada una licencia raíz, no se concede permiso general para reutilizarlo. Los componentes de terceros conservan sus licencias y avisos individuales; la skill adaptada de Agent Harness Skills se distribuye bajo MIT y lleva su aviso dentro del plugin.
