import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Aquí puedes agregar lógica adicional si es necesario
    console.log('Middleware - Ruta:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        console.log('Authorized - Checking path:', pathname);
        console.log('Authorized - Token role:', token?.role);
        
        // Si no hay token, no autorizado para rutas protegidas
        if (!token) {
          return false;
        }
        
        // Rutas que requieren autenticación básica
        if (pathname.startsWith('/profile') || 
            pathname.startsWith('/cart')) {
          return true;
        }
        
        // Rutas de órdenes - solo CREADOR puede ver
        if (pathname.startsWith('/orders')) {
          return token?.role === 'CREADOR';
        }
        
        // Rutas específicas de CREADOR (gestión de usuarios y roles)
        if (pathname.startsWith('/admin/users') || 
            pathname.startsWith('/admin/roles') ||
            pathname.startsWith('/admin/permissions')) {
          return token?.role === 'CREADOR';
        }
        
        // Rutas de admin generales - ADMIN y CREADOR pueden acceder
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'CREADOR';
        }
        
        return true;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    '/profile/:path*',
    '/orders/:path*',
    '/cart/:path*',
    '/admin/:path*'
  ]
};
