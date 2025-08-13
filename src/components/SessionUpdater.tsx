"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function SessionUpdater() {
  const { data: session, update } = useSession();
  const hasUpdated = useRef(false);

  useEffect(() => {
    // Solo actualizar una vez por sesión y solo si hay una sesión activa
    if (session && !hasUpdated.current) {
      hasUpdated.current = true;
      // Actualizar después de un pequeño delay para evitar bucles
      const timeoutId = setTimeout(() => {
        update();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [session, update]);

  return null; // Este componente no renderiza nada
}
