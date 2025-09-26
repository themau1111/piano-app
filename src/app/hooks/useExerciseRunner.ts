/* eslint-disable @typescript-eslint/no-explicit-any */
import { runExercise } from "@/lib/api/api";
import { useMutation } from "@tanstack/react-query";

export function useExerciseRunner() {
  return useMutation({
    mutationFn: ({ type, payload }: { type: string; payload?: any }) => runExercise(type, payload),
  });
}
