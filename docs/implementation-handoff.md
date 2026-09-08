# Relevo de implementación técnica

> Actualizado: 7 de septiembre de 2026 (UTC). Este documento permite retomar
> el trabajo tras compactar contexto. No sustituye [`current-status.md`](current-status.md),
> que conserva el estado de producto y validación.

## Estado actual — 8 de septiembre de 2026

La ruta técnica publicada de Fundamentos contiene diez temas ordenados, desde
pulso hasta un acorde de Do mayor. Las últimas entregas de API son `448d15b`
(lectura y escucha de intervalos), `f04c995` (escala de Do mayor) y `7da1c0a`
(acorde de Do mayor); Render confirmó cada una como activa y los seeds se
verificaron en catálogo, API pública y navegador sin enviar respuestas. La
fuente compacta y vigente de detalle es [`current-status.md`](current-status.md).

Lo que sigue pendiente es humano: revisión musical, comprensión, accesibilidad
y umbrales. El resto de este documento conserva el historial técnico anterior y
no debe interpretarse como estado más reciente.

## Estado confirmado

El frontend publicó el consumo del contrato mediante `development → main` con
el commit `d84bf10`. El repositorio API hermano publicó su contrato mediante el
mismo flujo con `b635a4d`.

Después de ese relevo, la API publicó `6723e59` para entregar un `nextStep`
tras error en los seis tipos de ejercicio y `4c0b0f4` para exponer
`learningState` en cada elemento de progreso. El frontend publicó `b6e2f91`,
que presenta los estados Practicado, En progreso y Dominado en la portada.
La API publicó además `ba848f3`, que cubre mediante HTTP autenticado simulado
los campos `learningState` y `explanation` para evitar regresiones de contrato.
La ruta inicial completa quedó publicada en API como `93b7ffd`: el seed
idempotente prepara dirección melódica, notas naturales en teclado y cinco
notas en clave de sol. Sus 18 pruebas unitarias, 4 e2e y compilación aprobaron.

Cambios frontend publicados recientemente:

| Commit | Resultado |
| --- | --- |
| `23a4ee2` | Invalida el catálogo público tras mutaciones administrativas y seed. |
| `ad5edd4` | Distingue carga, error y ausencia real de un tema. |
| `99a2c6c` | Añade el borrador curricular y protocolo QA de la primera unidad. |
| `75eb035` | Explica en la cola por qué se propone una práctica. |
| `ef554df` | Añade un paso siguiente tras error de dirección melódica. |

`npm run build` aprobó con Node 20.19.5 en cada cambio. React Doctor se ha
intentado repetidamente con Node 20, pero queda detenido sin salida durante su
instalación temporal mediante `npx`; no se modificaron dependencias de producto
para reparar la herramienta.

## Validación diferida

Las pruebas con personas y la revisión musical quedan documentadas como puertas
posteriores. No bloquean los cambios técnicos, pero tampoco se debe afirmar que
validaron aprendizaje, audio o umbrales de dominio.

- El seed de fundamentos se verificó en producción: la sección continuó visible
  al volver a Inicio sin recarga manual.
- La lección de dirección muestra evidencia incompleta correctamente en una
  sesión de QA: 2 intentos, 50 % de precisión y racha 1.
- La finalización de lección requiere seis respuestas escuchadas, 80 % de
  precisión y racha 2; el protocolo está en
  [`mvp1-unit-draft.md`](mvp1-unit-draft.md).

## Próximo incremento: contrato de feedback y repaso explicable

Objetivo: la API debe declarar por qué una actividad entra a la cola y qué
acción propone; el frontend debe presentar esas explicaciones sin deducir
reglas propias ni mostrar etiquetas internas.

### Contrato actual

- API: `../piano-app-api/src/exercises/types.ts` define `RunFeedback` con
  `message`, `weakTags` y `reveal`, y `PracticeQueueItem` con `reason` igual a
  `due`, `current` o `new`.
- API: `../piano-app-api/src/progress/progress.service.ts` decide `due` por
  fecha de repaso vencida o precisión menor a 75 %, `current` para el tema
  activo y `new` para una actividad sin progreso en un tema desbloqueado.
- API: `../piano-app-api/src/exercises/engine.ts` incluye una etiqueta concreta
  `direction:ascending` o `direction:descending` tras errar dirección
  melódica; el resto de tipos usa etiquetas de habilidad y generador.
- Frontend: `src/lib/exercises/contracts.ts` replica esos contratos.
- Frontend: `src/app/page.tsx` muestra explicaciones genéricas por `reason`;
  `src/app/components/exercise/ExerciseRunner.tsx` muestra un paso siguiente
  sólo para errores de dirección melódica.

### Cambio entregado

1. API: `PracticeQueueItem.explanation` se calcula exclusivamente en
   `src/progress/progress.service.ts`. Para una cola `due`, la recuperación por
   precisión baja tiene prioridad sobre la fecha vencida; no se envían
   `weakTags` como explicación.
2. API: `RunFeedback.nextStep` es opcional y se genera sólo para un error de
   `melodic_direction`; no aparece tras un acierto o revelar.
3. Frontend: sus contratos aceptan ambos campos y los presentan. Conservan un
   fallback temporal frente a una API sin actualizar.
4. API validada y promovida: `pnpm run test` (17), `pnpm run build` y
   `pnpm run test:e2e` (3); frontend `npm run build` con Node 20.19.5.
   React Doctor no pudo iniciar por la falta del binding opcional de
   `oxc-parser` en su instalación temporal.
