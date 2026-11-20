import { createContext } from "react";
import type { User } from "../lib/api";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unavailable";

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: {
    email: string;
    displayName: string;
    password: string;
  }): Promise<void>;
  signOut(): Promise<void>;
  signOutAll(): Promise<void>;
  updateProfile(input: {
    displayName?: string;
    username?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }): Promise<void>;
  refresh(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
