# Guía de producto y trabajo para agentes — MusicAula

> Documento vivo. Actualizarlo en el mismo cambio cuando se altere el propósito,
> el modelo pedagógico, el catálogo de ejercicios o una decisión técnica relevante.

## 1. Propósito

**MusicAula** es una plataforma web para aprender música, inicialmente centrada
en piano/teclado y teoría musical. Debe ayudar a una persona a **comprender,
escuchar, leer y tocar**, no solamente a contestar preguntas.

El producto debe poder crecer sin quedar atado a un formato fijo de lección o
ejercicio. La unidad de aprendizaje puede evolucionar: una explicación breve,
un reto de escucha, práctica en teclado, lectura en pentagrama, una canción,
un proyecto de composición o una combinación de estos.

### Principios no negociables

1. **Aprendizaje antes que gamificación.** Las rachas, puntos y recompensas
   sólo se incorporan si refuerzan una práctica útil; nunca deben presionar,
   castigar errores o reemplazar feedback musical.
2. **Práctica activa con feedback.** Cada actividad debe pedir una acción
   musical verificable y explicar el resultado: qué pasó, por qué y qué intentar
   después.
3. **Progresión gradual y adaptable.** Introducir una variable nueva por vez;
   reutilizar habilidades previas; ajustar dificultad con desempeño, objetivo,
   tiempo disponible y experiencia declarada.
4. **Música conectada.** Relacionar teoría, oído, lectura y teclado. Evitar que
   los ejercicios se conviertan en trivias aisladas.
5. **Accesible y amable.** Español como idioma inicial, lenguaje claro,
   navegación con teclado, contraste suficiente, audio opcional/repetible y
   alternativas cuando no haya teclado MIDI.
6. **Contenido basado en evidencia y revisión humana.** Un asistente puede
   explicar, proponer variaciones y orientar; no debe inventar teoría musical,
   evaluar como verdad una respuesta ambigua ni cambiar el currículo publicado
   sin revisión.

## 2. Estado actual verificado

El repositorio contiene el **frontend Next.js 15 + React 19 + TypeScript** de
MusicAula. La API de catálogo, ejecución y progreso es externa y se configura
con `NEXT_PUBLIC_API_URL`; la autenticación se realiza con Supabase.

Las redirecciones OAuth se construyen con `NEXT_PUBLIC_APP_URL` (con fallback a
`window.location.origin` sólo para desarrollo). Cada URL pública debe estar
registrada en Supabase Auth como `Site URL` y en la lista de `Redirect URLs`.

### Flujo disponible

`Inicio → sección → tema → plantilla de ejercicio → ejecución → feedback →
progreso / cola de práctica`

- Inicio: secciones, resumen de progreso y cola de práctica para usuarios
  autenticados; los invitados ven un resumen local de sus intentos. El piano
  de la portada conserva la última combinación de dos o más notas y muestra un
  mapa de intervalos entre ellas; mientras está visible sustituye el
  resumen/cola de esa zona (`src/app/page.tsx`). En móvil, el piano incluye un
  modo de captura para sostener notas, una acción para limpiar y una vista
  ampliada a pantalla completa que solicita orientación horizontal, con
  desplazamiento horizontal como fallback. Esa vista bloquea el scroll de la
  página subyacente y permite desplazarse hasta el mapa de intervalos.
- Contenido: secciones y temas navegables bajo `src/app/sections/`.
- Ejecución: `ExerciseRunner` genera/inicia una corrida, conserva su `runId` en
  `localStorage`, permite responder, repetir audio, revelar y avanzar.
- Catálogo administrativo: un usuario `admin` puede crear secciones, temas y
  plantillas, previsualizarlas, activarlas y ejecutar un seed básico
  (`src/app/admin/page.tsx`).
- Preferencias: nivel, objetivos, estilos, lectura, teoría, tiempo de práctica,
  instrumentos y equipo (`src/lib/prefs.ts`).
- Uso sin cuenta: los ejercicios se pueden ejecutar como invitado y sus
  estadísticas se conservan en `localStorage`. El progreso de un perfil
  autenticado sigue siendo responsabilidad de la API; no existe aún un contrato
  para migrar el historial local al perfil.

### Tipos actuales de ejercicio

Las plantillas están tipadas en `src/lib/exercises/contracts.ts` y se ejecutan
del lado de la API. Cada una admite restricciones, presentación y regla de
dominio (`minAttempts`, precisión y racha).

| Tipo | Habilidad inicial |
| --- | --- |
| `keyboard_note` | Ubicar una nota en el teclado |
| `staff_note` | Leer nota en clave de sol y tocarla |
| `ear_interval` | Reconocer intervalos melódicos o armónicos |
| `scale_construction` | Construir escalas en el teclado |
| `chord_identification` | Reconocer / construir acordes e inversiones |

