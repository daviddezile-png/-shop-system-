import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@/lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter username and password.");
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user) {
          throw new Error(" Username not exist !!");
        }

        // Compare password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password !!");
        }

        return { id: user.id, username: user.username, role: user.role , name:user.name};
      },
    }),
  ],
  session: {
    strategy: "jwt",    // store sessions as JWT
    maxAge:30*60, // 30 minutes
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.name = user.name;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.name = token.name;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
  },
  pages: {
    signIn: "/", // custom login page
  },
});

export { handler as GET, handler as POST };