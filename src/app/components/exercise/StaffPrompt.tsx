"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import type { StaffRenderNote } from "@/lib/exercises/contracts";

function midiToVexKey(midi: number) {
  const note = Tone.Frequency(midi, "midi").toNote();
  const match = note.match(/^([A-G])([#b]?)(-?\d)$/);
  if (!match) return { key: "c/4", accidental: null as string | null };
  const [, letter, accidental, octave] = match;
  return {
    key: `${letter.toLowerCase()}${accidental}/${octave}`,
    accidental: accidental || null,
  };
}

export function StaffPrompt({ notes, clef = "treble", variant = "default", onPlay, separateNotes = false }: { notes: StaffRenderNote[]; clef?: "treble"; variant?: "default" | "incorrect" | "selected"; onPlay?: (notes: StaffRenderNote[]) => void; separateNotes?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    host.innerHTML = "";
    if (!notes.length) return;
    const width = Math.max(host.clientWidth || 420, 320);
    const height = 160;

    const renderer = new Renderer(host, Renderer.Backends.SVG);
    renderer.resize(width, height);

    const context = renderer.getContext();
    context.setFillStyle("#f8fafc");
    context.setStrokeStyle("#f8fafc");

    const stave = new Stave(20, 24, width - 40);
    stave.setContext(context);
    stave.addClef(clef);
    stave.draw();

    const keys = notes.map((item) => midiToVexKey(item.midi));
    const staveNotes = separateNotes
      ? keys.map((item, index) => {
          const note = new StaveNote({ clef, keys: [item.key], duration: "q" });
          if (index > 0 && variant === "incorrect") note.setStyle({ fillStyle: "#fb7185", strokeStyle: "#fb7185" });
          if (index > 0 && variant === "selected") note.setStyle({ fillStyle: "#4ade80", strokeStyle: "#4ade80" });
          if (item.accidental) note.addModifier(new Accidental(item.accidental), 0);
          return note;
        })
      : [(() => {
          const note = new StaveNote({ clef, keys: keys.map((item) => item.key), duration: "q" });
          if (variant === "incorrect") note.setStyle({ fillStyle: "#fb7185", strokeStyle: "#fb7185" });
          if (variant === "selected") note.setStyle({ fillStyle: "#4ade80", strokeStyle: "#4ade80" });
          keys.forEach((item, index) => { if (item.accidental) note.addModifier(new Accidental(item.accidental), index); });
          return note;
        })()];

    const voice = new Voice({ numBeats: staveNotes.length, beatValue: 4 });
    voice.addTickables(staveNotes);

    new Formatter().joinVoices([voice]).format([voice], width - 110);
    voice.draw(context, stave);

    if (onPlay) {
      const renderedNotes = Array.from(host.querySelectorAll<SVGGElement>(".vf-stavenote"));
      renderedNotes.forEach((element, index) => {
        const playedNotes = separateNotes ? [notes[index]] : notes;
        if (!playedNotes[0]) return;
        element.style.cursor = "pointer";
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-label", `Reproducir nota ${index + 1}`);
        const playThisNote = () => onPlay(playedNotes);
        element.addEventListener("click", (event) => { event.stopPropagation(); playThisNote(); });
        element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); playThisNote(); } });
      });
    }
  }, [clef, notes, onPlay, separateNotes, variant]);

  return <div ref={ref} className="w-full overflow-hidden rounded-xl bg-[#101b33]" />;
}
