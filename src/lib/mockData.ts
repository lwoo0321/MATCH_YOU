// Mock data and types for the study analytics platform

// We'll use a simple approach with React state + localStorage for now
// This file provides types and mock data

export type UserRole = 'student' | 'ta' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  date: string;
  subject: string;
  plannedMinutes: number;
  actualMinutes: number;
  completionRate: number;
  unit: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  subject: string;
  startTime: string;
  endTime: string;
  elapsedMinutes: number;
  date: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  saved?: boolean;
  labels?: string[];
}

export interface ChatRoom {
  id: string;
  name: string;
  subject?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
}

// Mock current user
export const mockUser: User = {
  id: 'student-1',
  name: 'Alex Kim',
  email: 'alex@example.com',
  role: 'student',
};

// Mock study data for charts
export const mockWeeklyData = [
  { day: 'Mon', planned: 180, actual: 150, math: 60, english: 45, science: 45 },
  { day: 'Tue', planned: 200, actual: 190, math: 80, english: 50, science: 60 },
  { day: 'Wed', planned: 180, actual: 120, math: 40, english: 40, science: 40 },
  { day: 'Thu', planned: 200, actual: 210, math: 90, english: 60, science: 60 },
  { day: 'Fri', planned: 150, actual: 140, math: 50, english: 50, science: 40 },
  { day: 'Sat', planned: 240, actual: 230, math: 100, english: 70, science: 60 },
  { day: 'Sun', planned: 120, actual: 80, math: 30, english: 30, science: 20 },
];

export const mockSubjectDistribution = [
  { name: 'Math', value: 450, fill: 'hsl(var(--chart-1))' },
  { name: 'English', value: 345, fill: 'hsl(var(--chart-2))' },
  { name: 'Science', value: 325, fill: 'hsl(var(--chart-3))' },
  { name: 'History', value: 180, fill: 'hsl(var(--chart-4))' },
  { name: 'Coding', value: 120, fill: 'hsl(var(--chart-5))' },
];

export const mockStudyPlans: StudyPlan[] = [
  { id: '1', userId: 'student-1', date: '2026-03-30', subject: 'Math', plannedMinutes: 90, actualMinutes: 75, completionRate: 83, unit: 'Chapter 5 - Calculus' },
  { id: '2', userId: 'student-1', date: '2026-03-30', subject: 'English', plannedMinutes: 60, actualMinutes: 60, completionRate: 100, unit: 'Essay Writing' },
  { id: '3', userId: 'student-1', date: '2026-03-30', subject: 'Science', plannedMinutes: 45, actualMinutes: 30, completionRate: 67, unit: 'Physics - Waves' },
  { id: '4', userId: 'student-1', date: '2026-03-31', subject: 'Math', plannedMinutes: 120, actualMinutes: 0, completionRate: 0, unit: 'Chapter 6 - Integrals' },
  { id: '5', userId: 'student-1', date: '2026-03-31', subject: 'History', plannedMinutes: 60, actualMinutes: 0, completionRate: 0, unit: 'World War II' },
];

export const mockChatRooms: ChatRoom[] = [
  { id: 'room-1', name: 'Math Help', subject: 'Math', participants: ['student-1', 'ta-1'], lastMessage: 'Try solving it step by step', lastMessageTime: '2026-03-30T10:30:00' },
  { id: 'room-2', name: 'General Q&A', participants: ['student-1', 'ta-1', 'ta-2'], lastMessage: 'The exam schedule is posted', lastMessageTime: '2026-03-30T09:15:00' },
  { id: 'room-3', name: 'Science Lab', subject: 'Science', participants: ['student-1', 'ta-2'], lastMessage: 'Don\'t forget to review the formulas', lastMessageTime: '2026-03-29T16:00:00' },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  'room-1': [
    { id: 'm1', roomId: 'room-1', senderId: 'student-1', senderName: 'Alex Kim', senderRole: 'student', content: 'I\'m stuck on this integral problem. Can you help?', timestamp: '2026-03-30T10:00:00' },
    { id: 'm2', roomId: 'room-1', senderId: 'ta-1', senderName: 'Ms. Park', senderRole: 'ta', content: 'Sure! Which problem number are you on?', timestamp: '2026-03-30T10:05:00' },
    { id: 'm3', roomId: 'room-1', senderId: 'student-1', senderName: 'Alex Kim', senderRole: 'student', content: 'Problem 4.3 — the definite integral with substitution', timestamp: '2026-03-30T10:10:00' },
    { id: 'm4', roomId: 'room-1', senderId: 'ta-1', senderName: 'Ms. Park', senderRole: 'ta', content: 'Try solving it step by step. First, identify what to substitute. Let u = x² + 1, then du = 2x dx.', timestamp: '2026-03-30T10:30:00', saved: true, labels: ['math', 'integral'] },
  ],
  'room-2': [
    { id: 'm5', roomId: 'room-2', senderId: 'ta-2', senderName: 'Mr. Lee', senderRole: 'ta', content: 'The exam schedule is posted on the board. Please check!', timestamp: '2026-03-30T09:15:00' },
  ],
  'room-3': [
    { id: 'm6', roomId: 'room-3', senderId: 'ta-2', senderName: 'Mr. Lee', senderRole: 'ta', content: 'Don\'t forget to review the formulas before the lab tomorrow!', timestamp: '2026-03-29T16:00:00' },
  ],
};
