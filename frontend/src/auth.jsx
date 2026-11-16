import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { request } from "./api";

const AuthContext = createContext(null);
const empty = { token: null, user: null, email: "", verified: null };
export function AuthProvider({ children }) {
  const [session, setState] = useState(empty);
  const current = useRef(empty);
  const setSession = useCallback((value) => {
    current.current = value;
    setState(value);
  }, []);
  const clear = useCallback(() => setSession(empty), [setSession]);
  const refresh = useCallback(
    async (token = current.current.token) => {
      if (!token) return false;
      try {
        const { data } = await request("/me", { token });
        if (current.current.token === token)
          setSession({ ...current.current, user: data, verified: true });
        return true;
      } catch (error) {
        if (current.current.token === token) {
          if (error.status === 401) clear();
          if (error.status === 403) {
            setSession({ ...current.current, user: null, verified: false });
            return false;
          }
        }
        throw error;
      }
    },
    [clear, setSession],
  );
  const signIn = useCallback(
    async (email, password) => {
      const { data } = await request("/login", {
        method: "POST",
        data: { email, password },
      });
      setSession({ ...empty, token: data.token, email });
      return refresh(data.token);
    },
    [refresh, setSession],
  );
  const api = useCallback(
    async (path, options = {}) => {
      const token = current.current.token;
      try {
        return await request(path, { ...options, token });
      } catch (error) {
        if (error.status === 401 && current.current.token === token) clear();
        throw error;
      }
    },
    [clear],
  );
  const logout = useCallback(async () => {
    try {
      if (current.current.token) await api("/logout", { method: "POST" });
    } finally {
      clear();
    }
  }, [api, clear]);
  const updateRemaining = useCallback(
    (remaining) => {
      if (
        current.current.user &&
        Number.isInteger(remaining) &&
        remaining >= 0 &&
        remaining <= 5
      ) {
        setSession({
          ...current.current,
          user: { ...current.current.user, demo_uses_left: remaining },
        });
      }
    },
    [setSession],
  );
  return (
    <AuthContext.Provider
      value={{ session, signIn, refresh, api, logout, updateRemaining }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
