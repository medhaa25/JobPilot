import { api } from "@/lib/axios";
import type { Application, ApplicationEvent } from "@/types";
import type { ApplicationInput } from "../types";

export async function getApplications(): Promise<Application[]> {
  const { data } = await api.get<Application[]>("/applications");
  return data;
}

export async function getApplication(id: string): Promise<Application> {
  const { data } = await api.get<Application>(`/applications/${id}`);
  return data;
}

export async function createApplication(input: ApplicationInput): Promise<Application> {
  const { data } = await api.post<Application>("/applications", input);
  return data;
}

export async function updateApplication(id: string, patch: Partial<ApplicationInput>): Promise<Application> {
  const { data } = await api.patch<Application>(`/applications/${id}`, patch);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  await api.delete(`/applications/${id}`);
}

export async function getApplicationEvents(id: string): Promise<ApplicationEvent[]> {
  const { data } = await api.get<ApplicationEvent[]>(`/applications/${id}/events`);
  return data;
}