# Hoja de ruta por MVPs — MusicAula

> Estado: hoja de ruta acordada el 3 de septiembre de 2026, con actualización
> técnica el 8 de septiembre. Las secciones de MVP conservan la planificación;
> el bloque de estado distingue lo ya publicado de las validaciones pendientes.
> La fuente de verdad del estado actual es
> [`AGENTS.md`](../AGENTS.md); los contratos HTTP operativos viven en Swagger y
> en `../piano-app-api/src/`.

## Norte y criterio de decisión

MusicAula debe permitir que una persona principiante **comprenda, escuche, lea
y practique solfeo**. Cada MVP entrega un ciclo completo y comprobable de esa
experiencia, antes de ampliar el catálogo o incorporar mecánicas de retención.
El piano/teclado existente se usa como apoyo visual o de ejecución opcional; no
define el alcance del producto. Una ruta de piano será un futuro módulo
instrumental, si la evidencia la justifica.

El público inicial de trabajo es una persona adulta autodidacta que comienza
solfeo y puede practicar sin instrumento. El teclado visual y un teclado MIDI
son apoyos opcionales, nunca requisitos. Esta es una hipótesis de producto que
se validará con estudiantes, no una decisión curricular definitiva.

Una actividad sólo entra en un MVP si tiene objetivo observable, respuesta
evaluable, feedback útil, repetición segura y alternativa sin MIDI. No se
usarán puntos, rachas o bloqueos opacos como sustituto de feedback musical.

## Punto de partida verificado

Ya existe el flujo de secciones y temas, los ejercicios ejecutables, el piano
visual, reproducción de audio, cuentas de Supabase, preferencias y una cola de
práctica. La API hermana (`../piano-app-api`) es responsable de catálogo,
generación/evaluación de corridas, progreso autenticado y administración. Sus
ocho tipos son `keyboard_note`, `staff_note`, `ear_interval`,
`melodic_direction`, `rhythm_pulse`, `rhythm_count`, `scale_construction` y
`chord_identification`.

### Actualización técnica publicada — 8 de septiembre

El seed `solfege-foundations` publica una secuencia de diez temas ordenados:
pulso, dirección, notas naturales, lectura en clave de sol, ritmo, repaso,
intervalos al oído, lectura y escucha de intervalos, escala de Do mayor y
acorde de Do mayor. Cada tema tiene una lección con explicación, práctica y
recap; la API conserva la respuesta canónica. Las prácticas de escala y acorde
evalúan las notas seleccionadas, no orden, tempo ni interpretación. Las pruebas
humanas, la revisión musical y los umbrales pedagógicos siguen pendientes por
decisión de producto. La matriz de ejecución técnica y la separación de
pruebas humanas están en [`qa-initial-solfege-route.md`](qa-initial-solfege-route.md).

No están entregados como producto fiable: contenido de una ruta completa,
feedback por error para todo el catálogo, MIDI, evaluación de tempo o
micrófono, migración del historial de invitado y un tutor IA ligado al
aprendizaje. La primera experiencia navegable de lección ya lee bloques y
evalúa su evidencia desde API e interfaz; también existe autoría administrativa
para lecciones y bloques. El flujo desplegado ya se probó con sesión real para
autoría, práctica y avance incompleto. Faltan la comprobación por navegador del
avance completado, la escucha humana y completar la unidad revisada. El relevo
con evidencia y responsables está en [`current-status.md`](current-status.md).

## Secuencia de entrega

```text
MVP 0: base verificable
       ↓
MVP 1: primera unidad completa de solfeo
       ↓
MVP 2: práctica guiada y repaso explicable
       ↓
MVP 3: lectura y ritmo inicial
       ↓
MVP 4: aplicación musical; piano/MIDI como ruta opcional
```

Cada MVP se prueba con alumnado antes de comenzar el siguiente. Si la evidencia
de uso contradice la hipótesis, se ajusta el siguiente MVP, no se fuerza el
roadmap.

## MVP 0 — Base verificable para aprendizaje

**Objetivo:** asegurar que el flujo existente puede operar y medirse como una
base honesta para pruebas con usuarios.

**Incluye**

- Validar el README de frontend con un arranque real, variables y límites
  comprobables; corregir cualquier diferencia que aparezca.
- Pruebas de contrato reproducibles para los seis `ExerciseKind`: generación,
  respuesta correcta, incorrecta, revelar y run ya iniciado.
- Seeds reproducibles y un procedimiento de QA que cubra navegación por
  teclado, carga, error, repetir, revelar y siguiente actividad.
- Esquema base recuperado y versionado desde la API; RLS y el acceso sólo por
  servidor ya se endurecieron en el proyecto remoto. Queda por definir la
  limpieza de `exercise_runs` expirados.

**No incluye:** lecciones nuevas, contenido curricular nuevo, MIDI ni cambios
en las reglas pedagógicas de los ejercicios publicados.

