import type { ReactNode } from 'react';
import { useT } from '../../i18n';

interface ModalProps {
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  closeLabel?: string;
}

/** A centered overlay panel. Tapping the backdrop closes it (if onClose given). */
export function Modal({ title, onClose, children, closeLabel }: ModalProps) {
  const t = useT();
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85%] w-full max-w-sm overflow-y-auto rounded-2xl bg-whitewash p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-3 text-lg font-bold text-terracotta">{title}</h2>}
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-lg bg-black/10 py-2 text-sm font-medium text-black/70 active:scale-95"
          >
            {closeLabel ?? t('common.close')}
          </button>
        )}
      </div>
    </div>
  );
}
