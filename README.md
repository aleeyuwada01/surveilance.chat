
# 🛡️ SurveillanceChat: Tactical AI-Intelligence Hub

**Version:** 1.0.0  
**Security Classification:** Level-5 (Admin) Authorized Only  
**Codename:** *Grid-Watcher*

---

## 📑 Table of Contents
1. [Vision & Identity](#vision--identity)
2. [Tactical Clearance Protocols (TCP)](#tactical-clearance-protocols-tcp)
3. [System Architecture](#system-architecture)
4. [AI Intelligence Matrix](#ai-intelligence-matrix)
5. [Data Integrity & Multi-User Isolation](#data-integrity--multi-user-isolation)
6. [Operative Manual (Usage)](#operative-manual-usage)
7. [Roadmap: Future Feature Implementations](#roadmap-future-feature-implementations)
8. [Developer Guidance](#developer-guidance)

---

## 👁️ Vision & Identity
SurveillanceChat is not a standard CCTV dashboard. It is an **AI-Driven Tactical Intelligence Hub** designed to bridge the gap between raw video telemetry and actionable security insights. 

The core identity of the platform is **"Clinical Surveillance"**:
- **Objective Intelligence:** Removing human bias from threat detection.
- **Sub-Second Response:** Leveraging low-latency multimodal LLMs for live interaction.
- **Chain of Command:** Ensuring data is only visible to those with established clearance.

---

## 🔐 Tactical Clearance Protocols (TCP)
The platform operates on a hierarchical **Clearance Level (CL)** system. Features are hard-locked behind these tiers to prevent unauthorized exposure of tactical capabilities.

| Level | Designation | Description | Gated Modules |
|:---:|:---|:---|:---|
| **L1** | **Junior Operative** | Entry-level monitoring. | Dashboard, Basic Live Feed, Event Log viewing. |
| **L2** | **Archive Tech** | Data retrieval specialist. | **+ Archive Search Overlay:** Querying past security events. |
| **L3** | **Tactical Scout** | Intelligence correlation. | **+ Global Correlation Engine:** Cross-camera subject tracking. |
| **L4** | **Command Officer** | Real-time tactical lead. | **+ Tactical Radio:** Live Voice-to-Vision multimodal link. |
| **L5** | **Hub Admin** | System root authority. | **+ Security Audits, Personnel Management, Node Registration.** |

### 👥 Observer Accounts
Administrators (L5) can register **Observers**. These are sub-accounts linked to the Admin's hub context. 
- **Isolated Credentials:** Observers set their own access ciphers (passwords).
- **Clearance Enforcement:** A Level 1 Observer can only see the dashboard, even if the Admin they follow has full access.
- **Audit Trails:** Every query made by an observer is logged with their ID for forensic accountability.

---

## 🏗️ System Architecture

### Frontend Layer
- **Core:** React 19 (ESM) with functional components and Hooks.
- **Styling:** Tailwind CSS with a custom "Obsidian Tactical" theme.
- **Video Processing:** `hls.js` for HLS stream compatibility and raw HTML5 Video for MP4/CCTV proxies.

### AI Processing (Google Gemini)
The hub utilizes three distinct Gemini models to optimize for cost, latency, and reasoning depth:
1. **Gemini 3 Pro (`gemini-3-pro-preview`):** Used for high-fidelity visual analysis and complex JSON-mode correlation (Tracking).
2. **Gemini 2.5 Flash Native Audio (`gemini-2.5-flash-native-audio-preview-12-2025`):** Powers the Tactical Radio, allowing for synchronized audio and image frame streaming with <1s latency.
3. **Gemini 3 Flash (`gemini-3-flash-preview`):** Used for rapid text-based tasks such as Daily Summaries and Executive Security Audits.

---

## 🧠 AI Intelligence Matrix

### A. Vision Analysis (`analyzeVideoFrame`)
When an operative queries a node, the system captures a frame buffer from the `<video>` element (CORS permitting). This frame, along with the **last 5 historical events** and camera metadata, is sent to the AI. The AI returns a structured JSON report containing:
- Primary Answer
- Summary for logs
- Detected Entities (Person, Vehicle, etc.)
- Confidence Score

### B. Subject Correlation (`traceSubjectPath`)
This module scans the entire hub's event history. By describing a subject (e.g., "blue jacket"), the AI performs **Temporal Vectoring**—identifying if the description matches events across different cameras at timestamps that suggest a logical path of travel.

### C. Tactical Live Radio (`connectTacticalLive`)
A high-performance WebSocket session that streams:
- **Audio-In:** Operative's microphone.
- **Image-In:** Synchronized frames (1 FPS) from the active node.
- **Audio-Out:** Clinical voice reports from the AI (Voice: *Charon*).

---

## 💾 Data Integrity & Multi-User Isolation
The `db` layer in `utils/storage.ts` manages persistence via `LocalStorage`.
- **Versioning:** Automated schema migration between versions (Current: v1.3.0).
- **Context Isolation:** All database calls utilize `getDataContextId()`. This ensures that an Observer sees the Admin's cameras, but their own messages and sessions remain private unless shared.
- **Soft Deletion:** Records are marked `isDeleted: true` for audit integrity before final purging.

---

## 🚀 Roadmap: Future Feature Implementations

1.  **AI Biometric Signature:** Extract gait and posture metadata to uniquely identify individuals across nodes even when faces are obscured.
2.  **Sentinel Alerts (Geofencing):** Allow operatives to draw "No-Go Zones" on a frame. Gemini monitors these zones and triggers L4 alerts on breach.
3.  **Autonomous Threat Escalation:** System automatically elevates logs to "High Risk" if weapon-like geometry is detected in frame buffers.
4.  **License Plate OCR (JSON-Mode):** Automatic extraction of vehicle plate strings into a searchable database.
5.  **Multimodal Satellite Link:** Integrate Google Maps grounding to show real-time subject locations on a 2D floor plan based on camera field-of-view data.
6.  **Crowd Sentiment Analysis:** Detect "Panic" or "Aggression" patterns in large groups using frame-sequence analysis.
7.  **Night-Vision Restoration:** Utilize AI image-to-image enhancement to "brighten" and clarify low-light infrared feeds.
8.  **Lip-Reading Transcriber:** For high-resolution zoom nodes, transcribe subject dialogue when audio hardware is absent.
9.  **Liveness Check Auth:** Require L5 Admins to perform a face-scan at the camera before accessing "Wipe Archive" commands.
10. **Tactical Mesh Bridge:** Allow two separate L5 Hubs to temporarily "link" their data for joint cross-organizational operations.
11. **Predicted Exit Vectoring:** AI predicts which door/gate a subject will use next based on their current velocity and historical patterns.
12. **Automated Forensic Reel:** One-click generation of a video "highlight reel" showing all points of contact with a tracked subject.

---

## 🛠️ Developer Guidance

### Standard Operating Procedures (SOP)
- **UI Design:** Always use the "Tactical" aesthetic—uppercase labels, monospace numbers, and high-contrast borders.
- **State Management:** Never bypass the `db` utility. All state changes must persist to ensure session continuity.
- **AI Tooling:** When adding tools to Gemini (Grounding, Search), ensure they are wrapped in `try/catch` and provide clinical fallback messages.
- **CORS Mitigation:** External cloud nodes (YouTube/Vimeo) cannot be analyzed via frame buffer due to browser security. Always check `camera.isExternal` before initiating AI analysis.

---
*Document produced by SurveillanceChat Core Engine. Unauthorized reproduction is a Tier-1 Policy Violation.*