**Coordinación frontend/API/base de datos:** el contrato actual es un punto de
partida, no una restricción. Se puede modificar API, tipos y base de datos si
la primera ruta de solfeo lo requiere, mediante migraciones revisables, RLS y
compatibilidad explícita para runs existentes. Los tipos de
`src/lib/exercises/contracts.ts` y `piano-app-api/src/exercises/types.ts`
deben quedar alineados.

**Salida:** una persona del equipo puede levantar ambos repositorios, sembrar
un catálogo de prueba y verificar el ciclo de ejercicio sin ambigüedad.

## MVP 1 — Primera unidad: fundamentos de solfeo

**Objetivo de aprendizaje:** una persona reconoce y nombra notas naturales,
distingue altura ascendente/descendente, sigue un pulso simple y relaciona esos
elementos con sonido y notación básica. El teclado visual puede servir de
apoyo, pero la unidad se completa sin instrumento.

**Incluye**

- Un modelo mínimo de lección: objetivo, prerequisitos, bloques ordenados,
  criterio de finalización y siguiente paso. La lección debe poder coexistir
  con las rutas de temas y ejercicios actuales.
- Una unidad inicial breve: pulso y silencio → altura ascendente/descendente →
  nombres de notas naturales → introducción del pentagrama → recuperación
  corta que conecta lectura y escucha.
- Explicación visual y audible antes de cada práctica, más feedback específico
  para errores frecuentes (por ejemplo, invertir la dirección de una melodía
  o confundir el nombre y la posición de una nota).
- Plantillas y seeds graduados para escucha, lectura y reconocimiento de notas,
  revisados por una persona con conocimiento musical. Si los tipos actuales no
  representan una actividad necesaria, se añaden o evolucionan en frontend,
  API y base de datos con un contrato compatible.
- Cierre que comunique evidencia de avance y recomiende la siguiente práctica,
  sin afirmar dominio si no se cumple su criterio declarado.

**No incluye:** técnica pianística, partituras complejas, detección MIDI,
canciones con derechos de autor ni adaptar el currículo mediante IA.

**Coordinación frontend/API/base de datos:** acordar un contrato versionable
para lecciones, bloques y evidencia de dominio. La API conserva la evaluación
canónica; el frontend presenta bloques y alternativas accesibles. Se modifica
el esquema de datos si no puede persistir esa estructura, mediante una
migración revisable. Cualquier cambio de plantilla debe preservar corridas ya
iniciadas o definir una migración segura.

**Éxito a validar:** en pruebas moderadas, participantes pueden completar la
unidad sin ayuda externa, explicar qué relaciona una nota escrita con su sonido
y volver a intentarlo tras un error. Definir muestra, instrumento y umbral antes
de lanzar la prueba.

### Actividad inicial implementada: dirección melódica

| Aspecto | Definición |
| --- | --- |
| Objetivo observable | Distinguir si el segundo de dos sonidos consecutivos es más agudo o más grave, y responder “asciende” o “desciende”. |
| Prerrequisitos | Ninguno; la explicación introduce los términos antes de la primera respuesta. |
| Modalidad | Escucha; no exige teclado ni MIDI. |
| Respuesta evaluable | Una elección entre `ascending` y `descending`; la API genera y conserva la solución canónica del run. |
| Dificultad inicial | Saltos de 2, 3 o 4 semitonos entre MIDI 60 y 72; dirección alternada por seed. |
| Feedback correcto | Identifica si el segundo sonido fue más agudo o más grave y nombra la dirección resultante. |
| Feedback ante error | Explica cuál sonido fue más agudo/grave y, por tanto, si la melodía asciende o desciende; etiqueta el error por dirección para futura práctica. |
| Dominio inicial | 6 intentos, 80 % de precisión y racha de 2, declarado en la plantilla; es un umbral provisional a validar con estudiantes. |
| Accesibilidad | Audio repetible y botones con texto; no hay gesto musical, instrumento ni entrada de micrófono obligatorios. |

Se siembra con `POST /admin/seed/solfege-foundations` en la sección
`solfege-foundations` y tema `height-and-direction`. La actividad está vinculada
a la primera lección persistida; lectura, autoría y evaluación de avance están
expuestas en API e interfaz, con pruebas HTTP de contrato. Falta cerrar la
validación humana y la unidad revisada completa; una lección implementada no
equivale a una ruta curricular validada.

## MVP 2 — Práctica guiada y repaso explicable

**Objetivo de aprendizaje:** transformar los intentos de la primera unidad en
una práctica que indique qué revisar, por qué y qué hacer después.

**Incluye**

- Feedback estructurado por ejercicio: acierto, error común, explicación breve
  y acción siguiente; el texto no depende de un modelo generativo en tiempo de
  ejecución.
- Etiquetas de habilidad y errores (`weakTags`) con significado documentado.
- Cola de práctica que explique cada recomendación: repaso vencido, habilidad
  actual o actividad nueva.
- Programación inicial de repetición espaciada basada en precisión, fecha y
  evidencia de práctica; reglas visibles y testeadas.
