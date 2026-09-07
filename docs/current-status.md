# Estado actual y relevo de implementación

Actualizado: 7 de septiembre de 2026 (UTC).

## Objetivo activo — recuperación breve para cerrar la ruta inicial

La ruta inicial de solfeo ya puede comprobarse de punta a punta: pulso,
dirección melódica, notas naturales, lectura inicial y lectura rítmica están
publicados, sembrados y ordenados. El siguiente incremento técnico es una
recuperación breve que reúna escucha y lectura mediante ejercicios existentes,
sin medir tempo, ejecución, MIDI ni audio.

Implementación publicada: `rhythm_count` presenta negras, blancas,
redondas y silencios de negra, y pide sumar los pulsos escritos. Añade el quinto
tema y la lección «Cuenta figuras y silencios» al seed. API `ddeee3f` y
frontend `e53aea7` están en GitHub; la API pública de Render respondió salud.
API aprobó 20 pruebas unitarias, compilación y 4 e2e; frontend aprobó
compilación con Node 20.19.5. Durante la publicación, la sesión de
automatización del navegador se reinició y el canal administrativo local no
tenía clave; el endpoint rechazó correctamente una llamada sin credencial con
401, sin alterar contenido.

El seed se ejecutó posteriormente desde administración. La API pública confirmó
el tema 28 en posición 5, la práctica `rhythm_count` 14 y la lección 15. Una
corrida de invitado cargó el patrón `half + half`, opciones 3/4/5 e instrucciones
sin audio; no se envió respuesta ni se alteró progreso.

Implementación publicada: el seed añade «Repaso: escucha y lectura»
en posición 6, con una práctica de dirección y otra de lectura de nota en clave
de sol dentro de la misma lección. API aprobó 20 pruebas unitarias, compilación
y 4 e2e; no altera contratos ni agrega evaluación de interpretación.

El seed final confirmó el tema 39 en posición 6, dos prácticas (dirección
melódica y lectura en clave de sol) y la lección 24. Sus cuatro bloques fueron
consultados por API pública en orden: explicación, escucha, lectura y recap.
No se enviaron respuestas ni se alteró progreso durante la verificación.

Implementación pendiente de publicar: el detalle de lección resuelve el
siguiente enlace entre temas y la interfaz lo presenta. El seed ajusta la
cadena completa pulso → dirección → notas → lectura → ritmo → repaso. API
aprobó 20 pruebas unitarias, compilación y 4 e2e.

Avances confirmados desde el último relevo:

- La API publicada `93b7ffd` añadió al seed idempotente dos temas, dos
  ejercicios y dos lecciones: «Las siete notas naturales» y «Cinco notas en
  clave de sol». Render confirmó ese despliegue y el seed se ejecutó desde
  administración.
- Producción muestra los temas, sus lecciones y prácticas. Se comprobó la
  carga de ambos runners sin enviar respuestas ni modificar progreso.
- El núcleo técnico de práctica ya incluye feedback accionable para los seis
  tipos existentes, cola explicable, estados por habilidad y pruebas de
  contrato HTTP.

Implementación de `rhythm_pulse`, publicada y pendiente de siembra remota:

- API: tipo, normalización, generación determinista de un silencio en cuatro
  pulsos, evaluación por `pulsePosition`, revelación explícita y seed
  idempotente con la lección «Cuatro pulsos y un silencio» publicados como
  `f96cf04`.
- Frontend: contratos, botones de respuesta, patrón con posición vacía y
  formulario administrativo publicados como `2727738`.
- Validación técnica: API aprobó 19 pruebas unitarias, compilación y 4 pruebas
  e2e; frontend aprobó `npm run build` con Node 20.19.5. React Doctor no pudo
  inicializar su binding temporal de `oxc-parser` en macOS arm64; no se cambió
  ninguna dependencia de producto para ese problema externo.

Decisiones y límites:

- No se afirmará precisión temporal: la actividad sólo identifica un silencio
  que ya está representado visualmente.
- No se usan micrófono, MIDI ni respuestas inventadas para completar progreso.
- Las pruebas humanas de escucha, comprensión y umbrales siguen pendientes y
  se registrarán al final; lo completado hasta ahora es validación técnica.
