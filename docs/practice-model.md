# Práctica libre y retos guiados

MusicAula ofrece dos formas de practicar. Las **rutas de aprendizaje** usan
retos guiados para aportar evidencia a una lección. La **práctica libre** crea
una sesión nueva a partir de una definición de ejercicio y una configuración
validada; sus resultados alimentan estadísticas y recomendaciones, pero no
desbloquean rutas.

## Contrato operativo

- `GET /exercises/practice/presets` expone las definiciones activas disponibles
  para práctica libre. Mientras no haya presets editoriales adicionales, cada
  ejercicio activo funciona como preset base.
- `POST /exercises/practice/sessions` recibe `exerciseId`, `locale`, un límite
  opcional de preguntas, segundos opcionales por pregunta y una configuración
  parcial. La API fusiona y normaliza la configuración antes de crear la sesión
  y su primera corrida.
- `POST /exercises/practice/sessions/:sessionId/next` genera la siguiente
  corrida de esa sesión; `POST /exercise-runs/:runId/timeout` registra el
  vencimiento de una pregunta cronometrada como incorrecta.

Las filas históricas de `exercise_runs` siguen siendo válidas. Las nuevas
columnas de sesión, modo, locale y snapshot de configuración son aditivas.
Los retos guiados nuevos permiten reintentar; las sesiones libres limitadas por
tiempo admiten una respuesta por pregunta y avanzan tras un vencimiento.

## Persistencia local

Los controles de teclado (nombres de nota, octavas visibles, rango y compás)
y la notación Español/English se guardan por dispositivo. La preferencia de
idioma también usa el campo de preferencias existente cuando la persona guarda
su perfil.
