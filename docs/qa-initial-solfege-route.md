# Matriz de QA técnico — ruta inicial de solfeo

> Estado: protocolo técnico. No sustituye revisión musical ni pruebas con
> estudiantes. La evidencia humana se registra por separado y no se infiere de
> estos resultados.

## Alcance y entorno

La matriz cubre la ruta publicada de `solfege-foundations`. Ejecutar respuestas
correctas e incorrectas sólo contra un entorno local o de QA con una cuenta de
prueba. En producción, limitarse a catálogo, lecciones y corridas anónimas sin
enviar respuesta ni revelar solución, pues iniciar una corrida crea un registro
que expira.

Antes de una ejecución local de API:

```bash
pnpm run test
pnpm run build
pnpm run test:e2e
```

Antes de una ejecución local de frontend:

```bash
source /Users/mauriciolozano/.nvm/nvm.sh && nvm use 20 >/dev/null && npm run build
```

## Recorrido de catálogo y navegación

| Comprobación | Resultado esperado |
| --- | --- |
| `GET /sections/solfege-foundations/topics` | Diez temas en posiciones 1–10. |
| `GET /topics/:id/lessons` | Una lección activa por tema. |
| `GET /lessons/:id` | Explicación, práctica y recap; el repaso contiene dos prácticas. |
| `nextLesson` | Forma una cadena continua hasta «Primer acorde mayor», que no tiene siguiente. |
| Navegador | Cada enlace «Siguiente lección» cambia a la URL del tema y lección declarados. |

## Matriz por práctica

| Posición | Práctica | Respuesta evaluable | Comprobaciones técnicas |
| --- | --- | --- | --- |
| 1 | Pulso y silencio | `pulsePosition` | Patrón de cuatro pulsos, elección 1–4, feedback correcto/incorrecto y revelar. No afirmar tempo. |
| 2 | Dirección melódica | `direction` | Audio repetible, opciones asciende/desciende, feedback que nombra la dirección. |
| 3 | Notas naturales | `selectedMidis` | Teclado dentro del rango declarado, selección única y feedback de nota. |
| 4 | Lectura en clave de sol | `selectedMidis` | Pentagrama de una nota, teclado y feedback de posición escrita. |
| 5 | Cuenta figuras y silencios | `beatCount` | Figuras, guía de conteo, opciones y metrónomo visual local. No afirmar tempo. |
| 6 | Repaso: escucha y lectura | `direction` y `selectedMidis` en prácticas separadas | Dos bloques de ejercicio; cada respuesta conserva su contrato propio. |
| 7 | Segunda o quinta al oído | `interval` | Audio melódico repetible y opciones `M2`/`P5`. |
| 8 | Lee y escucha intervalos | `interval` | Dos notas en clave de sol corresponden a los MIDI de reproducción y opciones `M2`/`P5`. |
| 9 | Escala de Do mayor | `selectedMidis` | Rango 58–74, hasta ocho selecciones; se evalúa conjunto de notas, no orden. |
| 10 | Acorde de Do mayor | `selectedMidis` | Pentagrama y audio de MIDI 60/64/67; tres selecciones; no exigir nombre ni inversión. |

Para cada fila, en local/QA comprobar: inicio determinista con un `seed`, una
respuesta correcta, una incorrecta, repetición cuando aplica, revelar y la
recarga de la corrida. Confirmar que un run terminado no acepta una respuesta
adicional y que el feedback incluye `nextStep` sólo cuando corresponde.

## Accesibilidad técnica y estados

- Recorrer botones, opciones, teclado, revelar y siguiente actividad mediante
  teclado; comprobar foco visible y etiquetas accesibles.
- Comprobar carga, error de catálogo y ausencia de tema sin confundirlos.
- Probar audio con contexto no habilitado: la carga debe terminar y el control
  **Reproducir** debe permitir un intento posterior.
- Confirmar que metrónomo y guía rítmica no escriben progreso remoto; el tempo
  sólo se guarda en `localStorage`.
- Comprobar invitado y perfil autenticado por separado. Nunca usar revelar para
  alcanzar criterios de avance.

## Validación humana posterior

Antes de declarar la ruta como currículo validado, realizar sesiones con
estudiantes y revisión musical. Registrar comprensión de instrucciones,
percepción de intervalos, lectura de notación, utilidad del feedback,
accesibilidad y si los umbrales de seis intentos, 80 % y racha de dos son
razonables. Ajustar contenido o criterios según esa evidencia.