- Render confirmó `f96cf04` como despliegue activo. La nueva sesión de
  automatización recuperó finalmente la pestaña administrativa autenticada:
  el seed idempotente se ejecutó sin error y creó el tema 20, ejercicio 13 y
  lección 7 de pulso y silencio. La ruta pública y el runner cargaron; se
  inspeccionó el patrón y sus controles sin enviar ninguna respuesta.
- La migración remota `20260907130000_topic_positions.sql` añadió una posición
  curricular persistida. Conservó el orden previo para los demás temas y dejó
  Fundamentos como pulso (1), dirección (2), notas (3) y lectura (4). Render
  publicó la API `9a4c752` y la sección pública confirmó esa misma secuencia.

Próximos pasos concretos:

1. Realizar las pruebas humanas de comprensión, accesibilidad y umbrales del
   ciclo de validación final.
2. Al restablecer la sesión administrativa, sembrar y verificar técnicamente
   `rhythm_count`; después revisar con estudiantes la comprensión del orden,
   feedback y umbrales antes de presentar dominio.

## Relevo de sesión — checkpoint de contexto

- Objetivo: preservar contexto automáticamente antes de compactar Codex.
- Implementación: hook PreCompact automático y script determinista; actualiza
  sólo el bloque delimitado de este documento. Guía: `.codex/README.md`.
- Decisión: reutilizar este estado canónico; evitar un PROGRESS.md redundante.
  El agente mantiene la síntesis semántica; no lanzar un Codex secundario ni
  copiar mensajes del transcript para evitar recursión y filtración de secretos.
- Alcance: configuración, script y documentación; sin cambios de producto,
  commits ni promoción de ramas por instrucción expresa de esta entrega.
- Pendiente: confiar en el hook mediante `/hooks` y verificar el primer disparo
  automático real. Umbral de contexto opcional; configuración global intacta.
- Validación de esta entrega: seis pruebas del hook aprobadas; sintaxis JSON y
  Python correctas; dos ejecuciones manuales actualizan un único bloque;
  `git diff --check` correcto. No se ejecutaron pruebas de producto porque no
  cambió código de aplicación. Comando: `python3 .codex/hooks/test_checkpoint.py`.
- Próximo paso: tras activar el hook, retomar el orden de producto descrito abajo.

## Dirección de producto confirmada

MusicAula es una plataforma de **solfeo**: lectura, ritmo, oído y teoría
conectados. El teclado/piano es una interfaz visual y sonora de apoyo; una ruta
instrumental de piano podrá existir después, pero no define el currículo ni es
requisito para aprender solfeo.

El frontend vive en este repositorio y la API/NestJS junto con el esquema de
datos viven en `../piano-app-api`. Ambos son parte modificable del producto y
deben evolucionar coordinadamente cuando cambien los contratos de aprendizaje.

## Incremento implementado y desplegado

Se completó el primer ejercicio nativo de solfeo centrado en oído:

- Nuevo tipo `melodic_direction`: identifica si dos notas consecutivas
  ascienden o descienden.
- El runner muestra las opciones **Asciende** / **Desciende**, conserva repetir
  audio, revelar y avanzar, y no exige teclado físico.
- La API genera pares melódicos deterministas, evalúa la dirección, devuelve
  feedback didáctico y registra una etiqueta débil cuando hay error.
- El catálogo administrativo puede crear el tipo y cuenta con un seed
  independiente de **Fundamentos de solfeo → Altura y dirección**. El seed
  histórico `basic` no se modifica.
- Los ejercicios y corridas existentes continúan siendo compatibles; las
  soluciones quedan serializadas en cada corrida.

Validación realizada:

- Frontend: `npm run build` y `npx tsc --noEmit` aprobados con Node 20.19.5
  mediante nvm.
- API: `pnpm test` (14 pruebas) y `pnpm run build` aprobados. Las pruebas
  nuevas cubren el contrato de listado de lecciones, la evaluación de avance
  tanto incompleta como completada y la estabilidad de las claves y posiciones
  del seed al re-ejecutarse.
- API HTTP: `pnpm test:e2e` aprobado con lectura de lecciones, evaluación
  autenticada simulada y validación de los endpoints de autoría administrativa.
