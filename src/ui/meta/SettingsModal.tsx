import { useState } from 'react';
import { useGame } from '../GameContext';
import { useI18n, useT } from '../../i18n';
import type { Locale } from '../../i18n';
import { Modal } from '../common/Modal';
import { isSoundOn, setSoundOn } from '../../assets/audio';
import { clearSave } from '../../save';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { newGame } = useGame();
  const t = useT();
  const { locale, setLocale } = useI18n();
  const [sound, setSound] = useState(isSoundOn());
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Modal title={t('settings.title')} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-sm font-medium text-black/70">{t('settings.language')}</p>
          <div className="flex gap-2">
            {(['el', 'en'] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`flex-1 rounded px-3 py-2 text-sm active:scale-95 ${locale === l ? 'bg-ochre text-white' : 'bg-black/10 text-black/60'}`}
              >
                {t(`settings.language.${l}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-black/70">{t('settings.sound')}</span>
          <button
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundOn(next);
            }}
            className={`rounded px-4 py-2 text-sm font-semibold active:scale-95 ${sound ? 'bg-olive text-white' : 'bg-black/10 text-black/50'}`}
          >
            {sound ? '🔊' : '🔇'}
          </button>
        </div>

        <div>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full rounded px-3 py-2 text-sm font-medium text-terracotta active:scale-95"
            >
              {t('save.reset')}
            </button>
          ) : (
            <div className="rounded-lg bg-terracotta/10 p-2 text-center">
              <p className="mb-2 text-xs text-terracotta">{t('save.confirmReset')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearSave();
                    newGame(true);
                    onClose();
                  }}
                  className="flex-1 rounded bg-terracotta px-3 py-2 text-sm font-semibold text-white active:scale-95"
                >
                  {t('common.yes')}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded bg-black/10 px-3 py-2 text-sm active:scale-95"
                >
                  {t('common.no')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
