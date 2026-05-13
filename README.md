### GDG London AI Devcamp 2026 — Build with AI
# 💊 EchoRx — An Intelligent Medicine Guidance Through Vision & Voice
 Powered by:
- Google ADK
- Gemini 2.5 Flash
- React Native
- FastAPI
- Multi-Agent AI Architecture

## Scan. Listen. Understand. For Visually Impaired/Elderly Person/Everyone
**EchoRx** is a voice you can trust when clarity matters most. Designed for elderly individuals, people with visual impairments, and the caregivers who support them, it transforms everyday uncertainty into informed confidence.

With a simple scan, EchoRx identifies your medication and delivers clear, spoken guidance on what it is, how to take it, and what to watch for. No confusion, no second guessing—just accurate, reassuring support when it’s needed most.

Like an echo that returns with certainty, EchoRx reflects essential information back to you in a voice that is steady, reliable, and clear. More than technology, it is confidence, safety, and peace of mind spoken aloud.


---

## 🚨 The Problem We Are Solving

This idea comes from something we see around us every day.

In many families, children move abroad or live away for work, while elderly parents stay at home on their own. It’s a common reality in our neighborhoods, in our homes.

Think about a simple moment.

An elderly parent wakes up in the middle of the night feeling unwell. They reach for their medicines—several similar-looking bottles placed on a table or in a cabinet. The labels are small, the lighting is dim, and their vision isn’t clear enough to read.

They pause.

Is this the right one?
Is it expired?
What’s the dosage?

It’s just a small moment of doubt—but one wrong choice can lead to serious consequences.
This is a quiet, everyday risk in homes all around us.
And it’s a problem that has largely gone unsolved—until now.

## 💡 The Solution

We solve this by turning a standard smartphone into an intelligent medicine guidance assistant

With EchoRx, users simply point their phone at a medicine bottle. Powered by the Google Agent Development Kit (ADK) and Gemini 2.5 Flash, the app:

- Instantly reads and identifies the medicine label
- Cross-checks critical safety information (dosage, timing, warnings)
- Speaks the guidance aloud in a clear, calm, easy-to-understand voice

In seconds, EchoRx responds:

> *"I can see this is Ibuprofen 400mg, used for pain relief. Do not take on an empty stomach. Maximum 3 tablets in 24 hours."*

No reading.
No guessing.
No risk.

EchoRx transforms uncertainty into clarity—bringing safety, confidence, and peace of mind to every home.

---

## 📁 Project Structure

```text
EchoRxAIMediAssistant/
├── app/                    ← React Native phone app
│   ├── App.js              ← All 3 screens (Home, Analysing, Result)
│   ├── config.js           ← Frontend configuration & API URL
│   ├── package.json        ← App dependencies
│   └── app.json            ← Expo configuration
│
└── backend/                ← Python AI agents
    ├── config.py           ← Configuration and API Keys
    ├── server.py           ← FastAPI server and endpoints
    ├── agents/             ← Multi-agent modules
    │   ├── __init__.py     ← Module exports
    │   ├── root.py         ← Root Agent orchestrator
    │   ├── labelsense.py   ← LabelSenseAgent
    │   ├── safetyguard.py  ← SafetyGuardAgent
    │   └── voiceassistant.py ← VoiceAssistAgent
    └── requirements.txt    ← Python dependencies
```

---

## 🛠️ SETUP — Do This Once

### STEP 1 — Get Your Free Gemini API Key (2 minutes)
1. Go to **https://aistudio.google.com**
2. Sign in with any Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy the key — looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXX`
5. Keep it safe, you'll need it in Step 3

---

### STEP 2 — Install Tools on Your Computer

**Install Python** (if not already installed):
- Go to **https://python.org** → Download
- Run installer
- ✅ **IMPORTANT: Tick "Add Python to PATH"** before clicking Install

**Install Node.js** (for the React Native app):
- Go to **https://nodejs.org** → Download LTS version
- Run installer, click Next everywhere

**Install Expo CLI** (open Terminal / Command Prompt):
```bash
npm install -g expo-cli
```

---

### STEP 3 — Set Up the Backend (Python Agents)

Open Terminal / Command Prompt:

```bash
# Go into backend folder
cd backend

# Install Python libraries
pip install -r requirements.txt

# Set your API key (Mac/Linux)
export GEMINI_API_KEY="AIzaSyYOUR_KEY_HERE"

# Set your API key (Windows)
set GEMINI_API_KEY=AIzaSyYOUR_KEY_HERE

# Start the server
python server.py
```

You should see:
```
🚀 EchoRx Backend Starting...
📡 API: http://localhost:8000
```

**Leave this terminal open — the server must keep running!**

---

### STEP 4 — Find Your Computer's IP Address

The phone app needs to find your computer on the same WiFi network.

**On Mac:**
```bash
ipconfig getifaddr en0
```

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" — e.g. `192.168.1.42`

---

### STEP 5 — Set Up the App

Open a **new** Terminal window:

```bash
# Go into app folder
cd app

# Install app libraries
npm install

