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

export function StaffPrompt({ notes, clef = "treble" }: { notes: StaffRenderNote[]; clef?: "treble" }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    host.innerHTML = "";
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
    const note = new StaveNote({
      clef,
      keys: keys.map((item) => item.key),
      duration: "q",
    });

    keys.forEach((item, index) => {
      if (item.accidental) {
        note.addModifier(new Accidental(item.accidental), index);
      }
    });

    const voice = new Voice({ numBeats: 1, beatValue: 4 });
    voice.addTickables([note]);

    new Formatter().joinVoices([voice]).format([voice], width - 110);
    voice.draw(context, stave);
  }, [clef, notes]);

  return <div ref={ref} className="w-full overflow-hidden rounded-xl bg-[#101b33]" />;
}
