"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth";

type ProtectedPageProps = {
  children: ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
};

export default function ProtectedPage({
  children,
  allowedRoles,
  fallbackPath = "/login",
}: ProtectedPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSessionUser();

    if (!session) {
      router.replace(fallbackPath);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.includes(session.rol);

      if (!hasAccess) {
        router.replace("/");
        return;
      }
    }

    setUser(session);
    setReady(true);
  }, [router, allowedRoles, fallbackPath]);

  if (!ready || !user) {
    return null;
  }

  return <>{children}</>;
}