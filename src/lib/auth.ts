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
      }
      
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      // Si hay un usuario (primer login), guardamos la información básica
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Solo actualizar desde DB cuando se fuerza la actualización
      if (trigger === "update" && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role; // Actualizar rol desde DB
          }
        } catch (error) {
          console.error("Error al actualizar token:", error);
        }
      }
      
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
