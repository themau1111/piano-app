# Estado actual y relevo de implementación

Actualizado: 5 de septiembre de 2026 (UTC).

## Dirección de producto confirmada

MusicAula es una plataforma de **solfeo**: lectura, ritmo, oído y teoría
conectados. El teclado/piano es una interfaz visual y sonora de apoyo; una ruta
instrumental de piano podrá existir después, pero no define el currículo ni es
requisito para aprender solfeo.

El frontend vive en este repositorio y la API/NestJS junto con el esquema de
datos viven en `../piano-app-api`. Ambos son parte modificable del producto y
deben evolucionar coordinadamente cuando cambien los contratos de aprendizaje.

## Incremento terminado localmente

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
- Ambos directorios locales quedaron limpios en `development`. Los despliegues
  automáticos se dispararon desde `main`, pero aún no se verificaron contra una
  sesión administrativa real.

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

1. Verificar en producción la corrección de recarga descrita abajo después
   de su despliegue.
2. Completar la validación del estado de lección completada y la escucha
   humana del audio. Las pruebas de motor, servicio y HTTP ya están cubiertas
   localmente; la sesión real verificó el estado incompleto y su persistencia.
3. Usar ese modelo para cerrar una ruta principiante de solfeo antes de ampliar
   el catálogo: pulso, nombres de notas, altura/dirección y escucha básica.
4. Después, mejorar feedback por error y repetición espaciada usando `weakTags`,
   precisión y fecha de práctica, con una explicación visible de por qué se
   propone cada repaso.

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
- React Doctor volvió a fallar por el binding opcional de `oxc-parser` en la
  instalación temporal de npm. La calidad audible y la finalización de lección
  con una sesión real siguen pendientes; no se infieren de los controles UI.
- Observación menor: tras el seed, la portada mostró el catálogo anterior
  hasta recargar; revisar invalidación de caché en un incremento posterior.

## Documentos fuente

- `AGENTS.md`: propósito, límites pedagógicos, arquitectura y reglas de
  trabajo.
- `docs/roadmap-mvps.md`: alcance y puertas de validación por MVP.
- Este archivo: estado operativo compacto y siguiente relevo.
- `../piano-app-api/AGENTS.md` y `../piano-app-api/README.md`: contrato de la
  API, esquema y estado de las migraciones.
