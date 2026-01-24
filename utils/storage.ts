
import { AppStorage, Camera, SurveillanceEvent, ChatMessage, UserSettings, User, Observer } from '../types';
import { MOCK_CAMERAS } from './mockData';

const STORAGE_KEY = 'surveillance_chat_v1.3';
const SCHEMA_VERSION = '1.3.0';

const generateUUID = () => crypto.randomUUID();

const createBase = (userId: string, id?: string): any => {
  const now = new Date().toISOString();
  return {
    id: id || generateUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
    version: 1,
    syncStatus: 'local_only',
    isDeleted: false
  };
};

export const initializeStorage = (): AppStorage => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.version !== SCHEMA_VERSION) {
        parsed.version = SCHEMA_VERSION;
        saveStorage(parsed);
      }
      return parsed;
    } catch (e) {
      console.error("Storage corrupt. Resetting.");
    }
  }

  const initial: AppStorage = {
    version: SCHEMA_VERSION,
    users: {},
    cameras: {},
    events: {},
    sessions: {},
    messages: {},
    settings: {},
    currentUserId: null
  };
  saveStorage(initial);
  return initial;
};

export const saveStorage = (data: AppStorage) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const auth = {
  signup: (name: string, email: string, pass: string): User => {
    const storage = initializeStorage();
    if (Object.values(storage.users).find(u => u.email === email)) {
      throw new Error("Account with this email already exists.");
    }
    const newUser: User = {
      id: generateUUID(),
      name,
      email,
      password: pass,
      role: 'admin',
      createdAt: new Date().toISOString(),
      clearanceLevel: 5 // Admins get max clearance by default
    };
    storage.users[newUser.id] = newUser;
    
    const demoCam: Camera = { 
      ...MOCK_CAMERAS[0], 
      ...createBase(newUser.id, 'demo-' + generateUUID()),
      clearanceRequired: 1,
      nodePassword: 'admin'
    };
    storage.cameras[demoCam.id] = demoCam;

    storage.currentUserId = newUser.id;
    saveStorage(storage);
    return newUser;
  },
  login: (email: string, pass: string): User => {
    const storage = initializeStorage();
    const user = Object.values(storage.users).find(u => u.email === email && u.password === pass);
    if (!user) throw new Error("Invalid credentials.");
    storage.currentUserId = user.id;
    saveStorage(storage);
    return user;
  },
  logout: () => {
    const storage = initializeStorage();
    storage.currentUserId = null;
    saveStorage(storage);
  },
  getCurrentUser: (): User | null => {
    const storage = initializeStorage();
    return storage.currentUserId ? storage.users[storage.currentUserId] : null;
  }
};

export const db = {
  getUserId: () => initializeStorage().currentUserId,
  
  // Gets either current user ID or their manager's ID for data context
  getDataContextId: () => {
    const storage = initializeStorage();
    const user = storage.currentUserId ? storage.users[storage.currentUserId] : null;
    return user?.role === 'observer' ? user.managedBy : storage.currentUserId;
  },

  cameras: {
    getAll: () => {
      const storage = initializeStorage();
      const currentUser = storage.currentUserId ? storage.users[storage.currentUserId] : null;
      if (!currentUser) return [];
      
      const contextId = currentUser.role === 'observer' ? currentUser.managedBy : currentUser.id;
      
      return Object.values(storage.cameras).filter(c => {
        const isOwner = c.userId === contextId && !c.isDeleted;
        if (!isOwner) return false;
        
        // Restriction: Observer can only see what they have clearance for
        if (currentUser.role === 'observer') {
          return currentUser.clearanceLevel >= c.clearanceRequired;
        }
        return true;
      });
    },
    add: (camera: Partial<Camera>) => {
      const uid = db.getUserId();
      const user = auth.getCurrentUser();
      if (!uid || user?.role !== 'admin') throw new Error("Permission Denied: Only Admins can register nodes.");
      
      const storage = initializeStorage();
      const newCam: Camera = {
        ...createBase(uid),
        ...camera,
        status: 'online',
        lastSeen: new Date().toISOString(),
      } as Camera;
      storage.cameras[newCam.id] = newCam;
      saveStorage(storage);
      return newCam;
    }
  },

  observers: {
    add: (name: string, email: string, pass: string, clearance: number) => {
      const admin = auth.getCurrentUser();
      if (!admin || admin.role !== 'admin') throw new Error("Unauthorized action.");
      
      const storage = initializeStorage();
      if (Object.values(storage.users).find(u => u.email === email)) {
        throw new Error("A user with this email is already registered.");
      }

      const observerUser: User = {
        id: generateUUID(),
        name,
        email,
        password: pass,
        role: 'observer',
        managedBy: admin.id,
        clearanceLevel: clearance,
        createdAt: new Date().toISOString()
      };

      storage.users[observerUser.id] = observerUser;
      
      // Also update settings record for the admin to track observers
      let settings = storage.settings[admin.id];
      if (settings) {
        const obsRecord: Observer = {
          ...createBase(admin.id),
          name,
          email,
          role: 'viewer',
          active: true,
          clearanceLevel: clearance
        };
        settings.observers.push(obsRecord);
      }

      saveStorage(storage);
      return observerUser;
    }
  },

  events: {
    getAll: () => {
      const contextId = db.getDataContextId();
      const user = auth.getCurrentUser();
      const cameras = db.cameras.getAll();
      const camIds = new Set(cameras.map(c => c.id));

      return Object.values(initializeStorage().events)
        .filter(e => e.userId === contextId && !e.isDeleted && camIds.has(e.cameraId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    add: (event: Partial<SurveillanceEvent>) => {
      const uid = db.getUserId();
      if (!uid) throw new Error("Unauthorized");
      const storage = initializeStorage();
      const newEvent: SurveillanceEvent = {
        ...createBase(uid),
        ...event,
      } as SurveillanceEvent;
      storage.events[newEvent.id] = newEvent;
      saveStorage(storage);
      return newEvent;
    }
  },

  messages: {
    getByCamera: (cameraId: string) => {
      const contextId = db.getDataContextId();
      const uid = db.getUserId();
      return Object.values(initializeStorage().messages)
        .filter(m => (m.userId === uid || m.userId === contextId) && m.cameraId === cameraId && !m.isDeleted)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    add: (msg: Partial<ChatMessage>) => {
      const uid = db.getUserId();
      if (!uid) throw new Error("Unauthorized");
      const storage = initializeStorage();
      const newMessage: ChatMessage = {
        ...createBase(uid),
        ...msg,
      } as ChatMessage;
      storage.messages[newMessage.id] = newMessage;
      saveStorage(storage);
      return newMessage;
    },
    // Fix: Added clear method to handle history deletion for a specific camera node
    clear: (cameraId: string) => {
      const storage = initializeStorage();
      const contextId = db.getDataContextId();
      const uid = db.getUserId();
      Object.keys(storage.messages).forEach(id => {
        const m = storage.messages[id];
        if ((m.userId === uid || m.userId === contextId) && m.cameraId === cameraId) {
          m.isDeleted = true;
          m.updatedAt = new Date().toISOString();
        }
      });
      saveStorage(storage);
    }
  }
};
