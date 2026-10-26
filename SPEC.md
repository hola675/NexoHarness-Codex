# Especificación — NexoHarness Codex Desktop

**Estado:** aprobada por el usuario el 2026-10-26
**Superficie inicial:** aplicación de escritorio de Codex en Windows
**Repositorio:** proyecto nuevo; el NexoHarness anterior es material de referencia evaluado, no una dependencia ni una copia del árbol.

## 1. Objetivo

Construir un harness de trabajo instalable en Codex Desktop que reúna componentes seleccionados de la biblioteca global de Codex y fuentes públicas revisadas. El proyecto mantiene copias locales, versiones, licencias y procedencia de cada componente aceptado. Después de instalar el paquete local, Codex no depende de las carpetas globales originales, symlinks, checkout anterior ni ZIP de investigación.

Las capacidades que necesitan una cuenta, credencial o servicio en línea son opcionales. El paquete nunca contiene secretos. La experiencia base no requiere comprar una API, MCP comercial, plugin con licencia propietaria ni servicio SaaS adicional; usar modelos sigue sujeto a la cuenta y límites existentes de Codex.

El harness debe coordinar skills, agentes Codex y MCPs seleccionados, ahorrar contexto sin degradar resultados y aprender de ejecuciones. Puede generar observaciones, candidatos y evaluaciones; no puede promocionar por sí solo cambios canónicos, permisos o reglas de seguridad.

## 2. Usuarios y escenarios

1. **Preparar Codex:** abrir el proyecto local, añadir su marketplace a la app y ver el plugin NexoHarness en la lista local.
2. **Instalar en Codex Desktop:** instalar el plugin desde ese marketplace; la app coloca una copia de instalación bajo su caché local. La fuente de verdad editable continúa en este repo.
3. **Usar en un proyecto:** invocar una skill relevante; el flujo elige herramientas y agentes incluidos sin consultar la antigua instalación global.
4. **Conectar un servicio opcional:** autorizar un MCP externo desde Codex si el usuario decide activarlo; si no hay red o credencial, las capacidades locales siguen disponibles.
5. **Mejorar el harness:** analizar métricas locales, sugerir cambios, generar evaluaciones y esperar revisión explícita antes de promocionar una modificación canónica.

## 3. Alcance de la primera versión

### Incluye

- Un plugin local de Codex Desktop publicado en el marketplace del propio repositorio.
- Skills y recursos locales con carga progresiva.
- Roles de agente y contratos de handoff compatibles con la superficie Codex comprobada.
- Registro de MCP/providers locales y remotos, con capacidades, efectos, autenticación y estado.
- Catálogo de componentes importados con versión, commit, licencia, procedencia, modificaciones, permisos, dependencias y pruebas.
- Importación selectiva de las skills, plugins y servidores ya presentes en la máquina del usuario y de fuentes gratuitas aprobadas.
- Flujos de trabajo para orientar, planificar, implementar, revisar y verificar; workforce usa agentes solo cuando el trabajo se puede dividir en partes independientes.
- Límites de contexto y salida, y evaluación de fidelidad frente al ahorro de tokens.
- Instalación, diagnóstico, actualización y retirada del plugin local de forma documentada y reversible.
- Observer local que redacta propuestas y evaluaciones, sin auto-promoción.

### Fuera de alcance inicial

- Claude Code, Gemini, DeepSeek, Kilo u otros clientes.
- Marketplace público, publicación universal o servicio alojado propio.
- MCP, skills o código propietario, de pago o cuya licencia no permita el uso previsto.
- Requerir API keys comerciales para que funcionen las capacidades base.
- Importar en bloque todos los plugins, MCPs o skills instalados.
- Copiar credenciales, perfiles de navegador, sesiones OAuth, configuración personal, datos de proyectos o memoria privada.
- Cambiar automáticamente permisos, reglas canónicas o código del harness desde el Observer.

## 4. Distribución y dependencia local

