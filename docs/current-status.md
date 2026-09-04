# Estado actual y relevo de implementación

Actualizado: 4 de septiembre de 2026 (UTC).

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

- Frontend: `npm run build` y `npx tsc --noEmit` aprobados.
- API: `pnpm test` (14 pruebas) y `pnpm run build` aprobados. Las pruebas
  nuevas cubren el contrato de listado de lecciones, la evaluación de avance
  tanto incompleta como completada y la estabilidad de las claves y posiciones
  del seed al re-ejecutarse.
- API HTTP: `pnpm test:e2e` aprobado con lectura de lecciones, evaluación
  autenticada simulada y validación de los endpoints de autoría administrativa.
- `react-doctor` no pudo ejecutarse: la instalación temporal de npm no resolvió
  su binding nativo de `oxc-parser` bajo Node 18. No bloqueó las validaciones
  anteriores; actualizar Node a 20+ sigue siendo recomendable.

Los cambios permanecen sin commit en ambos repositorios para revisión e
integración en `development` antes de promoverlos a `main`.

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

1. Desplegar la API y ejecutar el seed `solfege-foundations` con una cuenta
   `admin`; el catálogo público desplegado aún devuelve 404 para esa sección.
   Después, ejecutar una prueba integrada de la nueva actividad: iniciar corrida,
   responder correcto e incorrecto, repetir audio, revelar, avanzar y validar
   el seed administrativo con una cuenta `admin`.
2. Añadir una prueba de idempotencia del seed y una prueba de flujo real
   frontend–API. El motor de `melodic_direction` ya cubre generación,
   respuesta correcta, incorrecta y revelado; el servicio de lecciones cubre
   el contrato de progreso.
3. Realizar la primera prueba integrada con un administrador: crear/editar la
   lección, ejecutar la práctica y comprobar avance. Las pruebas HTTP de
   contrato de autoría, lectura y evaluación ya están cubiertas localmente.
4. Usar ese modelo para cerrar una ruta principiante de solfeo antes de ampliar
   el catálogo: pulso, nombres de notas, altura/dirección y escucha básica.
5. Después, mejorar feedback por error y repetición espaciada usando `weakTags`,
   precisión y fecha de práctica, con una explicación visible de por qué se
   propone cada repaso.

## Documentos fuente

- `AGENTS.md`: propósito, límites pedagógicos, arquitectura y reglas de
  trabajo.
- `docs/roadmap-mvps.md`: alcance y puertas de validación por MVP.
- Este archivo: estado operativo compacto y siguiente relevo.
- `../piano-app-api/AGENTS.md` y `../piano-app-api/README.md`: contrato de la
  API, esquema y estado de las migraciones.