5. Frontend validado, integrado y promovido con `d84bf10`.

No modificar reglas de dominio de corridas existentes ni datos históricos. La
evolución de campos debe ser opcional y compatible con runs ya persistidos.

## Siguiente límite de producto

El núcleo técnico de MVP 2 ya ofrece feedback accionable, cola explicable,
progreso por habilidad y pruebas de contrato. La primera unidad sigue siendo
un borrador y sólo se puede activar o ampliar como currículo tras revisión musical:
[`mvp1-unit-draft.md`](mvp1-unit-draft.md). El siguiente grupo técnico es
añadir ejercicios/semillas compatibles para nombres de notas y lectura inicial,
siempre coordinando ambos repositorios y evitando prometer evaluación de ritmo,
MIDI o micrófono.

La ruta quedó sembrada en el catálogo remoto después de que Render publicó
`93b7ffd`. La comprobación administrativa confirmó los temas de notas naturales
y lectura inicial, los ejercicios `keyboard_note` y `staff_note`, y sus tres
lecciones. En la ruta pública se verificaron los bloques y enlaces de práctica
de «Las siete notas naturales» y «Cinco notas en clave de sol». Es una
verificación técnica de catálogo, no una validación humana de aprendizaje.
Las prácticas de teclado y lectura también cargaron con su prompt, rango de
teclas y controles; no se enviaron respuestas ni se alteró progreso durante la
comprobación.

## Incremento en curso: pulso y silencio visual

Se está completando el séptimo tipo de ejercicio, `rhythm_pulse`, coordinado en
API y frontend. La actividad muestra cuatro posiciones y pide ubicar el espacio
vacío mediante `pulsePosition`. Es deliberadamente reconocimiento visual: no
declara ni infiere tempo, pulsación, interpretación, MIDI o micrófono. La API
normaliza siempre cuatro pulsos, genera la posición de forma determinista,
evalúa acierto/error y revela una explicación específica; el seed añade la
lección «Cuatro pulsos y un silencio». Faltan las pruebas y compilaciones de
cierre, promoción, despliegue y comprobación técnica del catálogo. La prueba
con estudiantes y la revisión musical continúan pendientes.

Validación ya completada antes de promover: la API aprobó 19 pruebas unitarias,
compilación y 4 pruebas e2e; el frontend aprobó `npm run build` con Node
20.19.5. React Doctor no pudo inicializar el binding temporal de `oxc-parser`
en macOS arm64; no se cambiaron dependencias de producto por ese fallo de la
herramienta.

Render publicó la API `f96cf04`. Desde una sesión administrativa autorizada se
ejecutó el seed sin error: creó el tema «Pulso y silencio» (20), la plantilla
`rhythm_pulse` (13) y la lección «Cuatro pulsos y un silencio» (7). La ruta
pública y el runner cargaron con cuatro posiciones, un vacío accesible y los
cuatro botones de respuesta. No se envió una respuesta durante esta
comprobación, aunque abrir el runner crea una corrida activa. Es verificación
técnica de catálogo y contrato, no una prueba humana de comprensión o ritmo.

El orden curricular ya no depende del identificador de un tema. La migración
remota `20260907130000_topic_positions.sql` preservó el orden histórico como
base y el seed fija Fundamentos en las posiciones pulso (1), dirección (2),
notas (3) y lectura (4). Render publicó la API `9a4c752`; la sección pública
mostró esa secuencia en ese orden. La próxima puerta de calidad sigue siendo la
validación humana, no más cambios de catálogo por defecto.

El incremento siguiente, aún sin publicar, añade `rhythm_count`: una lectura
visual de negras, blancas, redondas y silencios de negra donde la respuesta es
la suma de pulsos escritos. No evalúa tempo ni interpretación. El seed prepara
el quinto tema «Primera lectura rítmica» y la lección «Cuenta figuras y
silencios». API aprobó 20 unitarias, compilación y 4 e2e; frontend aprobó
`npm run build` con Node 20.19.5. Falta promover, desplegar, sembrar y verificar
el catálogo sin enviar respuestas.

La promoción quedó publicada como API `ddeee3f` y frontend `e53aea7`. Tras
ejecutar el seed desde administración, el catálogo público confirmó el tema
«Primera lectura rítmica» (28, posición 5), la práctica `rhythm_count` (14) y
la lección (15). Una corrida de invitado mostró `half + half` con opciones 3,
4 y 5, sin audio ni respuesta enviada. Es validación técnica del flujo; faltan
las pruebas humanas de comprensión, accesibilidad y umbrales de dominio.

La recuperación final quedó publicada como API `79a99bb` y sembrada: tema
«Repaso: escucha y lectura» (39, posición 6), prácticas 15 y 16, y lección 24.
La respuesta pública de la lección confirmó sus bloques ordenados de
explicación, dirección melódica, lectura de nota y recap. No se enviaron
respuestas durante la comprobación. La ruta inicial queda completa a nivel
técnico; la siguiente puerta sigue siendo pruebas humanas, diferidas por la
decisión actual de producto.

## Flujo de integración

Para cada repositorio: trabajar en `development`, ejecutar las validaciones,
subir a `origin/development`, promover mediante `git merge --ff-only` a `main`
y subir `origin/main`. No modificar Supabase remoto ni ejecutar seeds de
contenido nuevo como parte de esta entrega técnica.
