"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

export default function PermissionsPage() {
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

  const permissions = [
    { key: 'canCreateProducts', label: 'Crear Productos', icon: '➕' },
    { key: 'canEditProducts', label: 'Editar Productos', icon: '✏️' },
    { key: 'canDeleteProducts', label: 'Eliminar Productos', icon: '🗑️' },
    { key: 'canViewProducts', label: 'Ver Productos', icon: '👁️' },
    { key: 'canViewOrders', label: 'Ver Órdenes', icon: '📋' },
    { key: 'canManageUsers', label: 'Gestionar Usuarios', icon: '👥' },
    { key: 'canChangeUserRoles', label: 'Cambiar Roles', icon: '🔄' },
    { key: 'canAccessAdminPanel', label: 'Panel Admin', icon: '⚙️' },
  ] as const;

  return (
    <div className="container mx-auto py-8 px-4 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔐 Matriz de Permisos
        </h1>
        <p className="text-gray-600">
          Visualización completa de todos los permisos por rol
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permisos del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Permiso</th>
                  <th className="text-center py-3 px-4 font-semibold text-green-600">
                    👥 USER
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-600">
                    🛠️ ADMIN
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-purple-600">
                    👑 CREADOR
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.key} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      <span className="mr-2">{permission.icon}</span>
                      {permission.label}
                    </td>
                    <td className="text-center py-3 px-4">
                      {ROLE_PERMISSIONS.USER[permission.key] ? (
                        <span className="text-green-600 text-xl">✅</span>
                      ) : (
                        <span className="text-red-500 text-xl">❌</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {ROLE_PERMISSIONS.ADMIN[permission.key] ? (
                        <span className="text-green-600 text-xl">✅</span>
                      ) : (
                        <span className="text-red-500 text-xl">❌</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {ROLE_PERMISSIONS.CREADOR[permission.key] ? (
                        <span className="text-green-600 text-xl">✅</span>
                      ) : (
                        <span className="text-red-500 text-xl">❌</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notas importantes */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              ⚠️ Notas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <ul className="space-y-2 text-sm">
              <li>• Solo CREADOR puede ver todas las órdenes del sistema</li>
              <li>• Solo CREADOR puede gestionar usuarios y cambiar roles</li>
              <li>• ADMIN no puede eliminar o degradar al CREADOR</li>
              <li>• Los cambios de roles son inmediatos y requieren nueva sesión</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              ℹ️ Jerarquía de Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">👑 CREADOR</span>
                <span>→ Máximo control</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🛠️ ADMIN</span>
                <span>→ Gestión de productos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">👥 USER</span>
                <span>→ Usuario final</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
