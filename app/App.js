/**
 * 
 * EchoRx - Scan. Listen. Understand. for Visually Impaired /ElderlyPeople
 * Built for Google Devcamp 2026 Hackathon
 *
 * Screens:
 *  1. HomeScreen    — Camera viewfinder, Scan button
 *  2. AnalysingScreen — Live agent progress steps
 *  3. ResultScreen  — Medicine info + Read Aloud
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Animated, ScrollView, Image, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { API_URL } from './config';

// ─────────────────────────────────────────────
// COLOURS — matches the dark blue UI from mockup
// ─────────────────────────────────────────────
const C = {
  bg: '#0A0F1E',   // deep navy background
  card: '#111827',   // card background
  cardBorder: '#1F2937',   // card border
  blue: '#3B82F6',   // primary blue
  blueDark: '#1D4ED8',   // darker blue
  cyan: '#06B6D4',   // accent cyan
  green: '#10B981',   // success green
  orange: '#F59E0B',   // warning orange
  yellow: '#FCD34D',   // highlight yellow
  white: '#F9FAFB',   // text white
  grey: '#9CA3AF',   // muted text
  greyDark: '#374151',   // dark grey
};

// ─────────────────────────────────────────────
// AGENT STEPS shown on the Analysing screen
// ─────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Image captured', agent: 'labelsense' },
  { id: 2, label: 'Vision analysis complete', agent: 'labelsense' },
  { id: 3, label: 'Safety reasoning...', agent: 'safetyguard' },
  { id: 4, label: 'Personalising response', agent: 'safetyguard' },
  { id: 5, label: 'Generating voice output', agent: 'voiceassist' },
];

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home');      // 'home' | 'analysing' | 'result'
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [stepsDone, setStepsDone] = useState([]);
  const [speechState, setSpeechState] = useState('stopped'); // 'stopped' | 'playing' | 'paused'

  // ── Pick image from camera or gallery ──
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      // Fallback to gallery if camera denied
      const galleryResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!galleryResult.canceled) {
        startAnalysis(galleryResult.assets[0].uri);
      }
      return;
    }

    Alert.alert(
      'EchoRx',
      'How would you like to scan your medicine?',
      [
        {
          text: '📸 Take Photo',
          onPress: async () => {
            const camResult = await ImagePicker.launchCameraAsync({ quality: 0.8 });
            if (!camResult.canceled) startAnalysis(camResult.assets[0].uri);
          },
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: async () => {
            const galleryResult = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
            if (!galleryResult.canceled) startAnalysis(galleryResult.assets[0].uri);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ── Start the analysis pipeline ──
  const startAnalysis = async (uri) => {
    setImageUri(uri);
    setStepsDone([]);
    setResult(null);
    setScreen('analysing');

    try {
      // Step 1 — mark image captured immediately
      await delay(600);
      setStepsDone([1]);

      // Build form data
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'medicine.jpg',
      });

      // Call our backend (all 3 agents run here)
      const response = await fetch(`${API_URL}/analyse`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();

      // Animate the steps completing
      await delay(400); setStepsDone([1, 2]);
      await delay(700); setStepsDone([1, 2, 3]);
      await delay(600); setStepsDone([1, 2, 3, 4]);
      await delay(500); setStepsDone([1, 2, 3, 4, 5]);
      await delay(400);

      setResult(data);
      setScreen('result');

      // (Auto-read removed so the user can manually press the button)

    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to EchoRx server.\n\nMake sure your backend is running and API_URL is set correctly in App.js',
        [{ text: 'Go Back', onPress: () => setScreen('home') }]
      );
    }
  };

  // ── Text-to-Speech ──
  const toggleSpeech = (data) => {
    if (speechState === 'stopped') {
      const text = data?.spoken_message || 'No information available';
      setSpeechState('playing');
      Speech.speak(text, {
        language: 'en-GB',
        rate: 0.85,
        onDone: () => setSpeechState('stopped'),
        onError: () => setSpeechState('stopped'),
        onStopped: () => setSpeechState('stopped'),
      });
    } else if (speechState === 'playing') {
      if (Platform.OS === 'android') {
        Speech.stop();
        setSpeechState('stopped');
      } else {
        Speech.pause();
        setSpeechState('paused');
      }
    } else if (speechState === 'paused') {
      Speech.resume();
      setSpeechState('playing');
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeechState('stopped');
  };

  // ── Render ──
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {screen === 'home' && <HomeScreen onScan={pickImage} />}
      {screen === 'analysing' && <AnalysingScreen stepsDone={stepsDone} />}
      {screen === 'result' && (
        <ResultScreen
          result={result}
          imageUri={imageUri}
          speechState={speechState}
          onToggleSpeech={() => toggleSpeech(result)}
          onBack={() => { stopSpeaking(); setScreen('home'); }}
        />
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════
// SCREEN 1 — HOME
// ═══════════════════════════════════════════════
function HomeScreen({ onScan }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.homeHeader}>
        <View style={styles.logoIcon}>
          <Ionicons name="radio" size={24} color={C.white} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
        </View>
        <Text style={styles.logoText}>EchoRx</Text>
        <Text style={styles.logoSub}>SCAN. LISTEN. UNDERSTAND.</Text>
      </View>

      {/* Camera Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Pulsing camera icon */}
          <Animated.View style={[styles.cameraBtn, { transform: [{ scale: pulse }] }]}>
            <Ionicons name="camera" size={32} color={C.cyan} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
          </Animated.View>
        </View>
        <Text style={styles.viewfinderHint}>Point camera at any medicine{'\n'}label or bottle</Text>
      </View>

      {/* Scan Button */}
      <TouchableOpacity
        onPress={onScan}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Scan your medicine"
        accessibilityHint="Opens the camera to take a picture of your medicine bottle"
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <LinearGradient
          colors={[C.blue, C.blueDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.scanBtn}
        >
          <Ionicons name="scan" size={20} color={C.white} style={{ marginRight: 8 }} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
          <Text style={styles.scanBtnText}>Scan Medicine</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Voice indicator */}
      <View style={styles.voiceIndicator}>
        <Ionicons name="mic" size={14} color={C.grey} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
        <Text style={styles.voiceIndicatorText}>Voice output enabled</Text>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════
