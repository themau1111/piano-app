# Relevo de implementación técnica

> Actualizado: 7 de septiembre de 2026 (UTC). Este documento permite retomar
> el trabajo tras compactar contexto. No sustituye [`current-status.md`](current-status.md),
> que conserva el estado de producto y validación.

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

La ruta ya está disponible en el código del seed, pero no se ha ejecutado en el
catálogo remoto durante esta entrega. Tras verificar que Render publicó
`93b7ffd`, iniciar sesión como administrador, ejecutar
`/admin/seed/solfege-foundations` y comprobar tres temas y tres lecciones en
la ruta pública. Registrar esa verificación como técnica, no como validación
humana de aprendizaje.

## Flujo de integración

Para cada repositorio: trabajar en `development`, ejecutar las validaciones,
subir a `origin/development`, promover mediante `git merge --ff-only` a `main`
y subir `origin/main`. No modificar Supabase remoto ni ejecutar seeds de
contenido nuevo como parte de esta entrega técnica.
