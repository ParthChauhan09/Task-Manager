import api from "./axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },

  google: async (credential: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/google", { credential });
    return res.data;
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get<{ user: AuthUser }>("/auth/me");
    return res.data.user;
  },
};
