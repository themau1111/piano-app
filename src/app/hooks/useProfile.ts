"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { ProfileSchema, type ProfileInput } from "../../lib/schemas/profile";

export function useProfile() {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const m = (user?.user_metadata ?? {}) as any;
      const profile: ProfileInput = {
        username: m.username ?? "",
        displayName: m.display_name ?? m.name ?? "",
        bio: m.bio ?? "",
        website: m.website ?? "",
        location: m.location ?? "",
        timezone: m.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
      };
      return {
        email: user?.email ?? "",
        provider: user?.app_metadata?.provider ?? "",
        profile,
      };
    },
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: ProfileInput) => {
      const parsed = ProfileSchema.parse(input);
      await supabase.auth.updateUser({
        data: {
          username: parsed.username || null,
          display_name: parsed.displayName || null,
          bio: parsed.bio || null,
          website: parsed.website || null,
          location: parsed.location || null,
          timezone: parsed.timezone || null,
        },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return {
    ...profileQuery,
    update: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}
