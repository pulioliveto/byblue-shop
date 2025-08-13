"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RolesPage() {
  const { user, isLoading, hasCreadorPrivileges } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !hasCreadorPrivileges)) {
      router.push("/");
    }
  }, [user, isLoading, hasCreadorPrivileges, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !hasCreadorPrivileges) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración de Roles
        </h1>
        <p className="text-gray-600">
          Gestiona los roles y permisos del sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👤 Gestionar Usuarios
            </CardTitle>
            <CardDescription>
              Ver, editar y cambiar roles de todos los usuarios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">
                Ir a Usuarios
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tarjeta de Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚙️ Configurar Roles
            </CardTitle>
            <CardDescription>
              Configurar permisos específicos para cada rol del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/role-config">
                Configurar Roles
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tarjeta de Permisos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Ver Permisos
            </CardTitle>
            <CardDescription>
              Visualizar la matriz completa de permisos por rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/permissions">
                Ver Permisos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Información de Roles */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Información de Roles
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Rol USER */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">👥 USER</CardTitle>
              <CardDescription>Usuarios regulares del eCommerce</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Ver productos</li>
                <li>✅ Realizar compras</li>
                <li>✅ Gestionar perfil</li>
                <li>❌ Acceso limitado</li>
              </ul>
            </CardContent>
          </Card>

          {/* Rol ADMIN */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">🛠️ ADMIN</CardTitle>
              <CardDescription>Administradores con permisos de gestión</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Crear productos</li>
                <li>✅ Editar productos</li>
                <li>✅ Eliminar productos</li>
                <li>✅ Panel de admin</li>
                <li>❌ No puede ver órdenes</li>
                <li>❌ No puede gestionar usuarios</li>
              </ul>
            </CardContent>
          </Card>

          {/* Rol CREADOR */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">👑 CREADOR</CardTitle>
              <CardDescription>Máximo nivel de privilegios</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Todos los permisos de ADMIN</li>
                <li>✅ Ver todas las órdenes</li>
                <li>✅ Gestionar usuarios</li>
                <li>✅ Cambiar roles</li>
                <li>✅ Quitar permisos a ADMIN</li>
                <li className="text-purple-600 font-semibold">✅ Control total</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
