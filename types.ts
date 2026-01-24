
export enum EventType {
  PERSON = 'person',
  VEHICLE = 'vehicle',
  MOTION = 'motion',
  ALERT = 'alert'
}

export type SyncStatus = 'synced' | 'pending' | 'local_only' | 'error';
export type UserRole = 'admin' | 'observer';

export interface BaseEntity {
  id: string; // UUID v4
  userId: string; // Owner of the record (Admin ID)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  version: number; // For conflict resolution
  syncStatus: SyncStatus;
  isDeleted: boolean; // Soft delete
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  managedBy?: string; // If observer, points to Admin User ID
  clearanceLevel: number;
  createdAt: string;
}

export interface Camera extends BaseEntity {
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastSeen: string;
  thumbnail: string;
  streamUrl: string;
  isExternal?: boolean;
  nodePassword?: string;
  clearanceRequired: number;
  metadata?: Record<string, any>;
}

export interface SurveillanceEvent extends BaseEntity {
  cameraId: string;
  timestamp: string;
  type: EventType;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  entities: string[];
  frameUrl?: string; 
}

export interface ChatMessage extends BaseEntity {
  sessionId: string;
  cameraId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  detectedEntities?: string[];
  summary?: string;
}

export interface ChatSession extends BaseEntity {
  cameraId: string;
  name: string;
  isActive: boolean;
}

export interface Observer extends BaseEntity {
  name: string;
  email: string;
  role: 'viewer' | 'admin'; // Specific role within the shared context
  active: boolean;
  clearanceLevel: number;
}

export interface UserSettings extends BaseEntity {
  theme: 'dark' | 'light';
  sensitivity: number;
  faceDetection: boolean;
  retentionDays: number;
  enableVoiceAlerts: boolean;
  observers: Observer[];
}

export interface DailySummary {
  date: string;
  highlights: string[];
  stats: {
    totalEvents: number;
    people: number;
    vehicles: number;
    peakHour: string;
  };
}

export interface AppStorage {
  version: string;
  users: Record<string, User>; 
  cameras: Record<string, Camera>;
  events: Record<string, SurveillanceEvent>;
  sessions: Record<string, ChatSession>;
  messages: Record<string, ChatMessage>;
  settings: Record<string, UserSettings>; 
  currentUserId: string | null;
}
