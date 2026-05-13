# 🎤 EchoRx: Hackathon Documentation

**GDG London AI Devcamp 2026 — Build with AI**

## 1. The Hook
> "Think about a simple moment at home. An elderly person, living alone, wakes up feeling unwell at 3 AM. They reach for their medicines—several similar-looking bottles on the table. The labels are small, the light is dim, and their vision isn’t clear. A small moment of doubt, but one wrong choice can lead to serious consequences. This is a problem nobody is solving. Until now."

## 2. What is EchoRx?
**EchoRx** is a voice you can trust when clarity matters most. Designed specifically for the elderly, individuals with visual impairments, and their caregivers, it transforms everyday medical uncertainty into informed confidence.

**Motto:** *Scan. Listen. Understand.*

By simply pointing their smartphone camera at a medicine bottle, EchoRx acts as an expert, on-call pharmacist. It reads the label, cross-references critical safety rules, and speaks the results aloud in a calm, clear voice.

## 3. How It Works (The Tech Stack)
We turned a standard smartphone into an AI assistant using a modern, decoupled architecture:
- **Frontend:** **React Native (Expo)** for a highly accessible, cross-platform mobile experience.
- **Backend:** **Python** and **FastAPI** to securely orchestrate the API endpoints and manage image processing.
- **AI Core:** The **Google Agent Development Kit (ADK)** running a `SequentialAgent` pipeline powered by the **Gemini 2.5 Flash** vision model.

### The 3-Agent Pipeline:
1. **🔍 LabelSense Agent:** Uses Gemini Vision to act as a pair of eyes. It strictly extracts the name, dosage, and expiry date. It is engineered with strict hallucination prevention (refusing to mistake a 'Manufacture Date' for an 'Expiry Date').
2. **🛡️ SafetyGuard Agent:** Uses clinical reasoning to act as the pharmacist. It evaluates the medicine, warns about taking it on an empty stomach, and calculates maximum daily dosages.
3. **🔊 VoiceAssist Agent:** Acts as the communicator. It synthesizes the clinical data into a calm, jargon-free, spoken message designed specifically to be *heard*, not read.

## 4. Key Differentiators (Why We Win)
We didn't just build an AI wrapper; we built a medical-grade accessibility tool.

- **Non-Medicine Object Detection & Safety:** If a user accidentally scans a bottle of bleach or a beer bottle thinking it's medication, the AI doesn't just crash. It identifies the object, dynamically changes the UI to a bright red warning, and the Safety Agent actively evaluates the object for immediate risks (e.g., toxicity or alcohol interactions).

- **"Read First, Think Second" Logic (Dose & Food):** To prevent dangerous AI hallucination, the system explicitly reads the physical label first. If a custom prescription (e.g., "Take 2 tablets daily") or warning sticker (e.g., "Take with food") is visible, the AI uses those exact instructions. It only falls back to standard general medical knowledge if the physical label is blank or illegible.

- **AI Image Confidence Scoring:** The `LabelSenseAgent` evaluates the clarity of every scan. If a photo is blurry, poorly lit, or hard to read, it flags it with low confidence. The UI reacts instantly by swapping the green "IDENTIFIED" badge for a prominent amber "LOW CONFIDENCE" warning, alerting the caregiver or user to retake the photo for maximum safety.

- **Native Screen Reader Optimization:** We went deep into native OS accessibility. Decorative icons are strictly hidden using `accessibilityElementsHidden={true}` (iOS) and `importantForAccessibility="no"` (Android) to prevent screen readers from reading raw UI code, ensuring a seamless, comma-free VoiceOver and TalkBack experience.

- **Semantic Screen Reader Headings:** All major UI sections are wrapped in native `accessibilityRole="header"`, allowing visually impaired users to instantly swipe and navigate through the app.

- **Cross-Platform Audio Engine:** We built a custom React Native audio orchestrator. On iOS, users can seamlessly pause and resume the AI's voice. On Android, it gracefully degrades to a Stop/Restart flow to bypass OS-level Text-to-Speech limitations.

-  **Optimized Text-to-Speech:** The `VoiceAssistAgent` specifically structures its output for listening rather than reading, removing markdown and jargon. The app uses `expo-speech` to read this aloud at a slightly reduced speed (`0.85x`) to ensure maximum comprehension for elderly users.

- **WCAG-Compliant Inclusive UI Design:**
  - **For Low Vision:** High contrast dark mode (pure white text against deep navy backgrounds) exceeding AAA contrast standards. Key data points (like Expiry Dates) utilize enlarged 15pt+ fonts, ensuring readability without requiring OS magnifiers.
  - **For Color Blindness (Deuteranopia/Protanopia):** Zero reliance on color-coding alone. All warnings pair high-contrast colors with explicit icons (⚠️) and dynamic text labels (e.g., swapping "IDENTIFIED" for "LOW CONFIDENCE") to ensure meaning is conveyed independent of color perception.
  - **For the Elderly (Cognitive & Motor):** A purely linear layout with zero hidden menus or complex gestures. Massive touch targets for the audio player and navigation buttons directly support users with hand tremors or arthritis. Android text-clipping bugs were specifically patched to ensure complete cognitive clarity.

- **Smart Edge-Case Handling:** The app dynamically formats the UI if the AI cannot read the label (returning "Not visible"). This prevents repetitive or confusing text (like "not visible not visible") from being announced by the screen reader, ensuring a smooth and clear auditory experience.

- **Strict Hallucination Prevention:** The `LabelSenseAgent` is engineered with explicit, strict rules for extracting expiry dates. It only extracts a date if clearly labeled with "EXP", "Expiry", or "Use By", actively avoiding dangerous AI hallucinations that could occur by misinterpreting a Manufacture Date (DOM) or Lot Number.

- Real-Time Expiry Validation: To prevent the AI from giving unsafe advice, the SafetyGuardAgent is dynamically injected with the current real-world date at the moment of scanning. It explicitly compares the extracted expiry date against today's date and forces a severe, prominent warning if the medicine is expired, rather than passively relying on the AI's internal sense of time.


## 5. The Future
EchoRx is currently a hyper-optimized prototype. In the future, we plan to build Production Ready with more safety features, like for dynamic drug-interaction checking, allowing users to scan multiple bottles and ask: *"Can I take these two together?"*

> **"Like an echo that returns with certainty, EchoRx reflects essential information back to you in a voice that is steady, reliable, and clear. More than technology, it is confidence, safety, and peace of mind spoken aloud."**
