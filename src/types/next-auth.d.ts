import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'USER' | 'ADMIN' | 'CREADOR';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'USER' | 'ADMIN' | 'CREADOR';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN' | 'CREADOR';
  }
}
