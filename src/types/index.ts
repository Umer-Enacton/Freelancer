export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  userId: number;
  createdAt: string;
}

export interface TimeEntry {
  id: number;
  userId: number;
  projectId: number;
  completed: boolean;
  date: string;
  createdAt: string;
  completedAt?: string;
  TotalWorkingDays?: {
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
    totalMinutes: number;
  };
}

export interface Break {
  breakIn: string;
  breakOut: string | null;
  isActive: boolean;
  durationMinutes: number | null;
}

export interface Session {
  id: number;
  timeEntryId: number;
  checkIn: string;
  checkOut: string | null;
  isActive: boolean;
  durationMinutes: number | null;
  breaks: Break[];
  createdAt: string;
  breakTimeMinutes?: number;
}

export interface Summary {
  id?: number;
  timeEntryId: string | number;
  TotalSessions: number;
  TotalBreaks: number;
  Net_WorkTimeMinutes: number;
  Net_WorkTime: {
    days: number;
    hours: number;
    minutes: number;
  };
  TotalBreakTimeMinutes: number;
  GrossTimeMinutes: number;
  GrossTime: {
    days: number;
    hours: number;
    minutes: number;
  };
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
