/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attempt, replay, reveal, startChord, type AttemptResponse, type StartResponse, type RevealResponse } from "@/lib/api/chordRunner";

export function useStartChord() {
  return useMutation<StartResponse, Error, Parameters<typeof startChord>[0]>({
    mutationFn: (b) => startChord(b),
  });
}

export function useReplay() {
  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: "block" | "arpeggio" | "arpeggioSlow" | "arpeggioVerySlow" }) => replay(id, mode),
  });
}

export function useAttempt() {
  return useMutation<AttemptResponse, Error, { exerciseId: string; notes: number[]; name?: string; inversion?: 0 | 1 | 2 | 3 }>({
    mutationFn: (b) => attempt(b),
  });
}

export function useReveal() {
  return useMutation<RevealResponse, Error, { exerciseId: string }>({
    mutationFn: ({ exerciseId }) => reveal(exerciseId),
  });
}