La primera prueba usará el marketplace repo-local documentado por OpenAI:

```text
.agents/plugins/marketplace.json
plugins/nexo-harness/plugin.json
plugins/nexo-harness/skills/
plugins/nexo-harness/mcp.json          # solo si el paquete incluye MCPs aprobados
plugins/nexo-harness/vendor/           # copias revisadas de terceros, cuando hagan falta
```

El marketplace apunta a `./plugins/nexo-harness`, una ruta dentro del repo. Codex Desktop instala una copia en su caché local; no se usarán rutas personales, symlinks o el directorio del repo anterior para satisfacer dependencias de ejecución. Cada instalación se debe poder reconstruir desde el repo nuevo y las dependencias fijadas que incluya.

Los plugins locales se distribuyen mediante el marketplace personal o del repositorio para autoría y prueba. La publicación pública no forma parte de esta especificación. La documentación vigente de OpenAI define `plugin.json` portable en la raíz, skills en `skills/`, marketplace repo-local en `.agents/plugins/marketplace.json` e instalación en la caché local de Codex. El paquete de prueba seguirá ese formato; la disponibilidad concreta en Codex Desktop se debe confirmar en la aplicación.

## 5. Stack y comandos propuestos

- **Artefacto de usuario:** plugin de Codex con JSON y Markdown (`plugin.json`, `marketplace.json`, `SKILL.md`) y recursos locales.
- **Herramientas del repo:** Node.js `>=22.12.0` y pnpm `11.21.0`; scripts de validación pequeños, deterministas y sin red por defecto. La compatibilidad concreta con Codex Desktop queda sujeta a la primera prueba local.
- **MCP local:** incluir ejecutables y dependencias necesarias dentro del plugin, o excluir el MCP si no se puede empaquetar y lanzar sin rutas globales. Un servicio remoto no se considera local y debe permanecer opcional.
- **Comandos que el primer scaffold deberá proveer:**

```powershell
pnpm install --frozen-lockfile
pnpm run validate
pnpm test
pnpm run package
```

`validate`, `test` y `package` se implementarán y documentarán antes de afirmar que funcionan. La prueba de instalación se realiza desde la UI de plugins de Codex Desktop y confirma visualmente el origen local, descubrimiento de skills y funcionamiento del flujo principal.

## 6. Estructura de producto propuesta

```text
AGENTS.md                     Reglas de desarrollo del repo
README.md                     Inicio rápido y estado comprobado
CAPABILITY-MAP.md             Mapa modular aprobado
SPEC.md                       Esta especificación
docs/                         Arquitectura, instalación, seguridad y operación
.agents/plugins/              Marketplace local de Codex Desktop
plugins/nexo-harness/         Plugin distribuible con sus recursos locales
catalog/                      Registro y fuentes aprobadas para importación
evals/                        Casos de calidad, fidelidad y coste de contexto
tests/                        Validación estructural, seguridad y regresiones
tools/                        Importador, validador, doctor, empaquetador
```

La organización final se ajustará al scaffold del plugin Codex y a la separación del [mapa de capacidades](CAPABILITY-MAP.md). Los archivos generados por el empaquetador no serán editables como fuente.

## 7. Selección e importación de componentes

Todo componente candidato recibe una decisión individual: conservar, adaptar, reemplazar o rechazar. La revisión comprueba:

- licencia, copyright y obligación de atribución;
- origen verificable, versión/commit y mecanismo de actualización;
- archivos que ejecuta, dependencias, red, permisos y destino de datos;
- compatibilidad con Codex Desktop en Windows;
- duplicación funcional con skills, MCPs, plugins y conectores ya disponibles;
- valor observable para tareas reales y coste de contexto.

Solo los aceptados se copian al repo nuevo. Se preservan los avisos de licencia y se registra qué se adaptó. La fuente original queda accesible como referencia, pero la ejecución del plugin usa la copia revisada incluida en el nuevo repo. Un componente retirado puede eliminarse del paquete solo después de comprobar que no tiene consumidores.

