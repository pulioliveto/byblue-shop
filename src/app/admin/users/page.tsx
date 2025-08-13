"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CREADOR';
  createdAt: string;
}

export default function UsersPage() {
  const { user, isLoading, hasCreadorPrivileges } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !hasCreadorPrivileges)) {
      router.push("/");
    }
  }, [user, isLoading, hasCreadorPrivileges, router]);

  useEffect(() => {
    if (user && hasCreadorPrivileges) {
      fetchUsers();
    }
  }, [user, hasCreadorPrivileges]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newRole,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista local
        setUsers(users.map(u => 
          u._id === userId ? { ...u, role: newRole as any } : u
        ));
        alert(`Rol actualizado exitosamente a ${newRole}`);
      } else {
        alert(data.error || 'Error al actualizar rol');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error al actualizar rol');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CREADOR':
        return 'text-purple-600 bg-purple-100';
      case 'ADMIN':
        return 'text-blue-600 bg-blue-100';
      case 'USER':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CREADOR':
        return '👑';
      case 'ADMIN':
        return '🛠️';
      case 'USER':
        return '👤';
      default:
        return '❓';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          👥 Gestionar Usuarios
        </h1>
        <p className="text-gray-600">
          Ver y modificar roles de todos los usuarios registrados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userItem) => (
              <div
                key={userItem._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {userItem.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {userItem.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}
                      >
                        {getRoleIcon(userItem.role)} {userItem.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{userItem.email}</p>
                    <p className="text-xs text-gray-400">
                      Registrado: {new Date(userItem.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {userItem._id !== user._id ? (
                    <Select
                      value={userItem.role}
                      onValueChange={(newRole: string) => handleRoleChange(userItem._id, newRole)}
                      disabled={updating === userItem._id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">
                          👤 USER
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          🛠️ ADMIN
                        </SelectItem>
                        <SelectItem value="CREADOR">
                          👑 CREADOR
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-gray-500 font-medium px-3 py-2 bg-gray-100 rounded">
                      Tú mismo
                    </div>
                  )}
                  
                  {updating === userItem._id && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay usuarios registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {users.filter(u => u.role === 'USER').length}
              </div>
              <div className="text-sm text-gray-500">👤 Usuarios</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-gray-500">🛠️ Administradores</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {users.filter(u => u.role === 'CREADOR').length}
              </div>
              <div className="text-sm text-gray-500">👑 Creadores</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
