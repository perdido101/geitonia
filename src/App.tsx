import { useGame } from './ui/GameContext';
import { ShiftScreen } from './ui/shift/ShiftScreen';
import { MapScreen } from './ui/map/MapScreen';

/**
 * Root router. During a shift → ShiftScreen; otherwise the walkable map, from which every
 * meta screen is reached. Title screen and game-over are layered in Phase 5.
 */
export default function App() {
  const { state } = useGame();
  return <div className="app-frame">{state.activeShift ? <ShiftScreen /> : <MapScreen />}</div>;
}
