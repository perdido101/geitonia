import { useGame } from '../GameContext';
import { useI18n, useT } from '../../i18n';
import type { Locale } from '../../i18n';
import { hasSave } from '../../save';
import { Placeholder } from '../../assets/Placeholder';

/** Title screen (§9): Play / Continue, language + a first sound-unlock tap. */
export function TitleScreen({ onPlay }: { onPlay: (fresh: boolean) => void }) {
  const { newGame } = useGame();
  const t = useT();
  const { locale, setLocale } = useI18n();
  const saveExists = hasSave();

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="absolute inset-0 -z-10">
        <Placeholder assetKey="ui_title_bg" w={480} h={900} />
      </div>
      <Placeholder assetKey="ui_logo" h={120} className="rounded-xl" />
      <div>
        <h1 className="text-4xl font-black tracking-wide text-white drop-shadow">{t('app.title')}</h1>
        <p className="mt-1 text-sm text-white/90 drop-shadow">{t('title.tagline')}</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {saveExists && (
          <button
            onClick={() => onPlay(false)}
            className="rounded-xl bg-ochre px-6 py-3 text-lg font-bold text-white shadow-lg active:scale-95"
          >
            {t('title.continue')}
          </button>
        )}
        <button
          onClick={() => {
            newGame(true);
            onPlay(true);
          }}
          className={`rounded-xl px-6 py-3 text-lg font-bold shadow-lg active:scale-95 ${
            saveExists ? 'bg-olive text-white' : 'bg-ochre text-white'
          }`}
        >
          {t('title.play')}
        </button>
      </div>

      <div className="flex gap-2">
        {(['el', 'en'] as Locale[]).map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className={`rounded px-3 py-1.5 text-sm shadow ${locale === l ? 'bg-white text-ochre' : 'bg-black/30 text-white'}`}
          >
            {t(`settings.language.${l}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
