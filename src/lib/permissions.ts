import React from 'react';
import { UserRole } from '@/lib/types';

export interface PermissionConfig {
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canViewProducts: boolean;
  canViewOrders: boolean;
  canManageUsers: boolean;
  canChangeUserRoles: boolean;
  canAccessAdminPanel: boolean;
}

/**
 * Define los permisos para cada rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionConfig> = {
  USER: {
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canViewProducts: true,
    canViewOrders: false,
    canManageUsers: false,
    canChangeUserRoles: false,
    canAccessAdminPanel: false,
  },
  ADMIN: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewProducts: true,
    canViewOrders: false, // Solo CREADOR puede ver órdenes
    canManageUsers: false,
    canChangeUserRoles: false,
    canAccessAdminPanel: true,
  },
  CREADOR: {
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewProducts: true,
    canViewOrders: true, // Solo CREADOR puede ver todas las órdenes
    canManageUsers: true,
    canChangeUserRoles: true, // Solo CREADOR puede cambiar roles
    canAccessAdminPanel: true,
  },
};

/**
 * Obtiene los permisos para un rol específico
 */
export function getPermissions(role: UserRole): PermissionConfig {
  return ROLE_PERMISSIONS[role];
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(
  userRole: UserRole,
  permission: keyof PermissionConfig
): boolean {
  return getPermissions(userRole)[permission];
}

/**
 * Verifica si un usuario puede cambiar el rol de otro usuario
 */
export function canChangeRole(
  currentUserRole: UserRole,
  targetUserRole: UserRole,
  newRole: UserRole
): boolean {
  // Solo CREADOR puede cambiar roles
  if (currentUserRole !== 'CREADOR') {
    return false;
  }

  // CREADOR puede hacer cualquier cambio
  if (currentUserRole === 'CREADOR') {
    return true;
  }

  return false;
}

/**
 * Hook personalizado para verificar permisos
 */
export function usePermissions(userRole: UserRole | undefined) {
  if (!userRole) {
    return ROLE_PERMISSIONS.USER;
  }

  return {
    ...getPermissions(userRole),
    hasPermission: (permission: keyof PermissionConfig) => 
      hasPermission(userRole, permission),
  };
}

/**
 * Función para verificar permisos (en lugar de HOC)
 */
export function checkPermission(
  userRole: UserRole,
  requiredPermission: keyof PermissionConfig
): boolean {
  return hasPermission(userRole, requiredPermission);
}

/**
 * Utilidad para generar mensajes de error de permisos
 */
export function getPermissionErrorMessage(permission: keyof PermissionConfig): string {
  const messages: Record<keyof PermissionConfig, string> = {
    canCreateProducts: 'No tienes permisos para crear productos',
    canEditProducts: 'No tienes permisos para editar productos',
    canDeleteProducts: 'No tienes permisos para eliminar productos',
    canViewProducts: 'No tienes permisos para ver productos',
    canViewOrders: 'No tienes permisos para ver las órdenes',
    canManageUsers: 'No tienes permisos para gestionar usuarios',
    canChangeUserRoles: 'No tienes permisos para cambiar roles de usuario',
    canAccessAdminPanel: 'No tienes permisos para acceder al panel de administración',
  };

  return messages[permission];
}
