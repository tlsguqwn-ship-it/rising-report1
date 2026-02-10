import React, { useState, useRef, useEffect, useCallback } from 'react';

// ===========================
// 추천 색상 팔레트 (템플릿 어울리는 10색)
// ===========================
const PRESET_COLORS = [
  { name: '네이비', color: '#0f172a' },
  { name: '스카이블루', color: '#0ea5e9' },
  { name: '오션블루', color: '#3182f6' },
  { name: '레드', color: '#ef4444' },
  { name: '오렌지', color: '#f97316' },
  { name: '그린', color: '#22c55e' },
  { name: '퍼플', color: '#8b5cf6' },
  { name: '슬레이트', color: '#64748b' },
  { name: '골드', color: '#eab308' },
  { name: '틸', color: '#14b8a6' },
];

// ===========================
// 텍스트 크기 프리셋
// ===========================
const SIZE_PRESETS = [
  { label: 'S', size: '1', desc: '더 작게' },
  { label: 'M', size: '2', desc: '기본' },
  { label: 'L', size: '4', desc: '크게' },
  { label: 'XL', size: '6', desc: '매우 크게' },
];

// ===========================
// 이모지 카테고리 & 데이터
// ===========================
const EMOJI_CATEGORIES = [
  {
    name: '자주 쓰는',
    icon: '⭐',
    emojis: ['🔥', '📈', '📉', '💰', '🚀', '⚡', '💎', '🎯', '⚠️', '✅', '❌', '💡', '📊', '🏦', '🌍', '🇺🇸', '🇰🇷', '🇨🇳', '🇯🇵', '🇪🇺']
  },
  {
    name: '표정',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😵', '🤯', '🥶', '🥵', '😱', '😨', '😰', '😥', '😢', '😭', '😤', '😡', '🤬', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
  },
  {
    name: '손동작',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💪']
  },
  {
    name: '기호',
    icon: '💲',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '💫', '⚡', '🔥', '💥', '❗', '❓', '‼️', '⁉️', '💯', '🔔', '🔕', '🎵', '🎶', '💬', '🗯️', '💭', '🏁', '🚩', '🎌', '✔️', '☑️', '✅', '❌', '❎', '➕', '➖', '➗', '✖️', '♻️', '©️', '®️', '™️']
  },
  {
    name: '사물',
    icon: '💼',
    emojis: ['💼', '📁', '📂', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🔗', '📐', '📏', '✂️', '🗂️', '📅', '📆', '🗓️', '📇', '📰', '🗞️', '📃', '📄', '📑', '🔖', '🏷️', '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '🏦', '🏢', '🏭', '🏗️']
  },
  {
    name: '국기',
    icon: '🏳️',
    emojis: ['🇰🇷', '🇺🇸', '🇨🇳', '🇯🇵', '🇩🇪', '🇬🇧', '🇫🇷', '🇮🇳', '🇧🇷', '🇷🇺', '🇦🇺', '🇨🇦', '🇮🇹', '🇪🇸', '🇲🇽', '🇸🇬', '🇭🇰', '🇹🇼', '🇻🇳', '🇹🇭', '🇮🇩', '🇵🇭', '🇲🇾', '🇸🇦', '🇦🇪', '🇨🇭', '🇳🇱', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇵🇱', '🇦🇹', '🇧🇪', '🇮🇪', '🇵🇹', '🇬🇷', '🇹🇷', '🇮🇱', '🇪🇺']
  },
];

// ===========================
// 플로팅 리치 텍스트 툴바
// ===========================
interface FloatingToolbarProps {
  targetRef: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
  onClose: () => void;
}

type TabType = 'color' | 'size' | 'emoji';

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ targetRef, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('color');
  const [emojiCategory, setEmojiCategory] = useState(0);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 위치 계산
  useEffect(() => {
    if (!isVisible || !targetRef.current || !toolbarRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    
    let top = rect.top - toolbarRect.height - 8;
    let left = rect.left + (rect.width / 2) - (toolbarRect.width / 2);
    
    // 화면 밖으로 나가지 않도록
    if (top < 8) top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + toolbarRect.width > window.innerWidth - 8) {
      left = window.innerWidth - toolbarRect.width - 8;
    }
    
    setPosition({ top, left });
  }, [isVisible, targetRef, activeTab, emojiCategory]);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isVisible) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        toolbarRef.current && !toolbarRef.current.contains(e.target as Node) &&
        targetRef.current && !targetRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // slight delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isVisible, onClose, targetRef]);

  const applyColor = useCallback((color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !targetRef.current) return;
    
    // 선택된 텍스트가 있으면 선택 영역에만 적용
    if (!selection.isCollapsed && targetRef.current.contains(selection.anchorNode)) {
      document.execCommand('foreColor', false, color);
    } else {
      // 선택 없으면 전체 요소에 적용
      targetRef.current.style.color = color;
    }
  }, [targetRef]);

  const applySize = useCallback((size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !targetRef.current) return;
    
    if (!selection.isCollapsed && targetRef.current.contains(selection.anchorNode)) {
      // 선택 영역에 크기 적용 (span wrap)
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      range.surroundContents(span);
      selection.removeAllRanges();
    } else {
      targetRef.current.style.fontSize = size;
    }
  }, [targetRef]);

  const insertEmoji = useCallback((emoji: string) => {
    if (!targetRef.current) return;
    targetRef.current.focus();
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      targetRef.current.textContent += emoji;
    }
    
    // 변경 이벤트 트리거
    targetRef.current.dispatchEvent(new Event('input', { bubbles: true }));
  }, [targetRef]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] no-print"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // prevent blur on target
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden animate-scale-in"
        style={{ minWidth: activeTab === 'emoji' ? '320px' : '240px' }}>
        {/* 탭 헤더 */}
        <div className="flex border-b border-slate-100 bg-slate-50/80">
          {([
            { key: 'color' as TabType, icon: '🎨', label: '색상' },
            { key: 'size' as TabType, icon: '📏', label: '크기' },
            { key: 'emoji' as TabType, icon: '😀', label: '이모지' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 bg-white border-b-2 border-blue-500 -mb-px'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-[13px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 색상 팔레트 */}
        {activeTab === 'color' && (
          <div className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => applyColor(c.color)}
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
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              />
              <button
                onClick={() => {
                  if (targetRef.current) targetRef.current.style.color = '';
                  document.execCommand('removeFormat', false);
                }}
                className="ml-auto text-[10px] font-bold text-slate-400 hover:text-red-500 px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* 텍스트 크기 */}
        {activeTab === 'size' && (
          <div className="p-3">
            <div className="flex gap-2">
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => applySize(s.size)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
                >
                  <span className="font-black text-slate-700" style={{ fontSize: s.size }}>{s.label}</span>
                  <div className="text-[8px] text-slate-400 mt-0.5">{s.size}</div>
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">크기 초기화</span>
              <button
                onClick={() => {
                  if (targetRef.current) targetRef.current.style.fontSize = '';
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* 이모지 피커 */}
        {activeTab === 'emoji' && (
          <div>
            {/* 카테고리 탭 */}
            <div className="flex border-b border-slate-100 px-1 overflow-x-auto">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  onClick={() => setEmojiCategory(idx)}
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
            {/* 이모지 그리드 */}
            <div className="p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              <div className="text-[9px] font-bold text-slate-400 mb-1 px-1">{EMOJI_CATEGORIES[emojiCategory].name}</div>
              <div className="grid grid-cols-8 gap-0.5">
                {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-[18px] hover:bg-blue-50 rounded-lg transition-colors hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
export { PRESET_COLORS, SIZE_PRESETS, EMOJI_CATEGORIES };