- `react-doctor` no pudo ejecutarse incluso con Node 20.19.5: la instalación
  temporal de npm no resolvió el binding opcional de `oxc-parser`. No bloqueó
  compilación ni tipos; requiere reparar la caché/instalación temporal de npm
  antes de volver a intentarlo.

Promoción y despliegue:

- Frontend: commit `4eb67aa` (`feat: add solfege lessons and admin authoring`)
  integrado y subido a `development` y `main`.
- API: commit `a15d9bc` (`feat: add lesson contracts and solfege foundation`)
  integrado y subido a `development` y `main`.
- Frontend: corrección `ada2faa` (`fix: prevent exercise loading from waiting
  for audio`) integrada y subida por `development → main`. Vercel confirmó
  `READY` para ese commit en el dominio de producción.
- El flujo desplegado se verificó con sesión administrativa real. Tras el
  despliegue de la corrección, la entrada directa recuperó la corrida revelada
  con su solución y controles, sin quedarse esperando la activación del audio.

## Base de datos y acceso

Se recuperó en el repositorio de la API el esquema base observado de producción
en `src/supabase/20260507_learning_phase1.sql` y se añadió la migración
`src/supabase/20260904050609_harden_public_data_access.sql`.

La migración de endurecimiento **ya fue aplicada** a Supabase. Su resultado
verificado es:

- RLS está habilitado en las ocho tablas públicas de aplicación.
- `anon` y `authenticated` no tienen privilegios directos sobre esas tablas.
- Sólo el `service_role` de la API puede acceder a los datos mediante la Data
  API; el navegador usa Supabase únicamente para autenticación.
- Se retiraron políticas permisivas heredadas, triggers rotos que referían a
  `updated_at` inexistente y rutas de búsqueda mutables en funciones públicas.

Que no existan políticas RLS es intencional: el modelo acordado es
**API-servidor exclusivamente**, no acceso directo desde clientes externos.

La fundación del modelo de lecciones también fue aplicada: `lessons` guarda el
objetivo, prerrequisitos, finalización y siguiente código; `lesson_blocks`
ordena explicaciones, prácticas, reflexiones y cierres; `lesson_progress`
guarda evidencia por usuario. Los bloques de práctica referencian ejercicios
existentes, sin alterar sus corridas históricas. El contrato ya está expuesto
en la autoría administrativa y en la comprobación verificable de estudiante.

La lectura ya está expuesta por `GET /topics/:topicId/lessons` y
`GET /lessons/:id`; el frontend muestra las lecciones de un tema y presenta sus
bloques de texto y prácticas vinculadas. El seed `solfege-foundations` ahora
crea de forma idempotente la lección **¿La melodía sube o baja?**, con una
explicación, el ejercicio de dirección melódica y un cierre. La interfaz
administrativa puede crear o editar lecciones y reemplazar sus bloques; la API
verifica que una práctica vinculada pertenezca al tema de la lección.

El alumnado autenticado puede usar **Comprobar mi avance** al final de la
lección. `POST /lessons/:id/evaluate-progress` compara los intentos, precisión
y racha persistidos contra el criterio declarado en `completion`; registra
`lesson_progress` como completado o en progreso y devuelve exactamente qué
evidencia falta. Un invitado ve la alternativa de iniciar sesión, sin prometer
que su historial local se migrará automáticamente.

Pendientes operativos de Supabase, sin cambio automático realizado:

- Activar la protección contra contraseñas filtradas en Supabase Auth.
- Programar la actualización de PostgreSQL recomendada por Supabase.
- Definir una limpieza programada de `exercise_runs` expiradas y comprobar su
  efecto con una prueba de integración.

## Siguiente orden de trabajo

Los pendientes técnicos siguen a cargo del agente; no son una lista de tareas
que el usuario deba ejecutar. La revisión humana complementa las pruebas y no
bloquea el trabajo técnico independiente.

