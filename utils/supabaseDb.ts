import { supabase } from './supabase';
import { Camera, SurveillanceEvent, ChatMessage, UserSettings } from '../types';

// Helper to get current user ID
const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
};

export const supabaseDb = {
    // ==================== CAMERAS ====================
    cameras: {
        getAll: async (): Promise<Camera[]> => {
            const userId = await getUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('cameras')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching cameras:', error);
                return [];
            }

            return (data || []).map(cam => ({
                id: cam.id,
                userId: cam.user_id,
                name: cam.name,
                location: cam.location || '',
                status: cam.status,
                lastSeen: cam.last_seen,
                thumbnail: cam.thumbnail || '',
                streamUrl: cam.stream_url || '',
                isExternal: cam.is_external || false,
                nodePassword: cam.node_password,
                clearanceRequired: cam.clearance_required,
                metadata: cam.metadata || {},
                isDeleted: cam.is_deleted,
                createdAt: cam.created_at,
                updatedAt: cam.updated_at,
                version: 1,
                syncStatus: 'synced'
            })) as Camera[];
        },

        add: async (camera: Partial<Camera>): Promise<Camera | null> => {
            const userId = await getUserId();
            if (!userId) throw new Error('Unauthorized');

            const { data, error } = await supabase
                .from('cameras')
                .insert({
                    user_id: userId,
                    name: camera.name,
                    location: camera.location,
                    status: 'online',
                    thumbnail: camera.thumbnail,
                    stream_url: camera.streamUrl,
                    is_external: camera.isExternal || false,
                    node_password: camera.nodePassword,
                    clearance_required: camera.clearanceRequired || 1,
                    metadata: camera.metadata || {}
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding camera:', error);
                throw new Error(error.message);
            }

            return {
                id: data.id,
                userId: data.user_id,
                name: data.name,
                location: data.location || '',
                status: data.status,
                lastSeen: data.last_seen,
                thumbnail: data.thumbnail || '',
                streamUrl: data.stream_url || '',
                isExternal: data.is_external,
                nodePassword: data.node_password,
                clearanceRequired: data.clearance_required,
                metadata: data.metadata,
                isDeleted: data.is_deleted,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                version: 1,
                syncStatus: 'synced'
            } as Camera;
        },

        update: async (id: string, updates: Partial<Camera>): Promise<void> => {
            const { error } = await supabase
                .from('cameras')
                .update({
                    name: updates.name,
                    location: updates.location,
                    status: updates.status,
                    thumbnail: updates.thumbnail,
                    stream_url: updates.streamUrl,
                    clearance_required: updates.clearanceRequired
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating camera:', error);
                throw new Error(error.message);
            }
        },

        delete: async (id: string): Promise<void> => {
            const { error } = await supabase
                .from('cameras')
                .update({ is_deleted: true })
                .eq('id', id);

            if (error) {
                console.error('Error deleting camera:', error);
                throw new Error(error.message);
            }
        }
    },

    // ==================== EVENTS ====================
    events: {
        getAll: async (): Promise<SurveillanceEvent[]> => {
            const userId = await getUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_deleted', false)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Error fetching events:', error);
                return [];
            }

            return (data || []).map(evt => ({
                id: evt.id,
                userId: evt.user_id,
                cameraId: evt.camera_id,
                timestamp: evt.timestamp,
                type: evt.type,
                description: evt.description || '',
                confidence: evt.confidence,
                entities: evt.entities || [],
                frameUrl: evt.frame_url,
                isDeleted: evt.is_deleted,
                createdAt: evt.created_at,
                updatedAt: evt.updated_at,
                version: 1,
                syncStatus: 'synced'
            })) as SurveillanceEvent[];
        },

        add: async (event: Partial<SurveillanceEvent>): Promise<SurveillanceEvent | null> => {
            const userId = await getUserId();
            if (!userId) throw new Error('Unauthorized');

            const { data, error } = await supabase
                .from('events')
                .insert({
                    user_id: userId,
                    camera_id: event.cameraId,
                    timestamp: event.timestamp || new Date().toISOString(),
                    type: event.type,
                    description: event.description,
                    confidence: event.confidence || 'medium',
                    entities: event.entities || [],
                    frame_url: event.frameUrl
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding event:', error);
                throw new Error(error.message);
            }

            return {
                id: data.id,
                userId: data.user_id,
                cameraId: data.camera_id,
                timestamp: data.timestamp,
                type: data.type,
                description: data.description,
                confidence: data.confidence,
                entities: data.entities,
                frameUrl: data.frame_url,
                isDeleted: data.is_deleted,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                version: 1,
                syncStatus: 'synced'
            } as SurveillanceEvent;
        }
    },

    // ==================== MESSAGES ====================
    messages: {
        getByCamera: async (cameraId: string): Promise<ChatMessage[]> => {
            const userId = await getUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('camera_id', cameraId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
                return [];
            }

            return (data || []).map(msg => ({
                id: msg.id,
                userId: msg.user_id,
                sessionId: msg.session_id || '',
                cameraId: msg.camera_id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                detectedEntities: msg.detected_entities || [],
                summary: msg.summary,
                isDeleted: msg.is_deleted,
                createdAt: msg.created_at,
                updatedAt: msg.updated_at,
                version: 1,
                syncStatus: 'synced'
            })) as ChatMessage[];
        },

        add: async (message: Partial<ChatMessage>): Promise<ChatMessage | null> => {
            const userId = await getUserId();
            if (!userId) throw new Error('Unauthorized');

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    user_id: userId,
                    camera_id: message.cameraId,
                    session_id: message.sessionId,
                    role: message.role,
                    content: message.content,
                    timestamp: message.timestamp || new Date().toISOString(),
                    detected_entities: message.detectedEntities || [],
                    summary: message.summary
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding message:', error);
                throw new Error(error.message);
            }

            return {
                id: data.id,
                userId: data.user_id,
                sessionId: data.session_id,
                cameraId: data.camera_id,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp,
                detectedEntities: data.detected_entities,
                summary: data.summary,
                isDeleted: data.is_deleted,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                version: 1,
                syncStatus: 'synced'
            } as ChatMessage;
        },

        clear: async (cameraId: string): Promise<void> => {
            const { error } = await supabase
                .from('messages')
                .update({ is_deleted: true })
                .eq('camera_id', cameraId);

            if (error) {
                console.error('Error clearing messages:', error);
                throw new Error(error.message);
            }
        }
    },

    // ==================== SETTINGS ====================
    settings: {
        get: async (): Promise<UserSettings | null> => {
            const userId = await getUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // Settings might not exist yet
                return null;
            }

            return {
                id: data.id,
                userId: data.user_id,
                theme: data.theme,
                sensitivity: data.sensitivity,
                faceDetection: data.face_detection,
                retentionDays: data.retention_days,
                enableVoiceAlerts: data.enable_voice_alerts,
                observers: [],
                isDeleted: false,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                version: 1,
                syncStatus: 'synced'
            } as UserSettings;
        },

        update: async (settings: Partial<UserSettings>): Promise<void> => {
            const userId = await getUserId();
            if (!userId) throw new Error('Unauthorized');

            const { error } = await supabase
                .from('settings')
                .upsert({
                    user_id: userId,
                    theme: settings.theme,
                    sensitivity: settings.sensitivity,
                    face_detection: settings.faceDetection,
                    retention_days: settings.retentionDays,
                    enable_voice_alerts: settings.enableVoiceAlerts
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('Error updating settings:', error);
                throw new Error(error.message);
            }
        }
    },

    // ==================== PROFILE ====================
    profile: {
        get: async () => {
            const userId = await getUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) return null;
            return data;
        },

        update: async (updates: { name?: string; clearance_level?: number }) => {
            const userId = await getUserId();
            if (!userId) throw new Error('Unauthorized');

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw new Error(error.message);
        }
    }
};
