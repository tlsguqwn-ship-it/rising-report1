import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Undo2, Redo2, Download, RotateCcw, Sun, Moon,
  ZoomIn, ZoomOut, Palette, Smile, Eraser, Bold,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { PRESET_COLORS, EMOJI_CATEGORIES } from './FloatingToolbar';

interface ToolbarProps {
  reportType: '장전' | '마감';
  onModeSwitch: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onReset: () => void;
  onExport: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
}

// 드롭다운 패널 래퍼
const DropdownPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: 'left' | 'center';
}> = ({ isOpen, onClose, children, align = 'center' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handle), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handle); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200/80 z-[999] animate-scale-in ${
        align === 'center' ? '-translate-x-1/2 left-1/2' : 'left-0'
      }`}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({
  reportType, onModeSwitch, onUndo, onRedo, canUndo, canRedo,
  onReset, onExport, zoom, onZoomChange, darkMode = false, onDarkModeToggle,
}) => {
  const isPreMarket = reportType === '장전';
  const [openPanel, setOpenPanel] = useState<'color' | 'emoji' | null>(null);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [currentFontSize, setCurrentFontSize] = useState<number | null>(null);
  const [activeEditableEl, setActiveEditableEl] = useState<HTMLElement | null>(null);
  const [isBold, setIsBold] = useState(false);
  const fontSizeInputRef = useRef<HTMLInputElement>(null);

  // contenteditable 포커스 감지 → 현재 폰트 크기 읽기
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target?.contentEditable === 'true') {
        setActiveEditableEl(target);
        const computed = window.getComputedStyle(target);
        const px = parseFloat(computed.fontSize);
        setCurrentFontSize(Math.round(px));
      }
    };
    const handleFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement;
      // 툴바 내부로 이동할 때는 유지
      if (related?.closest?.('.rich-text-toolbar')) return;
      // 약간의 딜레이 (드롭다운 클릭 대응)
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (active?.contentEditable !== 'true' && !active?.closest?.('.rich-text-toolbar')) {
          setActiveEditableEl(null);
          setCurrentFontSize(null);
        }
      }, 150);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Bold 상태 감지: 커서 위치에 따라 B 버튼 활성화
  useEffect(() => {
    const updateBoldState = () => {
      try {
        const active = document.activeElement as HTMLElement;
        if (active?.contentEditable === 'true') {
          setIsBold(document.queryCommandState('bold'));
        }
      } catch {}
    };
    document.addEventListener('selectionchange', updateBoldState);
    return () => document.removeEventListener('selectionchange', updateBoldState);
  }, []);

  const togglePanel = useCallback((panel: 'color' | 'emoji') => {
    setOpenPanel(prev => prev === panel ? null : panel);
  }, []);

  // 색상 적용
  const applyColor = useCallback((color: string) => {
    document.execCommand('foreColor', false, color);
  }, []);

  // 폰트 크기 적용 (element.style.fontSize 직접 변경)
  const applyFontSize = useCallback((size: number) => {
    if (!activeEditableEl) return;
    const clampedSize = Math.max(8, Math.min(48, size));
    setCurrentFontSize(clampedSize);
    activeEditableEl.style.fontSize = `${clampedSize}px`;
  }, [activeEditableEl]);

  // 폰트 크기 증감
  const adjustFontSize = useCallback((delta: number) => {
    if (currentFontSize === null || !activeEditableEl) return;
    applyFontSize(currentFontSize + delta);
  }, [currentFontSize, activeEditableEl, applyFontSize]);

  // 이모지 삽입
  const insertEmoji = useCallback((emoji: string) => {
    document.execCommand('insertText', false, emoji);
  }, []);

  // 서식 초기화
  const resetFormat = useCallback(() => {
    if (!activeEditableEl) return;
    if (!confirm('서식을 초기화하시겠습니까? (색상·크기 변경이 모두 제거됩니다)')) return;

    // 전체 선택 후 removeFormat
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(activeEditableEl);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('removeFormat', false);
      sel.removeAllRanges();
    }

    // font 태그 제거
    activeEditableEl.querySelectorAll('font').forEach(font => {
      const text = document.createTextNode(font.textContent || '');
      font.parentNode?.replaceChild(text, font);
    });
    // span 인라인 스타일 제거
    activeEditableEl.querySelectorAll('span[style]').forEach(span => {
      const text = document.createTextNode(span.textContent || '');
      span.parentNode?.replaceChild(text, span);
    });

    // 요소 인라인 스타일 제거
    activeEditableEl.style.color = '';
    activeEditableEl.style.fontSize = '';

    // 현재 크기 다시 읽기
    const computed = window.getComputedStyle(activeEditableEl);
    setCurrentFontSize(Math.round(parseFloat(computed.fontSize)));
  }, [activeEditableEl]);

  // 폰트 크기 입력 핸들러
  const handleFontSizeInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(val)) applyFontSize(val);
      // 포커스를 다시 editable로
      activeEditableEl?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustFontSize(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustFontSize(-1);
    }
  }, [applyFontSize, adjustFontSize, activeEditableEl]);

  const btnClass = "p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-600 relative";
  const activeBtnClass = "p-2 rounded-lg bg-blue-50 text-blue-600 transition-all relative ring-1 ring-blue-200";

  return (
    <nav className="rich-text-toolbar bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-2.5 flex justify-between items-center sticky top-0 z-50 no-print shadow-sm">
      {/* Left: Branding + Mode Toggle */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg">
            R
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tighter leading-none">K-Stock Report Pro</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Rising Intelligence Editor</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* Mode Toggle */}
        <button
          onClick={onModeSwitch}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
            isPreMarket
              ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
              : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
          }`}
        >
          {isPreMarket ? <Sun size={14} /> : <Moon size={14} />}
          {isPreMarket ? '장전 REPORT' : '마감 REPORT'}
          <span className="text-[10px] opacity-50">클릭 전환</span>
        </button>

        {/* 마감 모드: 다크/화이트 모드 토글 */}
        {!isPreMarket && onDarkModeToggle && (
          <button
            onClick={onDarkModeToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              darkMode
                ? 'bg-slate-800 text-yellow-300 border-slate-600 hover:bg-slate-700'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={darkMode ? '화이트 모드로 전환' : '블랙 모드로 전환'}
          >
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            {darkMode ? 'White' : 'Black'}
          </button>
        )}
      </div>

      {/* Center: Edit Controls + Zoom + Rich Text Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
          title="실행취소 (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
          title="재실행 (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        {/* Zoom Controls */}
        <button
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
          title="축소"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-[11px] font-bold text-slate-500 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
          title="확대"
        >
          <ZoomIn size={16} />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        {/* ===== Rich Text Tools ===== */}

        {/* 굵게 */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand('bold');
            setTimeout(() => {
              try { setIsBold(document.queryCommandState('bold')); } catch {}
            }, 0);
          }}
          className={isBold ? activeBtnClass : btnClass}
          title="굵게 (Ctrl+B)"
        >
          <span style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'serif' }}>B</span>
        </button>

        {/* 색상 */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); togglePanel('color'); }}
            className={openPanel === 'color' ? activeBtnClass : btnClass}
            title="텍스트 색상"
          >
            <Palette size={16} />
          </button>
          <DropdownPanel isOpen={openPanel === 'color'} onClose={() => setOpenPanel(null)}>
            <div className="p-3" style={{ width: '220px' }}>
              <div className="text-[10px] font-bold text-slate-400 mb-2">추천 색상</div>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.color}
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c.color); }}
                    className="group flex flex-col items-center gap-1"
                    title={c.name}
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform ring-1 ring-slate-200/60 hover:ring-blue-400"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[8px] font-medium text-slate-400 group-hover:text-slate-600 truncate w-full text-center">{c.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">커스텀</span>
                <input
                  type="color"
                  defaultValue="#3182f6"
                  onChange={(e) => applyColor(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
              </div>
            </div>
          </DropdownPanel>
        </div>

        {/* 폰트 크기 (엑셀 스타일 숫자 입력) */}
        <div className="flex items-center gap-0.5 mx-1" onMouseDown={(e) => e.preventDefault()}>
          <input
            ref={fontSizeInputRef}
            type="number"
            min={8}
            max={48}
            value={currentFontSize ?? ''}
            placeholder="—"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) setCurrentFontSize(val);
            }}
            onKeyDown={handleFontSizeInputKeyDown} 
            onBlur={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) applyFontSize(val);
            }}
            className={`w-[42px] h-[30px] text-center text-[12px] font-bold rounded-l-md border border-r-0 border-slate-200 outline-none transition-all ${
              currentFontSize !== null
                ? 'bg-white text-slate-700 focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                : 'bg-slate-50 text-slate-300 cursor-default'
            }`}
            style={{ MozAppearance: 'textfield' }}
            disabled={currentFontSize === null}
            title="텍스트 크기 (px) — 클릭한 영역의 폰트 크기"
          />
          <div className="flex flex-col">
            <button
              onMouseDown={(e) => { e.preventDefault(); adjustFontSize(1); }}
              disabled={currentFontSize === null}
              className="h-[15px] w-[20px] flex items-center justify-center border border-b-0 border-slate-200 rounded-tr-md hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors bg-white"
              title="크기 +1"
            >
              <ChevronUp size={10} className="text-slate-500" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); adjustFontSize(-1); }}
              disabled={currentFontSize === null}
              className="h-[15px] w-[20px] flex items-center justify-center border border-slate-200 rounded-br-md hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors bg-white"
              title="크기 -1"
            >
              <ChevronDown size={10} className="text-slate-500" />
            </button>
          </div>
          <span className="text-[9px] text-slate-400 font-bold ml-0.5 select-none">px</span>
        </div>

        {/* 이모지 */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); togglePanel('emoji'); }}
            className={openPanel === 'emoji' ? activeBtnClass : btnClass}
            title="이모지"
          >
            <Smile size={16} />
          </button>
          <DropdownPanel isOpen={openPanel === 'emoji'} onClose={() => setOpenPanel(null)} align="left">
            <div style={{ width: '320px' }}>
              <div className="flex border-b border-slate-100 px-1 overflow-x-auto">
                {EMOJI_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onMouseDown={(e) => { e.preventDefault(); setEmojiCategory(idx); }}
                    className={`px-2.5 py-1.5 text-[14px] shrink-0 transition-colors rounded-t ${
                      emojiCategory === idx
                        ? 'bg-blue-50 border-b-2 border-blue-500 -mb-px'
                        : 'hover:bg-slate-100'
                    }`}
                    title={cat.name}
                  >
                    {cat.icon}
                  </button>
                ))}
              </div>
              <div className="p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="text-[9px] font-bold text-slate-400 mb-1 px-1">{EMOJI_CATEGORIES[emojiCategory].name}</div>
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => { e.preventDefault(); insertEmoji(emoji); }}
                      className="w-8 h-8 flex items-center justify-center text-[18px] hover:bg-blue-50 rounded-lg transition-colors hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DropdownPanel>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* 서식 초기화 */}
        <button
          onMouseDown={(e) => { e.preventDefault(); resetFormat(); }}
          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all text-slate-400"
          title="서식 초기화 (색상·크기 제거)"
        >
          <Eraser size={16} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex gap-2 items-center">
        <button
          onClick={onReset}
          className="px-3 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5"
          title="초기화"
        >
          <RotateCcw size={13} />
          Reset
        </button>
        <button
          onClick={onExport}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 text-xs"
        >
          <Download size={14} />
          리포트 완성
        </button>
      </div>
    </nav>
  );
};

export default Toolbar;