| Orden | Responsable | Próxima acción y evidencia de cierre |
| --- | --- | --- |
| 1 | Agente + escucha de QA | Completar en una sesión de prueba los seis intentos con respuestas escuchadas (80 % de precisión y racha 2), comprobar el estado completado y recargar. La sesión administrativa actual tiene 2 intentos, 50 % y racha 1; no se usarán revelar ni respuestas inventadas para alcanzar el umbral. Los casos de servicio/HTTP ya están cubiertos. |
| 2 | Agente | React Doctor sigue sin diagnóstico: con Node 18 falla por el binding opcional de `oxc-parser` y con Node 20 queda detenido durante su instalación temporal. Reintentar cuando la caché/registro de npm esté disponible, sin cambiar dependencias de producto. |
| 3 | Agente | Cerrado: en producción, ejecutar el seed de fundamentos y volver a Inicio mostró la sección sin recarga manual. |
| 4 | Usuario u otra persona que escuche | Probar varios pares y su repetición: confirmar que se oyen ambas notas, que el orden se distingue y que el feedback coincide con la dirección escuchada. El agente prepara el recorrido y registra/corrige los hallazgos. |
| 5 | Agente + revisión humana | Borrador preparado en [`mvp1-unit-draft.md`](mvp1-unit-draft.md): pulso, altura/dirección, nombres de notas y lectura inicial, con objetivos, prerrequisitos, evidencia y límites. Espera revisión musical antes de publicar contenido curricular nuevo. |
| 6 | Usuario/equipo + agente | Organizar prueba con estudiantes reales. El agente prepara protocolo y criterios de éxito y documenta resultados; el equipo aporta participantes y revisión pedagógica. No declarar currículo validado antes de esta evidencia. |

Después de cerrar y validar la primera unidad, el agente continúa con feedback
por error y repaso explicable usando `weakTags`, precisión y fecha de práctica,
según las puertas de avance de `docs/roadmap-mvps.md`.

La primera parte visible de ese repaso ya está implementada: la cola de la
portada consume `explanation`, calculada por la API para actividad nueva,
habilidad actual, recuperación tras precisión baja o repaso programado. El
cliente conserva un fallback temporal para una API aún no actualizada y no
interpreta etiquetas internas. Aún faltan feedback estructurado para todo el
catálogo, semántica documentada de cada etiqueta y una validación de
comprensión con personas.

El ejercicio publicado de dirección melódica también recibe `nextStep` desde
la API tras una respuesta incorrecta: repetir el par y comparar la altura del
segundo sonido con la del primero. No aparece al revelar la solución y no
modifica la evaluación ni el progreso; el cliente mantiene un fallback durante
la promoción coordinada.

Contrato técnico publicado:

- API: `pnpm run test` aprobó 17 pruebas, `pnpm run build` aprobó y `pnpm run
  test:e2e` aprobó 3 pruebas. Se cubren explicación de actividad nueva, actual,
  recuperación por precisión baja y repaso programado, además de `nextStep`
  para dirección melódica correcta, errónea y revelada.
- Frontend: `npm run build` aprobó con Node 20.19.5.
- React Doctor no pudo analizar el proyecto: `npx` no instaló el binding
  opcional `@oxc-parser/binding-darwin-arm64`. Es un problema de su instalación
  temporal; la compilación y comprobación de tipos sí aprobaron.
- API: commit `b635a4d` (`feat: explain practice recommendations`) integrado y
  subido mediante `development → main`. El frontend `d84bf10` (`feat: consume
  practice feedback contract`) se integró y subió por el mismo flujo.

## Pruebas del navegador integrado — 5 de septiembre (UTC)

- Producción, sesión administrativa real: seed de fundamentos ejecutado;
  sección, tema, ejercicio 10 y lección 1 disponibles sin 404. Autoría abrió
  objetivo, criterio y tres bloques; se guardaron sin modificar el contenido
  y la lectura del estudiante conservó sus textos y práctica vinculada.
- Flujo autenticado: respuesta incorrecta con explicación, repetir, respuesta
  correcta mediante teclado, siguiente corrida y revelar aprobados. El avance
  pasó de seis intentos pendientes a cuatro, precisión 50 % y racha 1. Revelar
  no añadió un acierto. Estas pruebas dejan dos respuestas en el perfil usado.
