
import { Camera, SurveillanceEvent, DailySummary, EventType } from '../types';

export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'cam-driveway-cctv',
    // Added missing userId to satisfy Camera type requirements
    userId: 'seed-user',
    name: 'DRIVEWAY (CCTV)',
    location: 'Residential Entrance',
    status: 'online',
    lastSeen: new Date().toISOString(),
    // Added missing properties to satisfy Camera type extending BaseEntity
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    syncStatus: 'local_only',
    isDeleted: false,
    thumbnail: 'https://i.ibb.co/Gvmxcj0P/Screenshot-2026-01-08-153215.png',
    streamUrl: 'https://aleeyuwada01.github.io/files/cctv.mp4',
    isExternal: false,
    // Add missing required clearanceRequired property to satisfy the Camera interface
    clearanceRequired: 1
  }
];

// Start with empty logs to ensure only real session data is shown
export const MOCK_EVENTS: SurveillanceEvent[] = [];

export const MOCK_SUMMARY: DailySummary = {
  date: new Date().toISOString().split('T')[0],
  highlights: [],
  stats: {
    totalEvents: 0,
    people: 0,
    vehicles: 0,
    peakHour: 'N/A'
  }
};