- Panel de progreso por habilidad que diferencie “practicado”, “en progreso” y
  “dominado” según criterios concretos.

**No incluye:** gamificación de presión, migración automática del historial de
invitado ni recomendaciones opacas de IA.

**Coordinación frontend/API:** la API define y persiste la semántica de
`weakTags`, `nextDueAt` y razones de cola; el frontend las explica sin inferir
reglas propias. Se requieren pruebas de contrato y casos de progreso límite.

**Éxito a validar:** participantes entienden por qué aparece una actividad en
la cola y pueden expresar la acción siguiente después de fallar.

## MVP 3 — Lectura y ritmo inicial

**Objetivo de aprendizaje:** leer notas sencillas en clave de sol y mantener un
pulso básico mientras relaciona pentagrama, sonido y una respuesta accesible,
con o sin teclado.

**Incluye**

- Una segunda unidad de lecciones: pentagrama y clave de sol → notas en rango
  reducido → figuras y pulsos → lectura corta guiada.
- Uso gradual de `staff_note` y ejercicios de ritmo nuevos sólo si su contrato
  puede evaluar respuestas sin prometer escucha por micrófono.
- Metrónomo opcional, audio repetible, indicaciones visuales de pulso y un modo
  sin audio.
- Feedback que separe lectura de nota y pulso; nunca marcar una interpretación
  como precisa si sólo se midieron clics en pantalla.

**No incluye:** evaluación fiable de timing, dictado por micrófono ni un
repertorio protegido.

**Coordinación frontend/API:** si se crea `rhythm_reading`, acordar primero el
contrato en ambos repositorios, configuración de dificultad, generación,
evaluación, previsualización administrativa y pruebas. No sobrecargar
`staff_note` con semánticas incompatibles.

**Éxito a validar:** participantes distinguen qué error fue de lectura y cuál
fue de pulso, y completan una lectura corta con las ayudas disponibles.

## MVP 4 — Aplicación musical; piano/MIDI como ruta opcional

**Objetivo de aprendizaje:** aplicar notas, lectura, intervalos y acordes en
patrones o fragmentos originales. El teclado visual o MIDI pueden ampliar la
práctica, manteniendo una alternativa completa sin instrumento.

**Incluye**

- Microproyectos y patrones de acompañamiento con material propio o con
  derechos confirmados.
- Rutas opcionales hacia intervalos, escalas y acordes conectadas explícitamente
  con la aplicación musical.
- Prototipo de una ruta instrumental de piano, separado del núcleo de solfeo,
  sólo cuando existan objetivos y contenido propios revisados.
- Entrada MIDI Web como mejora progresiva para la ruta instrumental: detección
  de conexión, permisos, notas recibidas, estados de error y equivalencia
  funcional sin instrumento.
- Estudio de viabilidad para timing MIDI antes de usarlo para decidir dominio.

**No incluye:** análisis por micrófono, evaluación de expresividad o tempo como
verdad pedagógica sin validación, ni tutor IA que modifique el currículo.

**Coordinación frontend/API:** la captura MIDI pertenece al cliente, pero los
eventos que se usen para progreso requieren contrato explícito, consentimiento,
minimización de datos y alternativas. La API no debe recibir secuencias crudas
si bastan resultados evaluados localmente y aprobados por producto.

**Éxito a validar:** una persona puede practicar el mismo objetivo con o sin
MIDI y entiende claramente qué fue observado por el sistema.

## Trabajo transversal y puertas de avance

| Puerta | Evidencia requerida antes de avanzar |
| --- | --- |
| Pedagogía | Objetivo, prerequisitos, dificultad, respuestas correctas/incorrectas y feedback revisados. |
| Contrato | DTO/tipos sincronizados entre repositorios, compatibilidad para runs existentes y pruebas de contrato. |
| Accesibilidad | Flujo sin instrumento, contraste, foco visible, audio repetible y alternativa sin MIDI. |
| Datos y seguridad | Esquema/RLS revisados antes de persistir datos nuevos; sin secretos ni historial innecesario en logs o prompts. |
| Validación humana | Prueba con estudiantes, hallazgos registrados y decisión explícita de iterar, avanzar o detener. |

## Fuera de alcance hasta nueva evidencia

- Tutor conversacional conectado al progreso o capaz de publicar/modificar
  currículo.
- Evaluación por micrófono, calificación de tempo o expresividad.
- Migración automática del historial de invitado al perfil.
- Modo docente, asignaciones y reportes.
- Gamificación basada en presión o penalizaciones.

## Cómo mantener este plan

- Actualizar el estado de cada MVP sólo cuando haya evidencia verificable de
  entrega; mantener los planes como planes.
- Cuando un MVP cambie contratos o responsabilidades, actualizar en el mismo
  cambio `AGENTS.md`, el README o documentación del repositorio afectado y el
  consumidor hermano.
- Integrar cada cambio primero en `development`, validarlo y sólo después
  promoverlo a `main`, salvo instrucción urgente explícita.
