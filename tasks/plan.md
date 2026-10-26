# Plan técnico — NexoHarness Codex Desktop

**Estado:** aprobado por el usuario; implementación de base en curso desde el 2026-10-26.
**Base:** `SPEC.md` y `CAPABILITY-MAP.md`, aprobados por el usuario el 2026-10-26.
**Alcance:** Codex Desktop en Windows. El checkout anterior permanece intacto.

## Resumen

Crear un plugin personal/local de Codex Desktop desde una única fuente local en este repo. La CLI confirmó marketplace, instalación y copia del paquete en un perfil aislado, así que el trabajo de catálogo, skills y perfiles nativos continúa; la invocación en Desktop sigue siendo un gate antes de declarar compatibilidad final. Importar capacidades instaladas y fuentes gratuitas solo después de revisar licencia, duplicación, permisos, dependencias y compatibilidad. Añadir MCP, workforce, eficiencia y Observer en incrementos verificables, con gates donde la superficie Desktop o las fuentes de workforce aún no estén confirmadas.

La documentación oficial vigente describe el marketplace repo-local en `.agents/plugins/marketplace.json`, un `plugin.json` portable en la raíz del plugin, skills bajo `skills/` y la instalación en caché. La compatibilidad concreta de descubrimiento e invocación se confirmará en la app instalada antes de depender de otros mecanismos: [guía de plugin y marketplace local](https://developers.openai.com/plugins/build/plugins), [plugins locales con MCP](https://developers.openai.com/plugins/deploy/desktop-only).

## Decisiones técnicas propuestas

1. **Un repo local fuente + un plugin Codex:** `.agents/plugins/marketplace.json` apunta a `./plugins/nexo-harness`; `plugins/nexo-harness/plugin.json` contiene el manifiesto portable y `skills/` los flujos empaquetados.
2. **No acoplarse a la biblioteca global:** el inventario global sirve como fuente de candidatos. Las copias aceptadas, licencias y recursos requeridos viven dentro del repo nuevo; no se crean enlaces a `~/.agents`, la caché de Codex ni a `Downloads`.
3. **Importador con procedencia antes de instalación masiva:** el catálogo registra source, commit, licencia, archivos incluidos, cambios, dependencias, permisos y resultado de evaluación. Cada candidato termina en conservar, adaptar, reemplazar o rechazar.
4. **Primer recorrido skills-only:** probar el plugin local con una skill propia pequeña antes de añadir procesos MCP. Reduce el riesgo de confundir problemas de marketplace, empaquetado y servidores locales.
5. **MCP por capacidad, local primero:** la habilidad describe el flujo; una CLI o función nativa gana frente a un MCP redundante. MCP remoto es optativo y la autenticación usa el flujo oficial de Codex; ningún secreto entra al repo.
6. **No asumir perfiles de subagentes compatibles en Desktop:** el soporte y formato se prueban en la app. MultiAgent Workforce y TAC Ops Server quedan detrás de un gate hasta recibir sus documentos/repos y comprobar contrato, licencia y superficie Codex.
7. **Medición antes de compresión:** fijar tareas de referencia y medir éxito, fidelidad y contexto; probar Playwright CLI/context-compress frente a herramientas existentes en un entorno aislado. La documentación de Responses API sobre `tool_search` no se trata como función garantizada de Codex Desktop.
8. **Observer en último lugar:** comenzar con datos sintéticos y evaluación local. La generación de candidatos puede automatizarse; promoción requiere aprobación explícita.
9. **Sin publicación universal:** instalar y probar desde marketplace local. Publicación/compartición externa se excluye del plan.

## Orden de trabajo y entregables

### Entregado en la base actual

- Marketplace/plugin local con tres skills; instalación desde la CLI verificada usando un perfil temporal aislado.
- Una skill externa de evaluación adaptada con referencias locales y licencia MIT empaquetada.
- Tres perfiles de agente Codex por proyecto, con concurrencia máxima 2 para este repo.
- Instalador y retiro conservador para roles; simulaciones ejecutadas sin escribir archivos.
- Catálogo con procedencia y herramienta doctor local en texto/JSON.
- Documentación inicial de arquitectura, workforce, instalación y compatibilidad.
- Evaluador local de contexto literal con fixtures sintéticos; no sustituye evaluación semántica ni mide tokens facturados.
- Registro MCP con tres integraciones observadas en sesión y un candidato oficial pendiente de precio; ninguno queda empaquetado.
- Evaluador de admisión de componentes y empaquetador ZIP local del plugin.

La lista detallada y los gates que siguen están en [`tasks/todo.md`](todo.md). La validación en Codex Desktop sigue pendiente.

### Fase 0 — Baseline de fuentes y entorno

- Registrar la estructura y documentación canónica del repo anterior, sin copiar el árbol ni modificarlo.
- Inventariar solo metadatos de skills, plugins, MCPs, CLI y conectores actualmente visibles en Codex; no leer secretos ni copiar configuraciones de cuenta.
- Clasificar los clones de investigación y fuentes instaladas por capacidad, licencia, versión, dependencias, permisos, red y solapamiento.
- Crear un registro de decisiones de importación para candidatos con una de cuatro decisiones: conservar, adaptar, reemplazar o rechazar.

**Primera lista de candidatos que debe auditarse, no instalarse en bloque:**

| Origen | Candidatos iniciales | Pregunta de evaluación |
|---|---|---|
| Capacidades Codex visibles | `a-team`, `aegis`, `agent-harness-skills` y la biblioteca de skills global | ¿Qué workflow concreto no esté cubierto ya? ¿La licencia permite una copia local? ¿Hay duplicación entre paquetes? |
| MCP/servicios que ya aparecen configurados | `codebase-memory`, `agent-deck`, `playwright`, `rea`, más GitHub/Cloudflare/Figma/Sentry | ¿El código puede empaquetarse localmente con licencia y dependencias completas? ¿Conviene referenciar la integración de Codex en vez de duplicarla? |
| Repos locales descargados | `context-compress`, `playwright-cli`, `superpowers`, servidores MCP de referencia | ¿Compatible con Codex Desktop Windows, seguro, mantenido y mejor que lo ya instalado? ¿Ahorra contexto sin pérdida crítica? |
| Opcionales con cuenta | GitHub MCP oficial, Context7 | GitHub ya tiene conector en Codex; evitar duplicar. Context7 ofrece una cuota gratis limitada y uso adicional de pago, por lo que no puede ser dependencia del núcleo. |

**Salida/gate:** lista revisable de componentes y mapa de dependencias. No se copia código de terceros hasta aprobar su fila.

### Fase 1 — Prueba del marketplace y compatibilidad Codex Desktop

- Construir el marketplace local mínimo y un plugin de skills-only con una skill de prueba propia.
- Abrir el repo desde la app Windows, seleccionar/instalar el plugin local y comprobar en una sesión nueva la invocación de la skill.
- Observar rutas de origen/caché, confianza del proyecto, actualización y reinicio requerido; registrar pasos que realmente funcionen.
- Probar de forma separada si la superficie Desktop permite los roles/perfiles de agente que necesita el harness, sin instalar MCP ni hooks.

**Estado:** la ruta marketplace → lista → instalación en caché se comprobó por CLI con `CODEX_HOME` aislado y hashes fuente/caché idénticos. La prueba visual de Desktop y la invocación real de skill/perfiles siguen pendientes.

**Salida/gate:** informe de compatibilidad en `docs/codex-desktop-compatibility.md`. La evidencia CLI permite desarrollar el catálogo y el paquete; Desktop sigue siendo requisito para declarar compatibilidad de interfaz.

### Fase 2 — Núcleo y catálogo local

- Definir el manifiesto de componente y validadores deterministas para licencias, rutas internas, referencias y campos obligatorios.
- Implementar el registro del catálogo y el proceso de importación selectiva para componentes aprobados.
- Mantener contenido fuente de terceros, avisos de licencia y adaptaciones auditables en carpetas locales propias.
- Añadir la detección de duplicados contra capacidades ya empaquetadas en el plugin.

**Salida/gate:** un componente no sensible se reconstruye desde el catálogo local; borrar/renombrar la biblioteca global no rompe el plugin.

### Fase 3 — Workforce y flujo de trabajo

- Elegir roles de Codex pequeños y con límites de archivos, herramientas y handoff explícitos.
- Implementar primero un flujo de una sola agente y uno que sí permita trabajo paralelo independiente.
- Medir el coste de coordinación frente al trabajo secuencial y mantener paralelismo bajo.
- Incorporar MultiAgent Workforce/TAC Ops solo después de comparar sus contratos y elegir cómo se traducen a mecanismos Codex Desktop comprobados.

**Salida/gate:** una ejecución completa termina con síntesis y evidencia de verificación; la alternativa secuencial sigue disponible si la delegación no aporta.

### Fase 4 — MCP y capacidades externas

- Auditar los MCP locales actuales y candidatos externos; detectar la función exacta que cubren y los duplicados.
- Añadir solo un MCP local a la vez, empaquetando sus scripts/artefactos/dependencias aprobadas bajo el plugin o excluyéndolo si exige rutas globales no aceptables.
- Mantener MCPs de cuenta como optativos, con mínimos permisos y auth gestionada por Codex. Confirmar comportamiento sin conexión y sin credencial.
- Implementar un doctor que reporte capacidad, disponibilidad y causa de fallo sin imprimir credenciales.

**Salida/gate:** prueba local de arranque, operación, apagado y límites de acceso; prueba remota de opt-in y fallo seguro, si el usuario la autoriza.

### Fase 5 — Eficiencia de contexto y evaluaciones

- Registrar baseline de calidad/contexto para tareas de repositorio, docs, pruebas y navegador.
- Probar filtros de salida conservadores, carga progresiva y CLI+skill frente al MCP actual.
- Evaluar context-compress en una copia aislada; iniciar en modo fijo sin llamadas a APIs y mantener acceso explícito a salida íntegra.
- Aceptar una optimización solo si preserva datos críticos y no baja calidad bajo el umbral acordado.

**Salida/gate:** reporte reproducible de tareas comparadas, con éxito, contexto aproximado, fidelidad, fallos y regresiones.

### Fase 6 — Instalador, doctor y ciclo de vida

- Convertir el plugin local de prueba en el paquete coherente del harness.
- Implementar validación, empaquetado, diagnóstico, actualización y retirada sin tocar configuraciones externas no aprobadas. El instalador actual solo copia perfiles de agentes a un proyecto indicado y conserva sus archivos existentes.
- Probar reinstalación, actualización de versión y rollback desde la app de escritorio.
- Documentar requisitos de trust, reinicio y ruta de actualización.

**Salida/gate:** instalación limpia desde el marketplace repo-local y reversión sin dejar cambios silenciosos fuera del plugin.

### Fase 7 — Observer y mejora continua

- Definir señales mínimas, privacidad, retención y borrado antes de recolectar eventos reales.
- Producir recomendaciones y candidatos/evals locales basados en evidencia reproducible.
- Hacer pruebas negativas para confirmar que Observer no cambia reglas, permissions, catálogo o código canónico sin aprobación.

**Salida/gate:** demo de candidato con comparación baseline/candidato, aprobador, decisión y rollback registrados.

## Grafo de dependencias

```text
inventario/licencias
        ↓
prueba marketplace + skill Desktop
        ↓
manifiesto/catalogo local → paquete de skills
                         ↘ workforce/perfiles Codex
                         ↘ MCP y doctor
                                  ↓
                       evals de calidad/contexto
                                  ↓
                          installer/rollback
                                  ↓
                        Observer y propuestas
```

Las fases 2–3 pueden avanzar en paralelo solo después de validar el contrato del plugin y el inventario. Las fases 4–6 dependen de pruebas Desktop y del catálogo. Observer espera la existencia de evals y de un recorrido instalado reproducible.

## Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Desktop difiere de Codex CLI en marketplace, perfiles, hooks o MCP local | Alto | Probar primero en la app real y limitar el MVP a superficies observadas. |
| Paquetes existentes duplican skills o implementaciones | Alto | Comparar por capacidad y propiedad funcional; no importar paquetes enteros. |
| Licencias de componentes descargados incompatibles o ambiguas | Alto | Registrar licencia por componente y excluir hasta resolverla. |
| Copiar el paquete local deja rutas absolutas o dependencias globales ocultas | Alto | Escaneo de paths/manifests y prueba aislada con globales inaccesibles. |
| MCP local ejecuta código con permisos del usuario | Alto | Permisos mínimos, allowlist local, revisión de scripts, pruebas negativas y pausa si no se puede limitar. |
| MCP remoto requiere pagos o expone datos | Alto | Ninguno requerido en core; auth opt-in y prueba de datos enviados antes de conectar. |
| Compresión de salida oculta errores o detalle necesario | Alto | Comparación con tareas iguales, retención/acceso al raw y modo conservador. |
| Subagentes aumentan tokens/retrabajo | Medio | Delegación condicionada a independencia; comparar contra ejecución secuencial. |
| Observer crea riesgo de privacidad o autoalteración | Alto | Evidencia local mínima, retención definida y promoción bloqueada por revisión humana. |
| El checkout viejo tiene muchos cambios sin commit que parecen candidatos | Alto | Mantenerlo intacto; basar la selección en archivos/revisiones concretos y no en una copia masiva. |

## Verificación por hitos

- **Checkpoint A (Fases 0–1):** usuario revisa tabla de importación y confirma plugin local + skill en Codex Desktop.
- **Checkpoint B (Fases 2–3):** revisar estructura local y primer flujo workforce antes de integrar MCPs.
- **Checkpoint C (Fases 4–5):** aprobar cada conexión externa y el tradeoff de compresión con evidencia.
- **Checkpoint D (Fases 6–7):** revisar instalación/rollback y el modelo de datos local del Observer antes de declarar el harness usable.

## Oportunidades de paralelización

- Se pueden evaluar licencias/solapamientos de fuentes distintas en paralelo una vez fijada la ficha del catálogo y con un candidato por responsable.
- Se puede auditar de forma independiente el empaquetado Codex y la calidad de contexto tras el plugin de prueba.
- No paralelizar cambios sobre el marketplace, el manifiesto compartido, configuración MCP, estado de Observer o archivos locales del usuario.
- Quien coordina integra fuentes, decide exclusiones y verifica el paquete completo.

## Preguntas pendientes antes de ampliar el paquete

- Recibir documentación/repos exactos de MultiAgent Workforce y TAC Ops Server.
- Confirmar el inventario de capacidades globales que se evaluarán como candidatas y mantener secretos fuera de la revisión.
- Elegir licencia del repo y formato de atribución.
- Confirmar en la UI el marketplace repo-local, la instalación en caché y la invocación de la skill inicial.
- Fijar baseline y umbral aceptable de calidad/fidelidad para optimizaciones de tokens.

La lista atómica actualizada vive en `tasks/todo.md`.