## 8. Reglas de workforce y MCP

- El coordinador decide la tarea, divide trabajo independiente, asigna a un agente un límite de archivos y consolida sus resultados.
- Cada rol tiene objetivo, entradas, límites, herramientas permitidas y forma de handoff; no se crean agentes genéricos para reemplazar el trabajo del coordinador.
- La concurrencia se mantiene baja y justificada: el paralelismo puede reducir tiempo, pero puede elevar el uso de tokens.
- Cada provider declara qué capacidades ofrece; la disponibilidad de una herramienta no concede autorización.
- MCP local y remoto se configura con el mínimo acceso. El remoto requiere consentimiento/autorización del usuario y usa OAuth o la autenticación oficial; no guarda secretos en el repo.
- No duplicar conectores de Codex mientras ya cubran la operación.
- Los documentos “MultiAgent Workforce” y “TAC Ops Server” se integrarán cuando el usuario comparta sus fuentes. No se presupone su protocolo, API, licencia ni semántica.

## 9. Eficiencia de contexto y tokens

El sistema busca reducir carga innecesaria, no maximizar compresión a cualquier precio:

1. Mantener breve el contexto siempre activo; colocar procedimientos largos en skills activadas bajo demanda.
2. Usar herramientas nativas/CLI de salida acotada cuando eviten esquemas MCP grandes o snapshots extensos.
3. Definir límites y filtros deterministas para logs, listados, diffs y resultados de pruebas; permitir consultar el detalle original cuando se necesite.
4. Delegar solo tareas independientes cuyo contexto separado compense el coste de crear y sintetizar agentes.
5. Medir bytes/tokens estimados de contexto, llamadas, éxito, calidad, datos críticos conservados y retrabajo. No presentar estimaciones como tokens facturados.
6. Comparar baseline con cada optimización sobre la misma batería de tareas. Bloquear una optimización si pierde información que cambia decisiones o baja la tasa de éxito.
7. Los compresores locales se prueban con datos sintéticos y tareas reales no sensibles antes de importar. Ningún modo que llame a APIs se activa en el camino base.

