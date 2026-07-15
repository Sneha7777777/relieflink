import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "REQUESTER" | "VOLUNTEER" | "COORDINATOR";
    } & DefaultSession["user"];
  }
}