Dependencias musicales existentes: Tone.js (audio), VexFlow (notación),
react-piano y Tonal. Se usa una fuente Bravura local para música.

### Límites actuales que deben asumirse hasta que cambien

- No hay backend de ejercicios en este repositorio; no simular ni asumir sus
  reglas internas. Cambios al contrato deben coordinarse con la API.
- El teclado visual funciona; la entrada MIDI, evaluación de tempo y evaluación
  por micrófono no están implementadas como producto fiable.
- El chat actual usa Gemini mediante `/api/chat/stream`; no es todavía un tutor
  conectado al progreso ni una fuente curricular.
- Sólo existe una capa inicial de lecciones: la experiencia se concentra hoy en
  secciones, temas y ejercicios. No presentar el producto como currículo
  completo hasta añadir objetivos, explicaciones, prerequisitos y cierre por
  lección.

## 3. Modelo pedagógico de referencia

Cada actividad nueva debe declarar, como mínimo:

```ts
type LearningActivity = {
  objective: string;                 // habilidad observable, no sólo tema
  prerequisites: string[];
  skillTags: string[];
  modality: "read" | "listen" | "play" | "create" | "mixed";
  prompt: string;
  answerOrPerformance: string;
  feedback: {
    correct: string;
    commonMistakes: Record<string, string>;
    nextStep: string;
  };
  difficulty: Record<string, unknown>;
  mastery: { minAttempts: number; minAccuracy: number; minStreak: number };
};
```

No hace falta adoptar este tipo literalmente hoy; es el contrato conceptual
para que futuras plantillas y lecciones mantengan coherencia.

**Definición de terminado para una actividad:** objetivo y prerequisitos
claros; respuesta evaluable; feedback específico; repetición segura; rango de
dificultad; accesibilidad de interacción/audio; instrumentación mínima; y
pruebas con respuestas correctas, incorrectas y casos límite.

## 4. Dirección curricular sugerida

El currículo no debe ser estrictamente lineal, pero sí tener dependencias
visibles. Primera ruta recomendada:

1. **Fundamentos de teclado:** nombres de notas, orientación, pulso y postura.
2. **Lectura y ritmo:** pentagrama, claves, figuras, compases y lectura corta.
3. **Intervalos y escalas:** reconocer, cantar/tocar, construir y escuchar.
4. **Acordes y armonía funcional:** tríadas, inversiones, tonalidad y
   progresiones sencillas.
5. **Repertorio y creatividad:** acompañamientos, patrones, canciones,
   improvisación y composición pequeña.

Cada habilidad debería pasar, cuando corresponda, por: explicación breve →
ejemplo audible/visual → práctica guiada → recuperación espaciada → aplicación
musical. Permitir que una persona entre por objetivo (por ejemplo, canciones o
improvisación) y mostrar los fundamentos que necesita en vez de bloquearla sin
explicación.

## 5. Backlog priorizado

### Próximo: consolidar el núcleo

- [ ] Definir el modelo de **lección**: objetivo, prerequisitos, bloques de
  explicación/práctica, criterio de finalización y siguiente paso.
- [ ] Completar una ruta de principiante de punta a punta y validarla con
  estudiantes reales antes de multiplicar contenido.
- [ ] Mostrar feedback didáctico y accionable por error, no sólo correcto /
  incorrecto o revelar respuesta.
- [ ] Usar `weakTags`, precisión y fecha de práctica para una repetición
  espaciada explicable: “practica esto porque…”.
- [ ] Añadir pruebas de contrato para cada `ExerciseKind` y ejemplos de seeds
  reproducibles para diseño y QA.
- [ ] Corregir los conflictos de merge visibles en `README.md` y reemplazarlo
  por una introducción real del proyecto y comandos verificables.

### Después: mejorar la práctica musical

- [ ] Ritmo: lectura, pulsación, metrónomo y patrones graduados.
- [ ] Escucha: dictado melódico/rítmico, calidad de acordes, progresiones y
  distintos timbres; no depender de un solo sonido MIDI.
- [ ] MIDI Web: detectar notas, acordes y timing de un teclado externo, con
  alternativa completa en teclado visual.
- [ ] Canciones y acompañamiento: fragmentos pequeños, tempo ajustable,
  repetición por compás y conexión explícita con la teoría.
- [ ] Diagnóstico inicial corto y plan personal basado en objetivos y nivel.
- [ ] Métricas de aprendizaje: tiempo útil, retención, errores recurrentes y
  dominio por habilidad; evitar usar sólo sesiones o rachas como éxito.

### Más adelante: capacidades de plataforma

- [ ] Autoría de contenido versionada, con revisión pedagógica, borrador,
  publicación, retirada y migración de progreso.
