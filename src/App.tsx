// アプリ本体（画面遷移オーケストレーション） — 全FR
import { useMemo, useState } from 'react';
import './App.css';
import type { Mode, School, SessionItem, Settings as SettingsType } from './domain/types';
import { candidatesFor, selectQuestions } from './domain/selector';
import { sessionTotal } from './domain/scoring';
import { validateQuestions } from './data/questions.schema';
import { questions as rawQuestions } from './data/questions';
import { isSttActive, makeRecorder, makeStt, makeTts } from './audio/audioFactory';
import type { RecorderPort, SttPort, TtsPort } from './audio/types';
import { WebSpeechStt } from './audio/webSpeechStt';
import { loadSettings, saveSettings } from './state/settings';
import { saveSession } from './state/sessionStore';
import { Home } from './ui/Home';
import { SchoolSelect } from './ui/SchoolSelect';
import { ModeSelect } from './ui/ModeSelect';
import { Quiz } from './ui/Quiz';
import { ChildResult } from './ui/ChildResult';
import { ParentGate } from './ui/ParentGate';
import { ParentReport } from './ui/ParentReport';
import { Settings } from './ui/Settings';

type Screen = 'home' | 'school' | 'mode' | 'quiz' | 'childResult' | 'gate' | 'parent' | 'settings';
const QUESTIONS_PER_SESSION = 5;

export interface AppPorts {
  tts?: TtsPort;
  recorder?: RecorderPort;
  makeSttFor?: (s: SettingsType) => SttPort;
  sttBrowserSupported?: boolean;
}

export default function App(ports: AppPorts = {}) {
  const VALID = useMemo(() => validateQuestions(rawQuestions).valid, []);
  const [settings, setSettings] = useState<SettingsType>(() => loadSettings());
  const [screen, setScreen] = useState<Screen>('home');
  const [school, setSchool] = useState<School>('common');
  const [mode, setMode] = useState<Mode>('interview');
  const [items, setItems] = useState<SessionItem[]>([]);
  const [seed, setSeed] = useState(0);
  const [gateNext, setGateNext] = useState<'parent' | 'settings'>('parent');

  const tts = useMemo(() => ports.tts ?? makeTts(), [ports.tts]);
  const recorder = useMemo(() => ports.recorder ?? makeRecorder(), [ports.recorder]);
  const stt = useMemo(
    () => (ports.makeSttFor ? ports.makeSttFor(settings) : makeStt(settings)),
    [ports, settings],
  );
  const sttBrowserSupported = ports.sttBrowserSupported ?? new WebSpeechStt().supported();

  const availability = useMemo<Record<Mode, number>>(
    () => ({
      interview: candidatesFor(school, 'interview', VALID).length,
      behavior: candidatesFor(school, 'behavior', VALID).length,
    }),
    [school, VALID],
  );

  const sessionQuestions = useMemo(
    () => selectQuestions(school, mode, VALID, QUESTIONS_PER_SESSION, seed),
    [school, mode, VALID, seed],
  );

  const startSession = (m: Mode) => {
    setMode(m);
    setItems([]);
    setSeed((s) => s + 1);
    setScreen('quiz');
  };

  const onComplete = (its: SessionItem[]) => {
    setItems(its);
    const total = sessionTotal(its.map((i) => i.score));
    saveSession(
      { id: `s-${seed}`, school, mode, items: its, total },
      settings.saveResults,
      Date.now(),
    );
    setScreen('childResult');
  };

  const applyOverride = (idx: number, raw: number | undefined, memo: string | undefined) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, score: { ...it.score, parentOverride: { raw, memo } } } : it,
      ),
    );
  };

  const changeSettings = (s: SettingsType) => {
    setSettings(s);
    saveSettings(s);
  };

  const ParentCorner = (
    <button
      className="parent-gate-corner"
      onClick={() => {
        setGateNext('parent');
        setScreen('gate');
      }}
    >
      🔒 おうちのかた
    </button>
  );

  return (
    <div className="app">
      {(screen === 'home' || screen === 'childResult') && ParentCorner}

      {screen === 'home' && <Home onStart={() => setScreen('school')} />}

      {screen === 'school' && (
        <SchoolSelect
          onSelect={(s) => {
            setSchool(s);
            setScreen('mode');
          }}
          onSpeak={(t) => void tts.speak(t, { rate: settings.ttsRate })}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'mode' && (
        <ModeSelect
          school={school}
          availability={availability}
          onSelect={startSession}
          onBack={() => setScreen('school')}
        />
      )}

      {screen === 'quiz' && (
        <Quiz
          questions={sessionQuestions}
          tts={tts}
          recorder={recorder}
          stt={stt}
          ttsRate={settings.ttsRate}
          recordingSupported={recorder.supported()}
          onComplete={onComplete}
        />
      )}

      {screen === 'childResult' && (
        <ChildResult
          items={items}
          onAgain={() => setScreen('mode')}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'gate' && (
        <ParentGate onPass={() => setScreen(gateNext)} onCancel={() => setScreen('home')} />
      )}

      {screen === 'parent' && (
        <ParentReport
          items={items}
          onOverride={applyOverride}
          onBack={() => setScreen('home')}
          onOpenSettings={() => setScreen('settings')}
        />
      )}

      {screen === 'settings' && (
        <Settings
          settings={settings}
          sttBrowserSupported={sttBrowserSupported}
          onChange={changeSettings}
          onBack={() => setScreen('parent')}
        />
      )}

      {(screen === 'parent' || screen === 'settings') && isSttActive(settings) && (
        <p className="small">⚠ いまは「自動聞き取り」が有効です（声が外部送信されます）。</p>
      )}
    </div>
  );
}
