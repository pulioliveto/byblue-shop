import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/connection";
import User from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        
        // Buscar si el usuario ya existe
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Crear nuevo usuario si no existe
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'USER'
          });
        }
        
        return true;
      } catch (error) {
        console.error("Error durante el sign in:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN' | 'CREADOR';
        
        console.log('Session callback - Final session:', {
          email: session.user.email,
          role: session.user.role,
          id: session.user.id
        });
      }
      
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      // Si no tenemos rol en el token, obtenerlo de la DB
      if (token.email && !token.role) {
        try {
          console.log('JWT - Token without role, fetching from DB for:', token.email);
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            console.log('JWT - User data from DB:', { 
              email: token.email, 
              role: token.role, 
              id: token.id 
            });
          } else {
            console.log('JWT - User not found in DB:', token.email);
            token.role = 'USER'; // Fallback
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario en JWT:", error);
          token.role = 'USER'; // Fallback
        }
      }
      
      // Si hay un usuario (primer login) y aún no tenemos rol
      if (user && token.email && !token.role) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            console.log('JWT - First login, user data from DB:', { 
              email: token.email, 
              role: token.role, 
              id: token.id 
            });
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario en primer login:", error);
          token.role = 'USER';
        }
      }
      
      // Actualizar desde DB cuando se fuerza la actualización
      if (trigger === "update" && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            console.log('JWT - Updated user data from DB:', { 
              email: token.email, 
              role: token.role 
            });
          }
        } catch (error) {
          console.error("Error al actualizar token:", error);
        }
      }
      
      console.log('JWT - Final token:', { 
        email: token.email, 
        role: token.role, 
        hasId: !!token.id 
      });
      
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