- [ ] Personalización por instrumento, estilo, objetivos y necesidades de
  accesibilidad; conservar el núcleo de teoría común.
- [ ] Modo docente: asignaciones con límites de tiempo/preguntas, enlaces a
  configuraciones concretas y reportes de avance.
- [ ] Tutor conversacional con contexto explícito de la lección y progreso,
  límites de seguridad y evaluación de respuestas antes de publicarlo.
- [ ] Grabación o análisis de audio sólo con consentimiento informado, una
  política clara de retención y una alternativa sin micrófono.

## 6. Ideas investigadas que vale la pena adaptar

- **teoria.com:** separa tutoriales, ejercicios y material de referencia; sus
  ejercicios ofrecen opciones de dificultad, rango, modo de respuesta,
  repetición y límites por tiempo o número de preguntas. Conservar esa
  profundidad de configuración, pero modernizar la explicación, la secuencia y
  la retroalimentación.
- **musictheory.net:** distingue identificación y construcción, permite
  personalizar ejercicios y compartir una configuración estable. Adaptar la
  idea de URL/identificador de configuración reproducible para docentes, QA y
  estudiantes, además de un modo reto finito.
- **Yousician:** combina rutas guiadas, metas/progreso y feedback inmediato de
  precisión y timing. Adoptar la ruta personal y feedback oportuno; no prometer
  detección de interpretación hasta validar MIDI/audio con usuarios reales.

Estas son referencias de patrón, no especificaciones para copiar su UX,
contenido, marca ni material protegido.

## 7. Cómo deben trabajar los agentes en este repositorio

1. Leer este archivo antes de cambiar arquitectura, contenido, feedback o
   progreso. Localizar el contrato en `src/lib/exercises/contracts.ts` antes de
   añadir un tipo de ejercicio.
2. Partir de una necesidad de aprendizaje concreta y documentar el objetivo,
   población, criterio de éxito y casos de error antes de implementar una nueva
   mecánica.
3. Mantener los cambios pequeños y compatibles: los ejercicios existentes y
   runs en curso no deben romperse por una evolución de plantillas.
4. Nunca mezclar la verdad pedagógica con una respuesta generada por IA sin
   revisión o fuente. No exponer secretos, claves de proveedor, datos de perfil
   o historial de práctica en prompts ni logs.
5. Antes de declarar terminado: ejecutar la validación pertinente; comprobar
   navegación por teclado, estados de carga/error y el flujo correcto,
   incorrecto, repetir, revelar y siguiente actividad.
6. Si se introduce IA en producto: limitarla al contexto necesario, definir
   qué puede y no puede hacer, describir su fallback y crear ejemplos/evals de
   respuestas correctas, equivocadas y ambiguas. Una guía de OpenAI recomienda
   instrucciones compactas, una sola fuente de reglas, acciones explícitas y
   límites claros de autonomía.
7. Actualizar este archivo y/o `README.md` cuando cambien el estado verificado,
   los contratos, decisiones de producto o prioridades. No documentar deseos
   como capacidades ya entregadas.
8. Al cerrar un cambio verificable: integrar primero a `development`, validar
   la integración y después promoverlo a `main`. No subir directamente a
   `main` cambios que no hayan pasado por `development`, salvo una instrucción
   explícita para una corrección urgente.

## 8. Decisiones pendientes que requieren producto/pedagogía

- Público inicial: ¿adultos autodidactas, niños, docentes/alumnos o mezcla?
- Alcance inicial: ¿piano y teoría general, o primero sólo piano principiante?
- Definición de dominio: ¿qué evidencia basta para avanzar y cuándo conviene
  repasar?
- Contenido propio y derechos para canciones, ejemplos de audio y partituras.
- Rol y límites del tutor IA: ayuda explicativa, generación de práctica,
  evaluación o acompañamiento; cada uno implica requisitos distintos.

## 9. Fuentes consultadas

- [OpenAI — Model guidance](https://developers.openai.com/api/docs/guides/latest-model):
  instrucciones concisas, no duplicadas, acciones/autonomía explícitas y
  validación con evaluaciones representativas.
- [teoria.com — How to use teoria.com](https://www.teoria.com/en/help/web-help.php):
  separación entre tutoriales, ejercicios, referencia y artículos.
- [teoria.com — The Exercises](https://www.teoria.com/en/help/exercises-help.php?sec=ie2):
  categorías de entrenamiento auditivo, teoría, lectura, escalas, acordes y
  ritmo.
- [musictheory.net — Exercises](https://www.musictheory.net/exercises) y
  [FAQ](https://www.musictheory.net/faq): ejercicios de identificación y
  construcción, personalización y modo reto.
- [Yousician](https://yousician.com/): rutas de lecciones, objetivos, progreso
  y feedback de precisión/tiempo.
