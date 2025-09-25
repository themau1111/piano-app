"use client";
import { useEffect } from "react";
import { useAuth } from "../../lib/auth-store";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const init = useAuth((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
