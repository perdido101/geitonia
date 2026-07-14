import { useState } from 'react';
import { useGame } from './ui/GameContext';
import { ShiftScreen } from './ui/shift/ShiftScreen';
import { MapScreen } from './ui/map/MapScreen';
import { TitleScreen } from './ui/meta/TitleScreen';
import { GameOverScreen } from './ui/meta/GameOverScreen';

/**
 * Root router. Title → game. During a shift → ShiftScreen; otherwise the walkable map,
 * from which every meta screen is reached. Game-over overlays everything.
 */
export default function App() {
  const { state } = useGame();
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="app-frame">
        <TitleScreen onPlay={() => setStarted(true)} />
      </div>
    );
  }

  return (
    <div className="app-frame">
      {state.activeShift ? <ShiftScreen /> : <MapScreen />}
      {state.flags.gameOver && <GameOverScreen />}
    </div>
  );
}