La guía de OpenAI describe `tool_search` diferido para la Responses API; esta especificación no lo presupone en el plugin de Codex Desktop. La referencia de [Playwright CLI](https://github.com/microsoft/playwright-cli) documenta el intercambio CLI+skill frente a MCP; se comparará con el Playwright MCP que ya está instalado.

## 10. Observación y mejora

El Observer guarda solo señales de ejecución necesarias y configurables, preferentemente locales. El flujo permitido es:

```text
evento local → patrón → hipótesis → propuesta → evaluación aislada → comparación → revisión humana → promoción explícita
```

Una propuesta contiene evidencia, impacto esperado, archivos afectados, riesgo, prueba, coste y reversión. Las ejecuciones fallidas y las propuestas rechazadas pueden conservarse localmente según política de retención. Las métricas no contienen prompts completos, secretos ni código de otros proyectos por defecto.

## 11. Estrategia de evaluación

- **Estructural:** validar manifests, rutas relativas dentro del plugin, `SKILL.md`, registros de procedencia, licencias y dependencias incluidas.
- **Aislamiento:** probar desde un directorio de prueba donde las rutas globales antiguas no estén disponibles; confirmar que el plugin local sigue funcionando.
- **Desktop:** instalar desde el marketplace del repo en Codex Desktop sobre Windows, abrir una sesión nueva y verificar descubrimiento/invocación.
- **MCP:** comprobar arranque y cierre local, permisos, ausencia de secretos, modo sin conexión, errores y acceso fuera del directorio permitido.
- **Workforce:** evaluar una tarea secuencial y otra realmente paralelizable; comprobar ownership, handoffs, síntesis y verificación final.
- **Contexto:** ejecutar la misma batería con/sin cada optimización; medir calidad, fidelidad y uso de contexto. Los datos de ahorro del autor de una herramienta externa no cuentan como evidencia propia.
- **Mejora:** verificar que Observer solo produce candidatos y que un candidato no cambia canonical source sin aprobación.
- **Entrega:** comprobar instalación, actualización, desinstalación, repetición idempotente y rollback.

## 12. Límites de autoridad

- **Siempre:** trabajar con el repo nuevo; seguir licencia y procedencia; mantener componentes offline; pedir aprobación antes de enviar mensajes, publicar o cambiar datos externos; verificar cualquier afirmación de integración.
- **Requiere aprobación explícita:** conectar cuentas de terceros, habilitar MCP con escritura, mandar prompts/datos a servicios externos, cambiar configuración global de Codex, publicar o compartir el plugin, promover cambios canónicos del Observer.
- **Nunca:** copiar credenciales/cookies; ejecutar código de terceros sin revisión; instalar todo un catálogo; cruzar datos entre proyectos sin autorización; autoelevar permisos; afirmar certificación sin prueba en la app Desktop objetivo.

## 13. Criterios de éxito

1. Un usuario instala y prueba el paquete local desde Codex Desktop en Windows siguiendo el README, sin acceder al checkout viejo, a `Downloads`, a la caché de plugins existente ni a symlinks.
2. Cada componente integrado tiene copia local, licencia, origen, versión y límites de permisos registrados.
3. La experiencia local principal funciona sin cuentas o MCP remotos adicionales.
4. Las integraciones remotas son optativas, tienen una ruta de autenticación segura y se pueden omitir sin romper el núcleo.
5. Los agentes completan una tarea de referencia con handoffs y verificación trazables.
6. Toda mejora de tokens preserva los datos críticos y mantiene la calidad dentro del umbral fijado en los evals.
7. Observer puede producir un candidato reproducible y la prueba demuestra que no lo promociona automáticamente.
8. La instalación/remoción es reproducible y no deja configuración global fuera de lo documentado y aceptado por el usuario.

## 14. Suposiciones y preguntas abiertas

### Suposiciones explícitas

1. Windows y la app de escritorio de Codex son el único objetivo inicial.
2. El usuario puede seleccionar el marketplace local del repositorio desde la Plugins Directory de Codex Desktop.
3. El repo nuevo será la fuente canónica de componentes empaquetados; la caché que Codex crea al instalar es un derivado local de ese repo.
4. Se prefiere que el núcleo funcione sin APIs pagas ni credenciales; las suscripciones/uso normal de Codex quedan fuera del coste adicional de NexoHarness.
5. El Observer puede automatizar la generación de propuestas y evals, pero no promover reglas, permisos ni componentes por sí mismo.

### Pendiente de resolver

1. Recibir la documentación y fuentes concretas de “MultiAgent Workforce” y “TAC Ops Server”.
2. Construir el inventario exacto del entorno Codex actual y aprobar cada decisión de importación.
3. Acordar la licencia del repo nuevo y el formato de avisos de terceros.
4. Determinar si el primer paquete incluirá un MCP local y qué runtime Windows puede empaquetarse sin instalación global.
5. Definir retención, exportación y borrado del estado del Observer.
6. Fijar el umbral de fidelidad y los evals de referencia antes de aceptar compresión.

## Referencias oficiales y fuentes revisadas

- [Plugin Codex y marketplace local de repo](https://developers.openai.com/plugins/build/plugins)
- [Plugins de escritorio con MCP local](https://developers.openai.com/plugins/deploy/desktop-only)
- [Tool search diferido de la Responses API](https://developers.openai.com/api/docs/guides/tools-tool-search)
- [Selección de tareas multiagente](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- [Playwright CLI + skills](https://github.com/microsoft/playwright-cli)
- [Context Compress](https://github.com/Open330/context-compress)
- [Servidores MCP de referencia y avisos](https://github.com/modelcontextprotocol/servers)
