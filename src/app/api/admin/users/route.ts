import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/connection';
import User from '@/lib/models/User';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

const UpdateUserRoleSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['USER', 'ADMIN', 'CREADOR']),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo CREADOR puede cambiar roles
    if (!hasPermission(session.user.role, 'canChangeUserRoles')) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para cambiar roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newRole } = UpdateUserRoleSchema.parse(body);

    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el rol
    user.role = newRole;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Rol actualizado a ${newRole}`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo CREADOR puede ver gestión de usuarios
    if (!hasPermission(session.user.role, 'canManageUsers')) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para gestionar usuarios' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const users = await User.find({}, 'name email role createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
