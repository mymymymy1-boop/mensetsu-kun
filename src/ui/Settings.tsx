// 設定（保護者ゲートの奥） — FR-STT-001(同意)/FR-SYS-002 / C-PRIV-003
import type { Settings as SettingsType } from '../domain/types';

interface Props {
  settings: SettingsType;
  sttBrowserSupported: boolean;
  onChange: (s: SettingsType) => void;
  onBack: () => void;
}

export function Settings({ settings, sttBrowserSupported, onChange, onBack }: Props) {
  const set = (patch: Partial<SettingsType>) => onChange({ ...settings, ...patch });

  return (
    <div className="parent">
      <h2>せってい（保護者むけ）</h2>

      <div className="row">
        <h3>音声の聞き取り（STT）</h3>
        <p className="warn">
          ⚠ 自動の聞き取りを有効にすると、<strong>お子さまの声がブラウザの音声認識サービス（Google等）に送信されます</strong>。
          既定は「録音のみ（外部送信なし）」です。録音はこの端末の中だけで処理され、保存もしません。
        </p>
        {!sttBrowserSupported && (
          <p className="small">※このブラウザは自動聞き取りに対応していません（Chrome/Safari推奨）。録音のみで動作します。</p>
        )}
        <label>
          <input
            type="radio"
            name="sttMode"
            checked={settings.sttMode === 'record-only'}
            onChange={() => set({ sttMode: 'record-only' })}
          />{' '}
          録音のみ（おすすめ・外部送信なし）
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="sttMode"
            disabled={!sttBrowserSupported}
            checked={settings.sttMode === 'webspeech-stt'}
            onChange={() => set({ sttMode: 'webspeech-stt' })}
          />{' '}
          自動で聞き取る（同意が必要）
        </label>
        {settings.sttMode === 'webspeech-stt' && (
          <div className="row">
            <label>
              <input
                type="checkbox"
                checked={settings.sttConsent}
                onChange={(e) => set({ sttConsent: e.target.checked })}
              />{' '}
              お子さまの声が外部の音声認識サービスに送信されることに同意します
            </label>
            {!settings.sttConsent && <p className="small">同意がないため、録音のみで動作します。</p>}
          </div>
        )}
      </div>

      <div className="row">
        <h3>読み上げの速さ</h3>
        <input
          type="range"
          min={0.6}
          max={1.2}
          step={0.1}
          value={settings.ttsRate}
          aria-label="読み上げ速度"
          onChange={(e) => set({ ttsRate: parseFloat(e.target.value) })}
        />{' '}
        {settings.ttsRate.toFixed(1)}x
      </div>

      <div className="row">
        <h3>結果の保存</h3>
        <label>
          <input
            type="checkbox"
            checked={settings.saveResults}
            onChange={(e) => set({ saveResults: e.target.checked })}
          />{' '}
          この端末に結果（点数・メモ）を保存する（※音声は保存しません）
        </label>
      </div>

      <button className="big-btn ghost" onClick={onBack}>
        もどる
      </button>
    </div>
  );
}
