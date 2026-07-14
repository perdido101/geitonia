import { useLayoutEffect, useRef, useState } from 'react';
import type { AssetKey } from './registry';
import { getAsset } from './registry';

interface PlaceholderProps {
  assetKey: AssetKey;
  w?: number;
  h?: number;
  className?: string;
}

/**
 * Deterministic string hash → stable hue per asset key, so every placeholder is
 * visually distinct and the same key always looks the same across renders.
 */
function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * RULE 2 — All assets are placeholders.
 *
 * Renders a colored box with the asset key printed on it. Background hue is derived
 * by hashing the key so every asset is distinct. If a real asset path is registered
 * for the key, we render that image instead.
 */
export function Placeholder({ assetKey, w, h, className }: PlaceholderProps) {
  const real = getAsset(assetKey);
  const labelRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(12);

  // Auto-shrink the label so it always fits inside the placeholder bounds.
  useLayoutEffect(() => {
    if (real) return;
    const box = boxRef.current;
    const label = labelRef.current;
    if (!box || !label) return;
    let size = 14;
    label.style.fontSize = `${size}px`;
    while (
      size > 5 &&
      (label.scrollWidth > box.clientWidth - 4 || label.scrollHeight > box.clientHeight - 4)
    ) {
      size -= 1;
      label.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [assetKey, w, h, real]);

  const style: React.CSSProperties = {
    width: w != null ? `${w}px` : '100%',
    height: h != null ? `${h}px` : '100%',
  };

  if (real) {
    return (
      <img
        src={real}
        alt={assetKey}
        width={w}
        height={h}
        className={className}
        style={{ ...style, objectFit: 'contain' }}
      />
    );
  }

  const hue = hashKey(assetKey) % 360;

  return (
    <div
      ref={boxRef}
      className={className}
      style={{
        ...style,
        backgroundColor: `hsl(${hue}, 65%, 60%)`,
        border: '1px dashed rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      data-asset-key={assetKey}
      role="img"
      aria-label={assetKey}
    >
      <span
        ref={labelRef}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: `${fontSize}px`,
          lineHeight: 1.1,
          textAlign: 'center',
          color: 'rgba(0,0,0,0.75)',
          padding: '2px',
          wordBreak: 'break-all',
        }}
      >
        {assetKey}
      </span>
    </div>
  );
}

export default Placeholder;