- Se reprodujo un bloqueo al recargar la corrida: la hidratación esperaba
  `Tone.start()` antes de quitar el indicador de carga. La corrección separa
  carga y audio; sólo reproduce automáticamente con contexto activo y muestras
  listas. El botón manual activa el audio antes de pedir la repetición a la API.
  También hay mensajes recuperables para errores de carga y reproducción.
- Corrección validada con `npm run build` (incluye lint/tipos) y navegador
  integrado en `localhost:3000`: entrada directa y recarga de corrida guardada
  muestran controles sin gesto previo. El puerto 3100 no está admitido por
  CORS de la API; usar 3000 para esta prueba.
- Verificación posterior al despliegue `ada2faa`: en producción se recuperó
  la misma corrida autenticada en estado `revealed`, con solución visible y
  botones Reproducir/Siguiente disponibles. El bloqueo observado quedó resuelto.
- React Doctor volvió a fallar por el binding opcional de `oxc-parser` en la
  instalación temporal de npm. La calidad audible y la finalización de lección
  con una sesión real siguen pendientes; no se infieren de los controles UI.
- Observación menor: tras el seed, la portada mostró el catálogo anterior
  hasta recargar. La administración ahora invalida las consultas `sections`,
  `topics`, `topicsBySection`, `topicExercises` y `topicLessons`, además de su
  propio catálogo, después de una mutación o seed. `npm run build` aprobó con
  Node 20.19.5; queda la comprobación visual del refresco.
- Verificación posterior del refresco en producción: desde una sesión
  administrativa de QA se ejecutó el seed de fundamentos y se volvió a Inicio
  mediante la navegación interna. «Fundamentos de solfeo» siguió visible sin
  recarga manual, con su tema, práctica y lección disponibles.
- La misma sesión de QA comprobó la lección: la API presentó correctamente la
  evidencia faltante (4 intentos, precisión actual 50 % frente a 80 % y racha
  1 frente a 2). No se forzó la finalización porque requiere escuchar y
  responder pares reales. Durante esa prueba se detectó que el tema mostraba
  «Topic no encontrado» mientras cargaba; el frontend ahora presenta carga,
  error recuperable o ausencia real del tema de forma diferenciada. La
  compilación aprobó; React Doctor volvió a quedarse detenido al instalarse de
  forma temporal y no emitió diagnóstico.
- Se preparó el borrador de la primera unidad y un protocolo de QA para la
  finalización de dirección melódica en
  [`mvp1-unit-draft.md`](mvp1-unit-draft.md). Es material de revisión, no
  contenido publicado ni evidencia de validación humana.

## Documentos fuente

- `AGENTS.md`: propósito, límites pedagógicos, arquitectura y reglas de
  trabajo.
- `docs/roadmap-mvps.md`: alcance y puertas de validación por MVP.
- Este archivo: estado operativo compacto y siguiente relevo.
- `docs/implementation-handoff.md`: relevo técnico detallado para retomar tras
  una compactación de contexto.
- `../piano-app-api/AGENTS.md` y `../piano-app-api/README.md`: contrato de la
  API, esquema y estado de las migraciones.

<!-- codex-checkpoint:start -->
## Checkpoint automático de contexto

_Last checkpoint: 2026-09-07 17:26:41 UTC_

El relevo semántico de este documento sigue siendo la fuente canónica; reconciliar con Git.
Sesión: manual-test; turno: subdir-test; trigger: auto.

### Estado de implementación / archivos relevantes
```text
 M AGENTS.md
 M docs/current-status.md
?? .codex/

```
### Cambios sin preparar
```text
 AGENTS.md              | 24 +++++++++++++++++++
 docs/current-status.md | 62 ++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 86 insertions(+)

```
### Cambios preparados
```text

```
### Historial reciente (identificadores)
```text
01dc510
d84bf10
32d8ecc
ef554df
75eb035

```
### Transcript / incertidumbre
No proporcionado; usar el relevo mantenido por el agente.

### Validación y próximos pasos
- El hook no ejecuta build/tests y no declara resultados nuevos.
- Leer el relevo de sesión y las validaciones previas; comprobar cambios reales y bloqueos.
- Continuar el próximo paso autorizado; actualizar objetivo, decisiones y resultados al avanzar.
<!-- codex-checkpoint:end -->
