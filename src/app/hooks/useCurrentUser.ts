"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

export type CurrentUser = {
  id: string;
  email: string | null;
  provider: string | null;
  displayName: string;
  username?: string;
  avatarUrl?: string;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      const m = (user.user_metadata ?? {}) as any;
      return {
        id: user.id,
        email: user.email ?? null,
        provider: user.app_metadata?.provider ?? null,
        displayName: m.display_name ?? m.name ?? user.email?.split("@")[0] ?? "Usuario",
        username: m.username ?? "",
        avatarUrl: m.avatar_url ?? m.picture ?? undefined,
      };
    },
    staleTime: 60_000,
  });
}
