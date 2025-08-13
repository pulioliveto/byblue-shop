"use client";

import { useSession, signOut } from "next-auth/react";

export function useRefreshSession() {
  const { data: session, update } = useSession();

  const refreshSession = async () => {
    try {
      console.log('Refrescando sesión...');
      // Forzar actualización de la sesión desde la base de datos
      const updatedSession = await update();
      console.log('Sesión actualizada:', updatedSession);
      return updatedSession;
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      return null;
    }
  };

  const forceReauth = () => {
    // Cerrar sesión y redirigir al login para re-autenticar
    signOut({ 
      callbackUrl: '/auth/signin',
      redirect: true 
    });
  };

  return {
    refreshSession,
    forceReauth,
    session
  };
}
