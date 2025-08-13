"use client";

import { useSession } from "next-auth/react";
import { User } from "@/lib/types";

export function useAuth() {
  const { data: session, status } = useSession();

  const user: User | null = session?.user ? {
    _id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: session.user.role,
    createdAt: new Date(), // No disponible en la sesión
    updatedAt: new Date(), // No disponible en la sesión
  } : null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "ADMIN",
    isCreador: user?.role === "CREADOR",
    hasAdminPrivileges: user?.role === "ADMIN" || user?.role === "CREADOR",
    hasCreadorPrivileges: user?.role === "CREADOR",
  };
}
