"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, string> = {
  Configuration: "Hay un problema con la configuración del servidor.",
  AccessDenied: "No tienes permisos para acceder a esta aplicación.",
  Verification: "El token ha expirado o ya fue usado.",
  Default: "Ocurrió un error durante el proceso de autenticación.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            Error de Autenticación
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Si el problema persiste, por favor contacta a soporte.
            </p>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/signin">
                  Intentar de nuevo
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
