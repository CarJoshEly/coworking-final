import { api, setToken, clearToken } from "../api-client";
import type { LoginDto, LoginResponse, CreateUserDto, User } from "../types";

export const authService = {
  async login(dto: LoginDto): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", dto, { auth: false });
    setToken(res.accessToken);
    return res;
  },

  async register(dto: CreateUserDto): Promise<User> {
    return api.post<User>("/users", dto, { auth: false });
  },

  me(): Promise<{ userId: number; email: string; role: string }> {
    return api.get("/auth/me");
  },

  logout(): void {
    clearToken();
  },
};
