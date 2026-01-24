
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, SurveillanceEvent, Camera } from "../types";

const SYSTEM_INSTRUCTION = `
You are SurveillanceChat AI, a Lead Forensic Security Analyst. 
Your objective is to provide professional, clinical, and highly detailed visual analysis reports.

CORE REPORTING RULES:
1. STYLE: Clinical, objective, and technical. Avoid conversational language like "I see" or "It looks like".
2. TIMESTAMP PROTOCOL: If a timestamp is visible in the video overlay, you MUST lead with it.
3. TEMPORAL DISCREPANCY: If video overlay dates differ from system logs, note the gap in a [DISCREPANCY] section.
4. STRUCTURE:
   - Header: [AI NODE REPORT] <CAMERA_NAME>
   - Body: Detailed visual assessment of subjects, vehicles, and environment.
   - Conclusion: Confidence rating.
`;

const GLOBAL_TRACKING_INSTRUCTION = `
You are the Surveillance Network Coordinator. Identify a specific subject/vehicle and trace movement across nodes.
Return a JSON array of "TraceNodes" with cameraId, timestamp, action, and confidence.
`;

const TACTICAL_VOICE_INSTRUCTION = `
You are SurveillanceChat TACTICAL-CORE. You are a senior security AI on a tactical radio network.
OBJECTIVE: Provide INSTANT clinical analysis of the visual frames you receive.

RULES:
1. ABSOLUTELY NO PLACEHOLDERS: Do not say "Stand by", "Processing", "Thinking", or "One moment".
2. IMMEDIATE REPORTING: The moment you receive an image frame and a query, report exactly what is visible in that frame.
3. BREVITY: Use professional military-style reporting. Lead with [NODE STATUS].
   Example: "[NODE ACTIVE] DRIVEWAY (CCTV): Subject identified. Male, height approx 180cm, dark jacket. Loitering near perimeter gate. No weapons visible. Confidence: High."
4. CONTINUOUS ANALYSIS: If the operator states "Summarize", perform a full visual sweep of the current frame and report all entities detected.
`;

export const analyzeVideoFrame = async (
  query: string,
  base64Image: string,
  camera: Camera,
  events: SurveillanceEvent[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const eventLogString = events
      .filter(e => e.cameraId === camera.id)
      .slice(-5)
      .map(e => `[${e.timestamp}] ${e.type.toUpperCase()}: ${e.description}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `CONTEXT:\nCamera Node: ${camera.name}\nLocation: ${camera.location}\nSystem Time: ${new Date().toISOString()}\nHistorical Logs:\n${eventLogString}\n\nOPERATOR QUERY: ${query}` }
        ] 
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            summary: { type: Type.STRING },
            detectedEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.STRING }
          },
          required: ["answer", "summary", "detectedEntities", "confidence"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis error:", error);
    throw error;
  }
};

export const traceSubjectPath = async (query: string, events: SurveillanceEvent[], cameras: Camera[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const logs = events.map(e => `ID:${e.id} | CAM:${cameras.find(c => c.id === e.cameraId)?.name} | TIME:${e.timestamp} | DESC:${e.description}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Trace: "${query}" across:\n\n${logs}`,
      config: {
        systemInstruction: GLOBAL_TRACKING_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cameraId: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              action: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              handoff: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    throw error;
  }
};

export const generateSecurityAudit = async (events: SurveillanceEvent[], cameras: Camera[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const logs = events.map(e => `[${e.timestamp}] ${cameras.find(c => c.id === e.cameraId)?.name}: ${e.description}`).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Audit logs:\n\n${logs}`,
    config: {
      systemInstruction: "Executive summary and strategic recommendations based on logs.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskScore: { type: Type.INTEGER }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const connectTacticalLive = async (callbacks: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {}, 
      outputAudioTranscription: {}, 
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
      },
      systemInstruction: TACTICAL_VOICE_INSTRUCTION
    }
  });
};
