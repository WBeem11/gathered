import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function upsertProfile(userId: string, name?: string | null, avatarUrl?: string | null) {
  await prisma.profile.upsert({
    where: { id: userId },
    create: { id: userId, name: name ?? null, avatarUrl: avatarUrl ?? null },
    update: {},
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profilePhoto,
          neighborhood: user.neighborhood ?? undefined,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      await upsertProfile(user.id, user.name, user.image);
    },
    async signIn({ user, account }) {
      // Ensure profile exists for returning OAuth users whose profile may be missing
      if (account?.provider === "google") {
        await upsertProfile(user.id, user.name, user.image);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // For credentials provider, neighborhood is on the user object
        // For Google, fetch it from DB (may be null until user sets it)
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { neighborhood: true },
          });
          token.neighborhood = dbUser?.neighborhood ?? undefined;
        } else {
          token.neighborhood = (user as { neighborhood?: string }).neighborhood;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.neighborhood = token.neighborhood as string | undefined;
      }
      return session;
    },
  },
};
