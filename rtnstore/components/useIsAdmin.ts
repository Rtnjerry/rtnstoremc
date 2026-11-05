"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function useIsAdmin() {
  const { isSignedIn, userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!isSignedIn) {
      setIsAdmin(false);
      return;
    }
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [isSignedIn, userId]);
  return isAdmin;
}
