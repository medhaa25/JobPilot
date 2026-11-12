import axios from "axios";
import { api } from "@/lib/axios";
import type { User } from "@/types";
import type { LoginInput, SignupInput } from "../types";

// Returns null when there is no active session (401).
export async function getMe(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) return null;
    throw e;
  }
}

export async function login(input: LoginInput): Promise<User> {
  const { data } = await api.post<User>("/auth/login", input);
  return data;
}

export async function signup(input: SignupInput): Promise<User> {
  const { data } = await api.post<User>("/auth/signup", input);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
