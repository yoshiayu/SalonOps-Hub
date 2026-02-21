import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { roleValues, scopeValues, type Role, type Scope } from "@/lib/types";

const credentialsProvider = CredentialsProvider({
  name: "Dev Login",
  credentials: {
    email: { label: "Email", type: "email" },
    role: { label: "Role", type: "text" }
  },
  authorize(credentials) {
    const email = credentials?.email?.trim() || "admin@salonops.local";
    const role = (credentials?.role || process.env.DEV_DEFAULT_ROLE || "Admin") as Role;
    const resolvedRole = roleValues.includes(role) ? role : "Admin";
    const scope = (process.env.DEV_DEFAULT_SCOPE || "company") as Scope;

    return {
      id: `dev-${resolvedRole.toLowerCase()}`,
      email,
      name: email.split("@")[0],
      role: resolvedRole,
      scope: scopeValues.includes(scope) ? scope : "company"
    };
  }
});

const providers: NextAuthOptions["providers"] = [credentialsProvider];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "Viewer";
        token.scope = (user as { scope?: Scope }).scope ?? "company";
      }
      if (!token.role || !roleValues.includes(token.role as Role)) {
        token.role = "Viewer";
      }
      if (!token.scope || !scopeValues.includes(token.scope as Scope)) {
        token.scope = "company";
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as Role;
      session.user.scope = token.scope as Scope;
      return session;
    }
  },
  pages: {
    signIn: "/auth"
  }
};
