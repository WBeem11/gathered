import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      neighborhood?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    neighborhood?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    neighborhood?: string;
  }
}
