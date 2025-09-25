import { create } from "zustand";
import { supabase } from "./supabaseClient";

type AuthState = {
  mode: "guest" | "auth";
  guestId?: string;
  userId?: string;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
};

function ensureGuestId(): string {
  const k = "guestId";
  let id = localStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(k, id);
  }
  return id;
}

export const useAuth = create<AuthState>((set) => ({
  mode: "guest",
  init: async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (user) {
      set({ mode: "auth", userId: user.id });
    } else {
      const guestId = ensureGuestId();
      set({ mode: "guest", guestId });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    const guestId = ensureGuestId();
    set({ mode: "guest", guestId, userId: undefined });
  },
}));
