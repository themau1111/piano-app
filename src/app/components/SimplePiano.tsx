"use client";
import * as Tone from "tone";
import { useEffect, useRef } from "react";

type Props = {
  active: Set<number>;
  selected: Set<number>;
  onKeyDown: (midi: number) => void;
  onKeyUp: (midi: number) => void;
  range?: [number, number];
};

export function SimplePiano({ active, selected, onKeyDown, onKeyUp, range = [60, 72] }: Props) {
  const sampler = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
    if (!sampler.current) {
      sampler.current = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 30,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      }).toDestination();
    }
  }, []);

  const isBlack = (m: number) => [1, 3, 6, 8, 10].includes(m % 12);
  const midiToNote = (m: number) => Tone.Frequency(m, "midi").toNote(); // p.ej. 60 -> "C4"

  const keys = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);
  const whiteKeys = keys.filter((k) => !isBlack(k));
  const blackKeys = keys.filter(isBlack);

  const wWhite = 100 / whiteKeys.length;
  const wBlack = wWhite * 0.6;

  const handleDown = async (m: number) => {
    await Tone.start(); // asegura el AudioContext al primer click
    onKeyDown(m);
    sampler.current?.triggerAttack(midiToNote(m));
  };

  const handleUp = (m: number) => {
    onKeyUp(m);
    sampler.current?.triggerRelease(midiToNote(m));
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* BLANCAS */}
      <div className="flex w-full h-full">
        {whiteKeys.map((m) => (
          <button
            key={m}
            onMouseDown={() => handleDown(m)}
            onMouseUp={() => handleUp(m)}
            onMouseLeave={() => active.has(m) && handleUp(m)} // evita notas colgadas
            className={`flex-1 h-full border border-black bg-white
              ${active.has(m) ? "outline outline-2 outline-blue-500" : ""}
              ${selected.has(m) ? "ring-2 ring-green-500" : ""}
            `}
            title={`${m}`}
          />
        ))}
      </div>

      {/* NEGRAS */}
      <div className="absolute inset-0 h-[60%] pointer-events-none">
        {blackKeys.map((m) => {
          const nWhitesBefore = whiteKeys.filter((w) => w < m).length;
          const left = nWhitesBefore * wWhite; // centro del hueco
          return (
            <button
              key={m}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDown(m);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                handleUp(m);
              }}
              // onMouseLeave={(e) => {
              //   e.stopPropagation();
              //   active.has(m) && handleUp(m);
              // }}
              style={{ left: `${left}%`, width: `${wBlack}%` }}
              className={`absolute top-0 translate-x-[-50%] h-full
                          bg-black border border-neutral-800 pointer-events-auto
                          ${active.has(m) ? "outline outline-2 outline-blue-500" : ""}
                          ${selected.has(m) ? "ring-2 ring-green-500" : ""}`}
              title={`${m}`}
            />
          );
        })}
      </div>
    </div>
  );
}
