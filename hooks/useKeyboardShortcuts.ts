import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if focused on input/textarea/contenteditable
    const target = e.target as HTMLElement;
    const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    const key = [
      e.ctrlKey || e.metaKey ? 'ctrl' : '',
      e.shiftKey ? 'shift' : '',
      e.key.toLowerCase(),
    ].filter(Boolean).join('+');

    if (shortcuts[key]) {
      // contentEditable 편집 중에는 Ctrl+Z/Shift+Z를 브라우저 기본 undo/redo로 넘김
      if (isEditing && (key === 'ctrl+z' || key === 'ctrl+shift+z')) return;
      if (isEditing) return;
      e.preventDefault();
      shortcuts[key]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