# Open App.js and find this line at the top:
# const API_URL = 'http://YOUR_COMPUTER_IP:8000';
# Replace YOUR_COMPUTER_IP with your actual IP from Step 4
# Example: const API_URL = 'http://192.168.1.42:8000';
```

---

### STEP 6 — Run the App on Your Phone

```bash
# In the app folder:
npx expo start
```

A QR code will appear in your terminal.

**On your phone:**
1. Download **Expo Go** from App Store or Google Play
2. Open Expo Go
3. Tap **"Scan QR Code"**
4. Scan the QR code from your terminal
5. App opens on your phone! 📱

**Make sure your phone and computer are on the same WiFi network!**

---

## 🧪 Testing It Works

1. Backend running (Step 3) ✅
2. App open on phone (Step 6) ✅
3. Tap **"Scan Medicine"**
4. Take a photo of any medicine bottle (paracetamol, ibuprofen, anything)
5. Watch the 3 agent steps complete
6. Hear EchoRx describe the medicine aloud

---

## ♿ Accessibility & Safety Features

EchoRx is built from the ground up to support users with visual impairments and the elderly:

- **Semantic Screen Reader Headings:** The app implements native accessibility roles (`accessibilityRole="header"` and `accessible={true}`) on all major UI sections (Medicine Name, Usage, Max Daily Dose, Safety Check). This allows TalkBack (Android) and VoiceOver (iOS) users to quickly swipe through the app using standard "Heading" navigation.

- **Screen Reader Optimization:** Native integration with Apple VoiceOver and Android TalkBack. Decorative icons are strictly hidden using `accessibilityElementsHidden={true}` (iOS) and `importantForAccessibility="no"` (Android), while parent containers use explicit `accessibilityLabels` to guarantee clean, comma-free pronunciation. Buttons also have clear, descriptive `accessibilityLabels` and `accessibilityHints`.

- **Cross-Platform Voice Controls:** A smart, dynamic audio button. On iOS, users can seamlessly Pause and Resume the audio exactly where it left off. On Android, it gracefully degrades to a Stop/Restart flow to bypass OS-level TTS limitations.

- **Optimized Text-to-Speech:** The `VoiceAssistAgent` specifically structures its output for listening rather than reading, removing markdown and jargon. The app uses `expo-speech` to read this aloud at a slightly reduced speed (`0.85x`) to ensure maximum comprehension for elderly users.

- **High Contrast UI:** Deep navy backgrounds with bright, accessible warning colors (amber/red/green) for maximum readability.

- **Smart Edge-Case Handling:** The app dynamically formats the UI if the AI cannot read the label (returning "Not visible"). This prevents repetitive or confusing text (like "not visible not visible") from being announced by the screen reader, ensuring a smooth and clear auditory experience.

- **Strict Hallucination Prevention:** The `LabelSenseAgent` is engineered with explicit, strict rules for extracting expiry dates. It only extracts a date if clearly labeled with "EXP", "Expiry", or "Use By", actively avoiding dangerous AI hallucinations that could occur by misinterpreting a Manufacture Date (DOM) or Lot Number.

- **Real-Time Expiry Validation:** To prevent the AI from giving unsafe advice, the `SafetyGuardAgent` is dynamically injected with the current real-world date at the moment of scanning. It explicitly compares the extracted expiry date against today's date and forces a severe, prominent warning if the medicine is expired, rather than passively relying on the AI's internal sense of time.

- **"Read First, Think Second" Logic (Dose & Food):** To prevent dangerous hallucinations, the system relies strictly on the physical label first. If custom prescriptions (e.g., "Take 2 tablets daily") or specific warning stickers (e.g., "Take with food") are visible on the bottle, the AI is forced to use those exact instructions. It only falls back on its internal AI medical knowledge to provide safe, standard adult advice if the label is blank or illegible.

- **Non-Medicine Object Detection & Safety:** If a user accidentally scans a non-medicine item (e.g., a bottle of bleach or a beer), the AI actively identifies the object instead of failing. The UI dynamically adapts by hiding irrelevant medical cards (like daily dosage) and setting a prominent red warning header with the object's name. Most importantly, the `SafetyGuardAgent` evaluates the object for immediate safety risks (e.g., toxicity or alcohol interactions), and the voice agent clearly explains what the object is alongside any warnings, providing the user with vital spatial context and safety.

- **AI Image Confidence Scoring:** The `LabelSenseAgent` evaluates the clarity and quality of every scanned image. If a photo is blurry, poorly lit, or hard to read, the AI flags it with low confidence. The UI immediately reacts by displaying a prominent amber "LOW CONFIDENCE" warning badge instead of the green "IDENTIFIED" badge, alerting the caregiver or user to take a clearer photo to ensure maximum safety.

---

## 🏗️ How the 3 Agents Work

```
📸 Photo taken on phone
        │
        ▼ HTTP POST to backend
┌───────────────────────┐
│                       │
│  🔍 LABELSENSE AGENT       │  Reads the label like a pair of eyes
│  "Ibuprofen 400mg,    │  Uses Gemini Vision to understand image
│   expiry Jan 2026"    │  Returns: name, dosage, expiry, warnings
│                       │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│                       │
│  🛡️  SAFETYGUARD AGENT     │  Knows medicine safety information
│  "Take with food,     │  Returns: dose, warnings, max daily
│   max 3 per day"      │  Designed for 3am safety decisions
│                       │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│                       │
│  🔊 VOICEASSISTANT AGENT       │  Writes the spoken message
│  "I can see this is   │  Clear, calm, ordered for listening
│   Ibuprofen 400mg..." │  No jargon, short sentences
│                       │
└──────────┬────────────┘
           │
           ▼
📱 App speaks the message aloud (expo-speech)
```

---

