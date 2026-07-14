interface BarProps {
  value: number; // 0..1
  color?: string;
  bg?: string;
  className?: string;
  pulse?: boolean;
  height?: number;
}

/** A simple filled progress bar (patience, reputation, timer). */
export function Bar({ value, color = '#6b7a3a', bg = 'rgba(0,0,0,0.15)', className, pulse, height = 8 }: BarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`overflow-hidden rounded-full ${className ?? ''}`}
      style={{ backgroundColor: bg, height }}
    >
      <div
        className={pulse ? 'fx-pulse h-full' : 'h-full'}
        style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 90ms linear, background-color 200ms' }}
      />
    </div>
  );
}
