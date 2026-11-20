import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, api, type User } from "../lib/api";
import { AuthContext, type AuthStatus } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await api.me();
      setUser(result.user);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus(
        error instanceof ApiError && error.status === 401
          ? "unauthenticated"
          : "unavailable",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    api
      .me()
      .then(({ user: currentUser }) => {
        if (active) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setUser(null);
          setStatus(
            error instanceof ApiError && error.status === 401
              ? "unauthenticated"
              : "unavailable",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const signUp = useCallback(
    async (input: { email: string; displayName: string; password: string }) => {
      const result = await api.register(input);
      setUser(result.user);
      setStatus("authenticated");
    },
    [],
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const signOutAll = useCallback(async () => {
    await api.logoutAll();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const updateProfile = useCallback(
    async (input: {
      displayName?: string;
      username?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
    }) => {
      const result = await api.updateProfile(input);
      setUser(result.user);
    },
    [],
  );

  const value = useMemo(
    () => ({
      status,
      user,
      signIn,
      signUp,
      signOut,
      signOutAll,
      updateProfile,
      refresh,
    }),
    [status, user, signIn, signUp, signOut, signOutAll, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