// SCREEN 2 — ANALYSING
// ═══════════════════════════════════════════════
function AnalysingScreen({ stepsDone }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = (dot, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
    anim(dot1, 0);
    anim(dot2, 200);
    anim(dot3, 400);
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Processing badge */}
      <View style={styles.processingBadge}>
        <View style={styles.processingDot} />
        <Text style={styles.processingText}>GEMINI VISION · PROCESSING</Text>
      </View>

      <Text style={styles.analysingTitle}>Analysing...</Text>
      <Text style={styles.analysingSubtitle}>Hold still while we identify your{'\n'}medicine safely</Text>

      {/* Medicine illustration */}
      <View style={styles.pillIllustration}>
        <View style={styles.pillLeft} />
        <View style={styles.pillRight} />
        <View style={styles.pillLabel}>
          <View style={styles.pillLabelLine} />
          <View style={styles.pillLabelLine} />
          <View style={[styles.pillLabelLine, { width: '60%' }]} />
        </View>
      </View>

      {/* Animated dots */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
        ))}
      </View>

      {/* Agent steps */}
      <View style={styles.stepsList}>
        {STEPS.map(step => {
          const done = stepsDone.includes(step.id);
          const active = !done && stepsDone.length === step.id - 1;
          return (
            <View key={step.id} style={styles.stepRow}>
              {done ? (
                <View style={styles.stepIconDone}>
                  <Ionicons name="checkmark" size={12} color={C.white} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
                </View>
              ) : active ? (
                <View style={styles.stepIconActive} />
              ) : (
                <View style={styles.stepIconPending} />
              )}
              <Text style={[
                styles.stepLabel,
                done && styles.stepLabelDone,
                active && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════
// SCREEN 3 — RESULT
// ═══════════════════════════════════════════════
function ResultScreen({ result, imageUri, speechState, onToggleSpeech, onBack }) {
  const med = result?.medicine_info || {};
  const safety = result?.safety_info || {};
  const spoken = result?.spoken_message || '';

  let medicineName = med.medicine_name || 'Unknown Medicine';
  let dosage = med.dosage || '';
  const isMedicine = med.is_medicine !== false;
  const detectedObject = med.detected_object || 'an unknown object';

  let displayTitle = `${medicineName} ${dosage}`.trim();
  if (!isMedicine) {
    displayTitle = detectedObject.toUpperCase();
  } else if (medicineName.toLowerCase() === 'not visible' && dosage.toLowerCase() === 'not visible') {
    displayTitle = 'Not visible';
  } else if (dosage.toLowerCase() === 'not visible') {
    displayTitle = medicineName;
  } else if (medicineName.toLowerCase() === 'not visible') {
    displayTitle = dosage;
  }
  const purpose = safety.purpose || 'Information not available';
  const stdDose = safety.standard_dose || 'Check label';
  const maxDose = safety.max_daily_dose || 'Check label';
  const warning = (safety.critical_warning && safety.critical_warning.toLowerCase() !== 'none') ? safety.critical_warning : '';
  const emptyStomach = safety.empty_stomach || 'either';
  const safeNight = safety.safe_at_night !== 'no';
  const nightNote = safety.night_note || '';
  const confidence = med.confidence || 'medium';
  const expiry = med.expiry_date || 'Not visible on label';

  const stomachText =
    emptyStomach === 'no' ? '⚠️  Take with food' :
      emptyStomach === 'yes' ? '✅  Can take on empty stomach' :
        '✅  Take with or without food';

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top bar */}
      <View style={styles.resultTopBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back to home screen"
          hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
        >
          <Ionicons name="chevron-back" size={22} color={C.white} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
        </TouchableOpacity>
        <View style={[
          styles.identifiedBadge,
          confidence === 'low' && { backgroundColor: '#78350F' }
        ]}>
          <Text style={styles.identifiedText}>
            {confidence === 'low' ? 'LOW CONFIDENCE' : 'IDENTIFIED'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {!isMedicine && (
          <View style={[styles.infoCard, { borderColor: '#EF4444', borderWidth: 1, marginTop: 20 }]}>
            <View style={styles.infoCardHeader} accessibilityRole="header" accessible={true} accessibilityLabel="NOT A MEDICINE">
              <Ionicons name="warning" size={14} color="#EF4444" style={{ marginRight: 6 }} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
              <Text style={[styles.infoCardLabel, { color: '#EF4444' }]}>NOT A MEDICINE</Text>
            </View>
            <Text style={{ color: C.white, fontSize: 16, marginTop: 10, lineHeight: 22 }}>
              I can see {detectedObject}. This does not appear to be a medicine.
            </Text>
          </View>
        )}

        {/* Medicine name header */}
        <LinearGradient colors={[!isMedicine ? '#7F1D1D' : C.blue, !isMedicine ? '#450A0A' : C.blueDark]} style={styles.medicineHeader}>
          <View accessibilityRole="header" accessible={true}>
            <Text style={styles.medicineName}>{displayTitle}</Text>
          </View>
          <Text style={styles.medicineCategories}>{purpose}</Text>
          <Text style={styles.medicineExpiry}>Expiry: {expiry}</Text>
        </LinearGradient>

        {/* Cards */}
        <View style={styles.cardsContainer}>

          {isMedicine && (
            <>
              {/* Usage */}
              <InfoCard label="USAGE" icon="medical">
                <Text style={styles.cardValue}>{stdDose}</Text>
              </InfoCard>

              {/* Max daily dose */}
              <InfoCard label="MAX DAILY DOSE" icon="warning" accentColor={C.orange}>
                <Text style={[styles.cardValue, { color: C.orange }]}>{maxDose}</Text>
              </InfoCard>

              {/* Stomach */}
              <InfoCard label="WITH FOOD?" icon="restaurant">
                <Text style={styles.cardValue}>{stomachText}</Text>
              </InfoCard>
            </>
          )}

          {/* Night safety */}
          {!safeNight && nightNote ? (
            <View style={[styles.alertCard, { borderColor: C.orange }]}>
              <View style={[styles.alertDot, { backgroundColor: C.orange }]} />
              <Text style={styles.alertText}>{nightNote}</Text>
            </View>
          ) : null}

          {/* Critical warning */}
          {warning ? (
            <View style={[styles.alertCard, { borderColor: C.yellow }]}>
              <View style={[styles.alertDot, { backgroundColor: C.yellow }]} />
              <Text style={styles.alertText}>{warning}</Text>
            </View>
          ) : null}

          {/* Safety check */}
          <InfoCard label="SAFETY CHECK" icon="shield-checkmark" accentColor={C.green}>
            <Text style={[styles.cardValue, { color: C.grey, fontSize: 13 }]}>
              Please double-check with a pharmacist if unsure. Call NHS 111 free anytime.
            </Text>
          </InfoCard>

          {/* Low confidence warning */}
          {confidence === 'low' && (
            <View style={[styles.alertCard, { borderColor: '#EF4444' }]}>
              <View style={[styles.alertDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.alertText, { color: '#FCA5A5' }]}>
                Image was unclear. Please retake photo in better light before relying on this information.
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Read Aloud Button — always visible at bottom */}
      <View style={styles.readAloudBar}>
        <TouchableOpacity
          onPress={onToggleSpeech}
          style={[
            styles.readAloudBtn,
            speechState === 'playing' && styles.readAloudBtnActive,
            speechState === 'paused' && { backgroundColor: C.orange }
          ]}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            speechState === 'playing' ? (Platform.OS === 'android' ? "Stop Reading" : "Pause Reading") :
              speechState === 'paused' ? "Resume Reading" : "Read Aloud"
          }
          accessibilityHint="Toggles the spoken audio of your medicine results"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons
            name={
              speechState === 'playing' ? (Platform.OS === 'android' ? 'stop-circle' : 'pause-circle') :
                speechState === 'paused' ? 'play-circle' : 'volume-high'
            }
            size={20}
            color={C.white}
            style={{ marginRight: 8 }}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          />
          <Text style={styles.readAloudText}>
            {speechState === 'playing' ? (Platform.OS === 'android' ? 'Stop Reading' : 'Pause Reading') :
              speechState === 'paused' ? 'Resume Reading' : 'Read Aloud'}
          </Text>
          {speechState === 'playing' && (
            <View style={styles.waveformRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={[styles.waveBar, { height: 4 + Math.random() * 12 }]} />
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// REUSABLE INFO CARD
// ─────────────────────────────────────────────
function InfoCard({ label, icon, accentColor = C.cyan, children }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader} accessibilityRole="header" accessible={true} accessibilityLabel={label}>
        <Ionicons name={icon} size={14} color={accentColor} style={{ marginRight: 6 }} accessible={false} importantForAccessibility="no" accessibilityElementsHidden={true} />
        <Text style={[styles.infoCardLabel, { color: accentColor }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingHorizontal: 20 },

  // ── HOME ──
  homeHeader: { alignItems: 'center', marginTop: 48, marginBottom: 40 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: C.white, letterSpacing: 1 },
  logoSub: { fontSize: 12, color: C.grey, letterSpacing: 3, marginTop: 4 },

  viewfinderContainer: { alignItems: 'center', marginBottom: 40 },
  viewfinder: {
    width: 240, height: 200, borderRadius: 16,
    backgroundColor: '#0D1424', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: C.cyan, borderWidth: 3 },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },

  cameraBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1A2540', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.cyan,
  },
  viewfinderHint: { color: C.grey, textAlign: 'center', lineHeight: 22, fontSize: 14 },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 56, paddingVertical: 18,
    borderRadius: 50, marginBottom: 20,
  },
  scanBtnText: { color: C.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },

  voiceIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  voiceIndicatorText: { color: C.grey, fontSize: 13 },

  // ── ANALYSING ──
  processingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D2D1A', borderWidth: 1, borderColor: C.green,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 40, marginBottom: 24,
  },
  processingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginRight: 8 },
  processingText: { color: C.green, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  analysingTitle: { fontSize: 30, fontWeight: '800', color: C.white, marginBottom: 8 },
  analysingSubtitle: { color: C.grey, textAlign: 'center', lineHeight: 22, marginBottom: 36 },

  pillIllustration: {
    width: 200, height: 100, backgroundColor: '#111827',
    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 16, marginBottom: 24,
    borderWidth: 1, borderColor: C.greyDark,
  },
  pillLeft: { width: 60, height: 30, borderRadius: 15, backgroundColor: '#D1D5DB' },
  pillRight: { width: 60, height: 30, borderRadius: 15, backgroundColor: '#3B82F6', opacity: 0.8 },
  pillLabel: {
    width: 50, height: 64, backgroundColor: '#1E3A5F',
    borderRadius: 6, padding: 8, justifyContent: 'space-around',
    borderWidth: 1, borderColor: C.blue,
  },
  pillLabelLine: { height: 4, backgroundColor: C.blue, borderRadius: 2, width: '100%' },

  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.cyan },

  stepsList: { width: '100%', paddingHorizontal: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepIconDone: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  stepIconActive: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: C.cyan, backgroundColor: 'transparent', marginRight: 12,
  },
  stepIconPending: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: C.greyDark, backgroundColor: 'transparent', marginRight: 12,
  },
  stepLabel: { color: C.grey, fontSize: 14 },
  stepLabelDone: { color: C.green, fontSize: 14 },
  stepLabelActive: { color: C.white, fontSize: 14, fontWeight: '600' },

  // ── RESULT ──
  resultTopBar: {
    flexDirection: 'row', width: '100%',
    justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
  },
  identifiedBadge: {
    backgroundColor: '#065F46', paddingHorizontal: 16,
    height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'
  },
  identifiedText: { color: C.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, includeFontPadding: false, textAlignVertical: 'center' },

  medicineHeader: {
    width: '100%', borderRadius: 16, padding: 20, marginBottom: 12,
  },
  medicineName: { fontSize: 24, fontWeight: 'normal', color: C.white, marginBottom: 4 },
  medicineCategories: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 6 },
  medicineExpiry: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },

  cardsContainer: { width: '100%', gap: 10 },

  infoCard: {
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.cardBorder,
    padding: 16,
  },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoCardLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1.0 },
  cardValue: { color: C.white, fontSize: 15, fontWeight: '500', lineHeight: 22 },

  alertCard: {
    backgroundColor: '#1A1200', borderRadius: 14,
    borderWidth: 1, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  alertDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10, marginTop: 4 },
  alertText: { color: '#FDE68A', fontSize: 13, lineHeight: 20, flex: 1 },

  readAloudBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.bg, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: C.cardBorder,
  },
  readAloudBtn: {
    backgroundColor: C.green, borderRadius: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16,
  },
  readAloudBtnActive: { backgroundColor: '#065F46' },
  readAloudText: { color: C.white, fontSize: 16, fontWeight: '700' },
  waveformRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, gap: 3 },
  waveBar: { width: 3, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 },
});
