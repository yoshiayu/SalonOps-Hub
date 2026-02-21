import type { DefaultSession } from "next-auth";
import type { Role, Scope } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      role: Role;
      scope: Scope;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    scope: Scope;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    scope?: Scope;
  }
}
