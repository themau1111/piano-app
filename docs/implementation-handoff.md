# Relevo de implementación técnica

> Actualizado: 7 de septiembre de 2026 (UTC). Este documento permite retomar
> el trabajo tras compactar contexto. No sustituye [`current-status.md`](current-status.md),
> que conserva el estado de producto y validación.

## Estado confirmado

El frontend está limpio en `main` y publicado hasta el commit `ef554df`.
El repositorio API hermano está limpio en `development` y su último commit es
`a15d9bc`. La persona usuaria autorizó explícitamente continuar el trabajo en
la API; el entorno de esta sesión todavía no tiene permiso de escritura para
`../piano-app-api`, por lo que ese acceso debe habilitarse antes de editar.

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

### Cambio propuesto, aún no implementado

1. En API, añadir a `PracticeQueueItem` un campo estable `explanation` y, si
   hace falta, un código de razón más específico. Por ejemplo:
   `review_due`, `review_after_error`, `continue_current` y `start_new`.
   No exponer ni requerir que el cliente interprete `weakTags`.
2. Construir `explanation` exclusivamente en
   `src/progress/progress.service.ts`, a partir de las reglas ya canónicas. El
   texto debe decir la acción siguiente, no afirmar dominio.
3. Añadir a `RunFeedback` un `nextStep` opcional generado por
   `src/exercises/engine.ts`. Empezar por `melodic_direction`; ampliar otros
   tipos sólo cuando el feedback haya sido revisado.
4. Sincronizar el contrato equivalente del frontend y consumir los campos
   enviados por API. Mantener un fallback para respuestas de servidores aún no
   actualizados durante la promoción coordinada.
5. Añadir pruebas unitarias de API para cada razón de cola, fecha vencida,
   precisión baja, actividad actual y nueva; añadir pruebas del motor para
   `nextStep` correcto, incorrecto y revelado. Ejecutar `pnpm test`,
   `pnpm test:e2e` y `pnpm run build` en API. Ejecutar `npm run build` en
   frontend.

No modificar reglas de dominio de corridas existentes ni datos históricos. La
evolución de campos debe ser opcional y compatible con runs ya persistidos.

## Después del incremento

Con el contrato publicado y probado, implementar la primera unidad sólo como
contenido revisado. El diseño aún no es currículo entregado:
[`mvp1-unit-draft.md`](mvp1-unit-draft.md). El siguiente grupo técnico es
añadir ejercicios/semillas compatibles para nombres de notas y lectura inicial,
siempre coordinando ambos repositorios y evitando prometer evaluación de ritmo,
MIDI o micrófono.

## Flujo de integración

Para cada repositorio: trabajar en `development`, ejecutar las validaciones,
subir a `origin/development`, promover mediante `git merge --ff-only` a `main`
y subir `origin/main`. No modificar Supabase remoto ni ejecutar seeds de
contenido nuevo como parte de esta entrega técnica.
