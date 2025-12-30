import api from "./axios";
import type {
  AuthResponse,
  Project,
  TimeEntry,
  Session,
  Summary,
} from "../types";

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/register", { name, email, password }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/login", { email, password }),
};

export const projectApi = {
  getAll: () =>
    api.get<{ success: boolean; message: string; projects: Project[] }>(
      "/project"
    ),
  getById: (id: number) =>
    api.get<{ success: boolean; message: string; project: Project }>(
      `/project/${id}`
    ),
  create: (name: string, description: string, userId: number) =>
    api.post<{ success: boolean; message: string; projects: Project[] }>(
      "/project",
      { name, description, userId }
    ),
  update: (id: number, data: Partial<Project> & { userId: number }) =>
    api.put<{ Success: boolean; message: string; project: Project }>(
      `/project/${id}`,
      data
    ),
  delete: (id: number, userId: number) =>
    api.delete(`/project/${id}`, { data: { userId } }),
};

export const timeEntryApi = {
  getAll: () =>
    api.get<{ success: boolean; message: string; timeEntries: TimeEntry[] }>(
      "/timeEntry"
    ),
  getById: (id: number) =>
    api.get<{ success: boolean; message: string; timeEntry: TimeEntry }>(
      `/timeEntry/${id}`
    ),
  create: (userId: number, projectId: number) =>
    api.post<{ success: boolean; message: string; timeEntries: TimeEntry[] }>(
      "/timeEntry",
      { userId, projectId }
    ),
  update: (id: number, userId: number, projectId: number) =>
    api.put<{ Success: boolean; message: string; timeEntry: TimeEntry }>(
      `/timeEntry/${id}`,
      { userId, projectId }
    ),
  delete: (id: number, userId: number, projectId: number) =>
    api.delete(`/timeEntry/${id}`, { data: { userId, projectId } }),
  complete: (id: number, userId: number, projectId: number) =>
    api.put<{ Success: boolean; message: string; timeEntry: TimeEntry }>(
      `/timeEntry/complete/${id}`,
      {
        userId,
        projectId,
      }
    ),
};

export const sessionApi = {
  getAll: () =>
    api.get<{ success: boolean; message: string; sessions: Session[] }>(
      "/session"
    ),
  getByTimeEntry: (timeEntryId: number) =>
    api.get<{ success: boolean; message: string; session: Session[] }>(
      `/session/${timeEntryId}`
    ),
  checkIn: (timeEntryId: number) =>
    api.post<{ success: boolean; message: string; session: Session }>(
      "/session/checkin",
      { timeEntryId }
    ),
  checkOut: (sessionId: number, timeEntryId: number) =>
    api.put<{ success: boolean; message: string; session: Session }>(
      `/session/checkout/${sessionId}`,
      {
        timeEntryId,
      }
    ),
  breakIn: (sessionId: number, timeEntryId: number) =>
    api.put<{ success: boolean; message: string; session: Session }>(
      `/session/breakin/${sessionId}`,
      { timeEntryId }
    ),
  breakOut: (sessionId: number, timeEntryId: number) =>
    api.put<{ success: boolean; message: string; session: Session }>(
      `/session/breakout/${sessionId}`,
      {
        timeEntryId,
      }
    ),
};

export const summaryApi = {
  getByTimeEntry: (timeEntryId: number) =>
    api.get<Summary>(`/summary/project-time-entry/${timeEntryId}`),
  getAllByUser: (userId: number) =>
    api.get<{ success: boolean; summaries: Summary[] }>(
      `/summary/user/${userId}`
    ),
};
