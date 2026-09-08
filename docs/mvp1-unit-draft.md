# Borrador de revisión — Unidad 1: primeros vínculos de solfeo

> Estado: diseño pedagógico con implementación técnica publicada. La ruta y sus
> seeds existen en el catálogo, pero no están aprobados como currículo validado:
> requieren revisión musical y pruebas con estudiantes antes de afirmar eficacia
> pedagógica o dominio.

## Propósito y población

Esta unidad está pensada para una persona adulta autodidacta que empieza
solfeo y puede practicar sin instrumento. Al terminar, debe poder describir
con palabras simples la relación entre pulso, altura, nombres de notas y una
nota escrita en un rango muy reducido. El teclado visual sirve de apoyo, pero
no es requisito para ninguna actividad.

La unidad propone una variable nueva a la vez y reutiliza la anterior. No
declara dominio de ritmo interpretado, canto, tempo ni técnica instrumental:
esas evidencias requerirán instrumentos y contratos de evaluación distintos.

## Resultado observable de la unidad

La persona puede:

1. Identificar el pulso regular de un ejemplo breve y distinguirlo de un
   silencio, mediante una respuesta explícita en pantalla.
2. Decir si el segundo de dos sonidos es más agudo o más grave y nombrar una
   melodía ascendente o descendente.
3. Nombrar las notas naturales A–G y ubicar una nota natural dada en un
   teclado visual dentro de un rango indicado.
4. Relacionar una nota natural escrita en clave de sol y rango reducido con su
   nombre y su posición en el teclado visual.
5. Explicar, tras un error, qué comparó o qué referencia usará en el siguiente
   intento.

## Secuencia propuesta

| Orden | Lección | Objetivo observable | Prerrequisitos | Modalidad | Evidencia y siguiente paso |
| --- | --- | --- | --- | --- | --- |
| 1 | Pulso y silencio | Reconoce si un ejemplo contiene pulsos regulares o un silencio en una posición señalada. | Ninguno. | Escuchar y observar. | Respuesta de elección; repetir el ejemplo y contar con una guía visual si falla. |
| 2 | ¿La melodía sube o baja? | Distingue si el segundo sonido es más agudo o más grave. | Comparar dos eventos y usar “arriba/abajo”. | Escuchar. | `melodic_direction`; ya implementada como primera actividad. |
| 3 | Los nombres de las notas | Ordena o nombra notas naturales A–G sin añadir sostenidos ni bemoles. | Entender que una nota puede nombrarse. | Leer, observar y responder. | Reconocimiento de nombre y posición; volver a la secuencia A–G si confunde el ciclo. |
| 4 | Del nombre al teclado | Ubica una nota natural solicitada dentro de un rango visual. | Nombres de notas naturales y patrón repetido del teclado. | Observar y tocar/clicar. | `keyboard_note` restringido a naturales y rango breve; feedback nombra la tecla y la repetición del patrón. |
| 5 | Primera lectura en clave de sol | Lee una nota natural en un rango de cinco notas, la nombra y la relaciona con el teclado. | Nombre de nota y ubicación visual. | Leer y tocar/clicar. | `staff_note` restringido a cinco notas sin líneas adicionales; feedback separa nombre, altura y posición. |
| 6 | Recuperación conectada | Elige o ejecuta la conexión correcta entre una nota escrita, su nombre y un par sonoro. | Lecciones 1–5. | Mixta. | Reto corto con una sola variable evaluada por vez; recomienda una lección concreta según el error. |

Las lecciones 1–6 ya se sembraron técnicamente con contratos compatibles. La
secuencia publicada añade después intervalos, una práctica de lectura y escucha,
escala y acorde de Do mayor. Falta confirmar con revisión musical y estudiantes
que el orden, feedback y criterios provisionales cumplen su propósito.

## Reglas de contenido y feedback

- Explicar antes de pedir una respuesta. Cada explicación usa una frase breve,
  un ejemplo visual o audible repetible y una acción siguiente.
- El feedback de altura indica cuál de los dos sonidos fue más agudo/grave; no
  sólo muestra “incorrecto”.
- El feedback de nombres de notas distingue confundir el nombre de confundir la
  ubicación en el teclado. No asume que ambos errores son equivalentes.
- La introducción al pentagrama limita la novedad: clave de sol, cinco notas
  naturales contiguas y sin líneas adicionales. Alteraciones, rangos mayores y
  ritmo escrito quedan fuera de esta unidad.
- Cada práctica ofrece repetición de audio cuando hay audio y navegación por
  teclado. No exige MIDI ni micrófono.

## Criterios provisionales de evidencia

Estos umbrales orientan implementación y prueba; no son una definición de
dominio validada.

| Habilidad | Mínimo provisional | Límite de interpretación |
| --- | --- | --- |
| Dirección melódica | 6 intentos, 80 % de precisión, racha 2. | Ya existe en la plantilla; validar comprensión auditiva con personas. |
| Nombres de notas | 6 respuestas, 80 % de precisión. | No inferir lectura en pentagrama. |
| Nota en teclado | 6 respuestas, 80 % de precisión. | Mide ubicación visual, no técnica pianística. |
| Nota en pentagrama | 6 respuestas, 80 % de precisión. | Mide asociación básica en rango reducido, no fluidez lectora. |
| Pulso | Pendiente de contrato de respuesta evaluable. | No afirmar precisión temporal sin una medición diseñada para ello. |

## Revisión pedagógica solicitada

La persona revisora debe aprobar o ajustar antes de publicar:

1. El orden pulso → altura → nombres → lectura y el vocabulario usado.
2. Los rangos y ejemplos sonoros, incluidos timbre, registro y separación entre
   sonidos.
3. Los errores frecuentes y el texto de feedback de cada práctica.
4. Los umbrales de evidencia y si una actividad debe ser obligatoria u opcional.
5. Que los ejemplos, notación y audio sean propios o tengan derechos de uso
   confirmados.

## Protocolo de QA para la lección de dirección ya publicada

Usar una sesión identificada como QA, distinta de cualquier participante de la
prueba humana. Registrar fecha, navegador, versión publicada y resultado; no
usar revelar para completar intentos.

1. Abrir «¿La melodía sube o baja?» e iniciar sesión de QA.
2. Reproducir cada par y responder por escucha. Repetir audio si es necesario.
3. Completar al menos seis intentos con 80 % o más de precisión y una racha de
   dos aciertos. Registrar aciertos, errores y la dirección esperada según el
   feedback mostrado.
4. Pulsar **Comprobar mi avance**. Debe mostrar «Lección completada» y no una
   lista de evidencia faltante.
5. Recargar la página, volver a comprobar el avance y confirmar que mantiene
   el estado completado.
6. Anotar por separado cualquier problema de audio: ausencia de una nota,
   orden ambiguo, repetición incompleta o feedback incompatible con lo oído.

Esta prueba comprueba funcionamiento del flujo. No sustituye la prueba con
estudiantes ni valida los umbrales pedagógicos.
