import React, { useRef, useCallback, useState, useEffect } from "react";
import { ReportData } from "../types";
import {
  createEmptyStock,
  createEmptySector,
  createEmptySchedule,
  MAX_STOCKS,
  MAX_SECTORS,
  MAX_SCHEDULE,
  MIN_ITEMS,
} from "../constants";

interface Props {
  data: ReportData;
  onChange: (newData: ReportData) => void;
  isModalView?: boolean;
  onElementSelect?: (path: string) => void;
  darkMode?: boolean;
}

// ===========================
// 인라인 편집 가능 텍스트 컴포넌트
// placeholder: 클릭해도 사라지지 않고, 실제 입력 시에만 사라짐 (input placeholder 동작)
// 기존 텍스트: 클릭 시 전체 선택 → 바로 타이핑으로 교체 가능
// ===========================
const EditableText: React.FC<{
  value: string;
  onSave: (val: string) => void;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  isModal?: boolean;
  editPath?: string;
  onSelect?: (path: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({
  value,
  onSave,
  tag: Tag = "div",
  className = "",
  style,
  isModal = false,
  editPath,
  onSelect,
  placeholder,
  multiline = false,
}) => {
  const ref = useRef<HTMLElement>(null);
  const savedValue = useRef(value);
  const stripHtml = (s: string) => s?.replace(/<[^>]*>/g, '').trim() || '';
  const isEmpty = !value || stripHtml(value) === "";
  const [localEmpty, setLocalEmpty] = useState(isEmpty);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalEmpty(!value || stripHtml(value) === "");
  }, [value]);

  const handleFocus = useCallback(() => {
    if (editPath && onSelect) onSelect(editPath);
    // 현재 innerHTML을 기준값으로 저장
    savedValue.current = ref.current?.innerHTML || value;
    setIsFocused(true);
    // multiline이면 전체선택 안 함 (줄바꾸면 가능하게)
    if (!multiline && !isEmpty && ref.current) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && ref.current) {
          const range = document.createRange();
          range.selectNodeContents(ref.current);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    }
  }, [editPath, onSelect, value, isEmpty, multiline]);

  const handleBlur = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // innerHTML로 저장하여 <b>, <strong> 등 서식 태그 보존
    const html = el.innerHTML || "";
    // 순수 텍스트가 비어있는지 확인
    const text = el.innerText?.trim() || "";
    setLocalEmpty(!text);
    setIsFocused(false);
    if (html !== savedValue.current) {
      onSave(html);
    }
  }, [onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    // multiline: Enter = 줄바꾸 (기본 동작), Esc = 저장/닫기
    // 일반: Enter = 완성(blur), Shift+Enter = 줄바꾸
    if (!multiline && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, [multiline]);

  const handleInput = useCallback(() => {
    const text = ref.current?.innerText?.trim() || "";
    setLocalEmpty(!text);
  }, []);

  const TagEl = Tag as any;

  // 모달(미리보기) 모드
  if (isModal) {
    if (isEmpty && placeholder) {
      return <TagEl className={className} style={style}>{placeholder}</TagEl>;
    }
    return <TagEl className={className} style={style} dangerouslySetInnerHTML={{ __html: value || "" }} />;
  }

  const showPlaceholder = localEmpty && placeholder && !(multiline && isFocused);

  // dangerouslySetInnerHTML 대신 useEffect로 값 동기화 (첫 타자 씹힘 방지)
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (ref.current && value !== lastExternalValue.current) {
      // 포커스 중이면 외부 변경을 반영하지 않음 (편집 중 덮어쓰기 방지)
      if (document.activeElement !== ref.current) {
        ref.current.innerHTML = value || "";
      }
      lastExternalValue.current = value;
    }
  }, [value]);

  // 최초 마운트 시 초기값 세팅
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", ...style }} className={className}>
      <TagEl
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className={`outline-none transition-all duration-150 whitespace-pre-wrap hover:ring-1 hover:ring-blue-200/60 focus:ring-2 focus:ring-blue-400/40 cursor-text ${multiline && isFocused ? "pb-8" : ""}`}
        style={{ minHeight: "1.2em", minWidth: "2em", ...style }}
      />
      {showPlaceholder && (
        <span
          style={{
            position: "absolute",
            top: multiline ? 0 : "50%",
            left: 0,
            right: 0,
            transform: multiline ? "none" : "translateY(-50%)",
            pointerEvents: "none",
            color: "#cbd5e1",
            whiteSpace: multiline ? "pre-wrap" : "nowrap",
            overflow: "hidden",
            textOverflow: multiline ? undefined : "ellipsis",
            userSelect: "none",
          }}
        >
          {placeholder}
        </span>
      )}
      {multiline && isFocused && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            ref.current?.blur();
          }}
          className="absolute bottom-1 right-1 px-2.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded shadow-md transition-colors z-50 no-print"
        >
          ✓ 확인
        </button>
      )}
    </div>
  );
};

// ===========================
// 인라인 컬러피커 (hover 시 🎨 버튼)
// ===========================
const ColorPicker: React.FC<{
  value?: string;
  defaultColor: string;
  onSave: (color: string) => void;
  label?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}> = ({ value, defaultColor, onSave, label, position = "top-right" }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const currentColor = value || defaultColor;

  const posClass = {
    "top-right": "-top-1 -right-1",
    "top-left": "-top-1 -left-1",
    "bottom-right": "-bottom-1 -right-1",
    "bottom-left": "-bottom-1 -left-1",
  }[position];

  return (
    <div className={`absolute ${posClass} z-50 no-print opacity-0 group-hover/colorable:opacity-100 transition-opacity`}>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-[12px] hover:scale-110 transition-transform cursor-pointer"
        title={label || "색상 변경"}
      >
        🎨
      </button>
      <input
        ref={inputRef}
        type="color"
        value={currentColor}
        onChange={(e) => onSave(e.target.value)}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
};

// ===========================
// 자동 폰트 축소 래퍼 (종목명 등 긴 텍스트 한 줄 맞춤)
// ===========================
const AutoFitText: React.FC<{
  text: string;
  baseFontSize: number;
  minFontSize?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, baseFontSize, minFontSize = 9, className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl || !text) return;
    let size = baseFontSize;
    textEl.style.fontSize = `${size}px`;
    // 부모 td 너비 기준으로 축소
    while (textEl.scrollWidth > container.clientWidth && size > minFontSize) {
      size -= 0.5;
      textEl.style.fontSize = `${size}px`;
    }
  }, [text, baseFontSize, minFontSize]);

  return (
    <div ref={containerRef} className={className} style={{ ...style, overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
      <span ref={textRef} style={{ fontSize: `${baseFontSize}px`, fontWeight: 'inherit', color: 'inherit' }}>{text}</span>
    </div>
  );
};

// ===========================
// 칩 입력 컴포넌트 (칩 끝에 + 버튼)
// ===========================
const ChipInput: React.FC<{
  value: string;
  onSave: (val: string) => void;
  isModal?: boolean;
  placeholder?: string;
  chipClassName?: string;
  chipStyle?: React.CSSProperties;
  size?: "sm" | "lg";
  vertical?: boolean;
  noWrap?: boolean;
}> = ({
  value,
  onSave,
  isModal = false,
  placeholder = "",
  chipClassName,
  chipStyle,
  size = "sm",
  vertical = false,
  noWrap = false,
}) => {
  const [inputVal, setInputVal] = useState("");
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chips = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const defaultChipClass = "bg-slate-100 text-slate-700 border-slate-200/80";
  const chipClass = chipClassName || defaultChipClass;

  const isLg = size === "lg";

  const removeChip = (idx: number) => {
    const newChips = chips.filter((_, i) => i !== idx);
    onSave(newChips.join(", "));
  };

  // 빈 상태 input에서 Enter/blur 시 칩 추가
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed) {
        // 기존 칩에 추가
        const existing = value
          ? value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        existing.push(trimmed);
        onSave(existing.join(", "));
        setInputVal("");
      }
    }
    if (e.key === "Escape") {
      setInputVal("");
    }
  };

  const handleInputBlur = () => {
    const trimmed = inputVal.trim();
    if (trimmed) {
      const existing = value
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      existing.push(trimmed);
      onSave(existing.join(", "));
      setInputVal("");
    }
  };

  // + 버튼: 바로 칩 형태로 추가 + 포커스
  const addChipDirect = () => {
    const newChips = [...chips, "종목명"];
    onSave(newChips.join(", "));
    setTimeout(() => {
      const el = chipRefs.current[newChips.length - 1];
      if (el) el.focus();
    }, 80);
  };

  // contentEditable 칩 편집 완료 (blur/Enter)
  const finishChipEdit = (idx: number) => {
    const el = chipRefs.current[idx];
    if (!el) return;
    const newText = el.innerText.trim();
    if (!newText) {
      removeChip(idx);
    } else if (newText !== chips[idx]) {
      const newChips = [...chips];
      newChips[idx] = newText;
      onSave(newChips.join(", "));
    }
  };

  const handleChipKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    idx: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLSpanElement).blur();
    }
    if (e.key === "Escape") {
      const el = chipRefs.current[idx];
      if (el) el.innerText = chips[idx];
      el?.blur();
    }
  };

  if (isModal) {
    return (
      <div className={`flex flex-wrap ${isLg ? "gap-2" : "gap-1"}`}>
        {chips.map((chip, i) => (
          <span
            key={i}
            className={`inline-flex items-center ${isLg ? "px-3.5 py-1.5 rounded-full text-[13px]" : "px-2.5 py-1 rounded-md text-[14px]"} font-bold border whitespace-nowrap ${chipClass}`}
            style={chipStyle}
          >
            {chip}
          </span>
        ))}
      </div>
    );
  }

  // 빈 상태: placeholder + input 바로 보이기
  if (chips.length === 0) {
    return (
      <div
        className={`flex items-center ${isLg ? "min-h-[32px]" : "min-h-[24px]"}`}
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`outline-none bg-transparent ${isLg ? "text-[16px]" : "text-[16px]"} font-bold min-w-[60px] flex-1 py-0.5 text-inherit placeholder:text-inherit/30 caret-current`}
          style={{ caretColor: "currentColor" }}
        />
      </div>
    );
  }

  // 칩을 처음부터 칩 형태로 표시 & contentEditable로 인라인 편집
  const renderChip = (chip: string, i: number) => (
    <span
      key={i}
      className={`group/chip relative inline-flex items-center cursor-text ${isLg ? "px-3.5 py-1.5 rounded-full text-[16px]" : "px-2 py-0.5 rounded-md text-[16px] leading-[18px]"} font-bold border whitespace-nowrap ${chipClass} hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-300 focus-within:shadow-sm`}
      style={chipStyle}
    >
      <span
        ref={(el) => {
          chipRefs.current[i] = el;
        }}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => finishChipEdit(i)}
        onKeyDown={(e) => handleChipKeyDown(e, i)}
        onFocus={(e) => {
          // 포커스 시 전체 선택 (원상복구)
          setTimeout(() => {
            const sel = window.getSelection();
            if (sel && e.target) {
              const range = document.createRange();
              range.selectNodeContents(e.target as Node);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }, 0);
        }}
        className="outline-none min-w-[1ch]"
      >
        {chip}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeChip(i);
        }}
        className={`absolute ${isLg ? "-top-1.5 -right-2.5 w-4 h-4 text-[9px]" : "-top-1 -right-2.5 w-3.5 h-3.5 text-[8px]"} rounded-full bg-slate-400 hover:bg-red-500 text-white flex items-center justify-center leading-none no-print opacity-0 group-hover/chip:opacity-100 transition-opacity shadow-sm z-50`}
      >
        ×
      </button>
    </span>
  );

  const addBtn = (
    <button
      onClick={addChipDirect}
      className={`${isLg ? "w-7 h-7 text-[15px]" : "w-[18px] h-[18px] text-[15px]"} shrink-0 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-500 font-bold flex items-center justify-center transition-colors no-print border border-slate-200/80`}
    >
      +
    </button>
  );

  if (vertical && chips.length > 0) {
    return (
      <div className="flex flex-col gap-1 items-start">
        {chips.slice(0, -1).map((chip, i) => renderChip(chip, i))}
        <div className="flex items-center gap-1.5">
          {renderChip(chips[chips.length - 1], chips.length - 1)}
          {addBtn}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${noWrap ? '' : 'flex-wrap'} ${isLg ? "gap-3" : "gap-1.5"} items-center ${isLg ? "min-h-[32px]" : "min-h-[22px]"}`}
    >
      {chips.length > 0 ? (
        <>
          {chips.slice(0, -1).map((chip, i) => renderChip(chip, i))}
          <span className={`inline-flex items-center whitespace-nowrap ${isLg ? "gap-3" : "gap-1.5"}`}>
            {renderChip(chips[chips.length - 1], chips.length - 1)}
            {addBtn}
          </span>
        </>
      ) : (
        addBtn
      )}
    </div>
  );
};

// ===========================
// 감성 배지
// ===========================
const SENTIMENTS_PRE = ["긍정", "중립", "부정"];
const SENTIMENTS_CLOSE = ["강세", "보합", "약세"];
const SentimentBadge = ({
  sentiment,
  onClick,
}: {
  sentiment: string;
  onClick?: () => void;
}) => {
  const isPos = sentiment.includes("긍정") || sentiment.includes("강세");
  const isNeg = sentiment.includes("부정") || sentiment.includes("약세");
  return (
    <span
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded text-[15px] font-black tracking-tighter uppercase ${onClick ? "cursor-pointer hover:opacity-80 active:scale-95 transition-all" : ""} ${
        isPos
          ? "bg-[#f04452] text-white"
          : isNeg
            ? "bg-[#3182f6] text-white"
            : "bg-[#6b7684] text-white"
      }`}
    >
      {sentiment}
    </span>
  );
};

// ===========================
// 메인 리포트 미리보기 컴포넌트
// 단일 연속 플로우 + 297mm 페이지 경계 표시
// ===========================
const ReportPreview: React.FC<Props> = ({
  data,
  onChange,
  isModalView = false,
  onElementSelect,
  darkMode = false,
}) => {
  const isPreMarket = data.reportType === "장전";
  const isDark = !isPreMarket && darkMode;



  // 마감 다크모드 vs 화이트모드 vs 장전 테마 색상
  const themeColor = isPreMarket
    ? "bg-[#0f172a]"
    : isDark
      ? "bg-amber-400"
      : "bg-[#191f28]";
  const accentColor = isPreMarket
    ? "text-sky-500"
    : isDark
      ? "text-amber-400"
      : "text-amber-600";
  const accentBg = isPreMarket
    ? "bg-sky-500"
    : isDark
      ? "bg-amber-500"
      : "bg-amber-500";
  const typeBadge = isPreMarket ? "bg-[#0ea5e9]" : "bg-amber-500";

  // 다크모드 전용 색상
  const pageBg = isDark ? "bg-[#0f0f14]" : "bg-white";
  const pageText = isDark ? "text-slate-100" : "text-slate-900";
  const cardBg = isDark ? "bg-[#1a1a24]" : "bg-white";
  const cardBorder = isDark ? "border-[#2a2a3a]" : "border-slate-100";
  const subText = isDark ? "text-slate-400" : "text-slate-600";
  const labelText = isDark ? "text-slate-500" : "text-slate-400";
  const sectionBg = isDark ? "bg-[#12121a]" : "bg-slate-50";
  const dividerColor = isDark ? "border-white/5" : "border-slate-900/10";

  const update = useCallback(
    (path: string, val: string) => {
      const newData = JSON.parse(JSON.stringify(data));
      const keys = path.split(".");
      let curr: any = newData;
      for (let i = 0; i < keys.length - 1; i++) curr = curr[keys[i]];
      curr[keys[keys.length - 1]] = val;
      onChange(newData);
    },
    [data, onChange],
  );

  const updateArr = useCallback(
    (arrKey: string, idx: number, field: string, val: string) => {
      const items = [...(data as any)[arrKey]];
      items[idx] = { ...items[idx], [field]: val };
      onChange({ ...data, [arrKey]: items });
    },
    [data, onChange],
  );

  const addItem = useCallback(
    (arrKey: "featuredStocks" | "sectors" | "marketSchedule") => {
      const creators = {
        featuredStocks: createEmptyStock,
        sectors: createEmptySector,
        marketSchedule: createEmptySchedule,
      };
      const items = [...(data as any)[arrKey], creators[arrKey]()];
      onChange({ ...data, [arrKey]: items });
      // 새 행 추가 후 자동 스크롤
      setTimeout(() => {
        const rows = document.querySelectorAll(`[data-arr="${arrKey}"]`);
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
          lastRow.scrollIntoView({ behavior: "smooth", block: "center" });
          // 첫 번째 편집 가능한 요소에 포커스
          const firstEditable = lastRow.querySelector(
            "[contenteditable]",
          ) as HTMLElement;
          if (firstEditable) firstEditable.focus();
        }
      }, 100);
    },
    [data, onChange],
  );

  const removeItem = useCallback(
    (arrKey: string, idx: number) => {
      const items = [...(data as any)[arrKey]];
      if (items.length <= MIN_ITEMS) return;
      items.splice(idx, 1);
      onChange({ ...data, [arrKey]: items });
    },
    [data, onChange],
  );

  const cycleSentiment = useCallback(
    (idx: number) => {
      const SENTIMENTS = isPreMarket ? SENTIMENTS_PRE : SENTIMENTS_CLOSE;
      const current = data.sectors[idx].sentiment;
      let nextIdx = SENTIMENTS.indexOf(current);
      nextIdx = nextIdx === -1 ? 0 : (nextIdx + 1) % SENTIMENTS.length;
      updateArr("sectors", idx, "sentiment", SENTIMENTS[nextIdx]);
    },
    [data.sectors, updateArr, isPreMarket],
  );

  const ep = (path: string) => ({
    isModal: isModalView,
    editPath: path,
    onSelect: onElementSelect,
    onSave: (v: string) => update(path, v),
  });

  // ===========================
  // 헤더
  // ===========================
  const renderHeader = () => (
    <div className={`shrink-0 pb-3 border-b-2 ${dividerColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <span
              className={`px-3.5 py-1.5 text-[13px] font-black text-white rounded-lg ${typeBadge} uppercase tracking-tight shadow-sm`}
              style={data.headerBadgeColor ? { backgroundColor: data.headerBadgeColor } : undefined}
            >
              {isPreMarket ? "MORNING REPORT" : "CLOSING REPORT"}
            </span>
          </div>
          <EditableText
            value={data.title}
            {...ep("title")}
            tag="h1"
            className={`text-[35px] font-[900] tracking-tighter leading-tight ${pageText}`}
          />
          <EditableText
            value={data.date}
            {...ep("date")}
            className={`text-[15px] font-semibold ${labelText} tracking-tight`}
            placeholder="2026년 2월 11일 (화) 15:40 발행"
          />
        </div>
        <span
          className={`text-[42px] font-[900] uppercase leading-none shrink-0 ml-6 self-center text-transparent bg-clip-text`}
          style={{
            fontStretch: "condensed",
            letterSpacing: "0.06em",
            backgroundImage: isDark
              ? "linear-gradient(180deg, #f0f0f0 0%, #a8b0ba 40%, #6b7280 70%, #9ca3af 100%)"
              : "linear-gradient(180deg, #2d3436 0%, #4a5568 35%, #1a202c 65%, #3d4f5f 100%)",
            filter: "drop-shadow(0 1px 0px rgba(255,255,255,0.15))",
            WebkitTextStroke: isDark
              ? "0.3px rgba(255,255,255,0.1)"
              : "0.3px rgba(0,0,0,0.05)",
          }}
        >
          RISING
        </span>
      </div>
    </div>
  );

  // ===========================
  // 지표 (5개 지수 박스)
  // ===========================
  const renderIndicators = () => {
    const itemCount = data.summaryItems.length;
    // 마감 리포트: 7개 항목 → 상단 2행(코스피/코스닥), 하단 5열(외인/기관/환율)
    if (!isPreMarket && itemCount >= 7) {
      const topItems = data.summaryItems.slice(0, 2); // KOSPI, KOSDAQ
      const bottomItems = data.summaryItems.slice(2); // 외인/기관 x4 + USD/KRW
      return (
        <div
          className={`shrink-0 ${sectionBg} p-2.5 rounded-2xl border ${cardBorder}`}
          style={data.indicatorBoxColor ? { backgroundColor: data.indicatorBoxColor } : undefined}
        >
          {/* 상단: 코스피/코스닥 대형 박스 */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {topItems.map((item, idx) => {
              const arrow =
                item.trend === "up" ? "▲" : item.trend === "down" ? "▼" : "";
              const subRaw = item.subText || "";
              const subParts = subRaw.trim().split(/\s+/);
              const changeAmt = subParts.length >= 2 ? subParts[0] : "";
              const changePct =
                subParts.length >= 2 ? subParts.slice(1).join(" ") : subRaw;
              const trendColor =
                item.trend === "up"
                  ? "text-[#f04452]"
                  : item.trend === "down"
                    ? "text-[#3182f6]"
                    : pageText;
              return (
                <div
                  key={idx}
                  className={`${cardBg} px-4 py-3.5 rounded-xl border ${cardBorder} shadow-sm flex items-center gap-3`}
                >
                  <span
                    className={`${labelText} uppercase leading-none tracking-tight w-[56px] shrink-0 -translate-y-[1px]`}
                    style={{ fontSize: `${data.indicatorLabelSize ?? 13}px`, fontWeight: data.indicatorLabelWeight ?? '800', color: data.indicatorLabelColor || undefined }}
                  >
                    {item.label}
                  </span>
                  <div className="flex-1 flex items-center justify-center">
                    <EditableText
                      value={item.value}
                      onSave={(v) => updateArr("summaryItems", idx, "value", v)}
                      isModal={isModalView}
                      className={`leading-none tracking-tight text-center ${pageText}`}
                      style={{ fontSize: `${data.indicatorValueSize ?? 22}px`, fontWeight: data.indicatorValueWeight ?? '900', color: data.indicatorValueColor || undefined }}
                    />
                  </div>
                  <span
                    className={`leading-none shrink-0 whitespace-nowrap ${trendColor}`}
                    style={{ fontSize: `${data.indicatorChangeSize ?? 14}px`, fontWeight: data.indicatorChangeWeight ?? '700' }}
                  >
                    {arrow && <span className="mr-0.5">{arrow}</span>}
                    {changeAmt}
                    {changePct && <span className="ml-2">{changePct}</span>}
                  </span>
                </div>
              );
            })}
          </div>
          {/* 하단: 외인/기관/환율 소형 박스 */}
          <div className="grid grid-cols-5 gap-2">
            {bottomItems.map((item, bIdx) => {
              const idx = bIdx + 2;
              return (
                <div
                  key={idx}
                  className={`${cardBg} px-2 py-2.5 rounded-xl border ${cardBorder} shadow-sm flex flex-col items-center justify-center text-center gap-1`}
                >
                  <span
                    className={`${labelText} uppercase leading-none tracking-tight`}
                    style={{ fontSize: `${data.indicatorLabelSize ?? 10}px`, fontWeight: data.indicatorLabelWeight ?? '800', color: data.indicatorLabelColor || undefined }}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`leading-none tracking-tight ${pageText}`}
                    style={{ fontSize: `${data.indicatorValueSize ?? 15}px`, fontWeight: data.indicatorValueWeight ?? '900', color: data.indicatorValueColor || undefined }}
                  >
                    {item.value}
                  </span>
                  {item.subText &&
                    item.subText !== "" &&
                    item.subText !== "-" && (
                      <span
                        className={`leading-none ${
                          item.trend === "up"
                            ? "text-[#f04452]"
                            : item.trend === "down"
                              ? "text-[#3182f6]"
                              : labelText
                        }`}
                        style={{ fontSize: `${data.indicatorChangeSize ?? 10}px`, fontWeight: data.indicatorChangeWeight ?? '700' }}
                      >
                        {item.subText}
                      </span>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 장전 리포트: 기존 5열 그리드 + 보조 지표 행
    return (
      <div className="shrink-0 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100" style={data.indicatorBoxColor ? { backgroundColor: data.indicatorBoxColor } : undefined}>
        <div className={`grid grid-cols-${itemCount} gap-2`}>
          {data.summaryItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white px-2 py-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center"
            >
              <EditableText
                value={item.label}
                onSave={(v) => updateArr("summaryItems", idx, "label", v)}
                isModal={isModalView}
                className="text-slate-400 uppercase block mb-2 leading-none tracking-tight"
                style={{ fontSize: `${data.indicatorLabelSize ?? 16}px`, fontWeight: data.indicatorLabelWeight ?? '800', color: data.indicatorLabelColor || undefined }}
              />
              <EditableText
                value={item.value}
                onSave={(v) => updateArr("summaryItems", idx, "value", v)}
                isModal={isModalView}
                className="leading-none tracking-tight text-slate-900"
                style={{ fontSize: `${data.indicatorValueSize ?? 18}px`, fontWeight: data.indicatorValueWeight ?? '900', color: data.indicatorValueColor || undefined }}
              />
              <div className={`flex items-center justify-center gap-0.5 mt-2 ${
                  item.trend === "up"
                    ? "text-[#f04452]"
                    : item.trend === "down"
                      ? "text-[#3182f6]"
                      : "text-slate-400"
                }`} style={{ fontSize: `${data.indicatorChangeSize ?? 16}px`, fontWeight: data.indicatorChangeWeight ?? '700' }}>
                {item.trend === "up" && <span className="mr-0.5">▲</span>}
                {item.trend === "down" && <span className="mr-0.5">▼</span>}
                <EditableText
                  value={item.subText || ""}
                  onSave={(v) => updateArr("summaryItems", idx, "subText", v)}
                  isModal={isModalView}
                  className="leading-none"
                  style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
                  placeholder="등락"
                />
              </div>
            </div>
          ))}
        </div>
        {/* 보조 지표: 원유/금/BTC 소형 가로 배치 */}
        {data.subIndicators && data.subIndicators.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {data.subIndicators.map((item, idx) => (
              <div
                key={`sub-${idx}`}
                className="flex-1 bg-white px-3 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 min-w-0 overflow-visible"
              >
                <EditableText
                  value={item.label}
                  onSave={(v) => updateArr("subIndicators", idx, "label", v)}
                  isModal={isModalView}
                  className="text-[15px] font-extrabold text-slate-400 uppercase leading-none tracking-tight shrink-0"
                />
                <div className="flex items-baseline gap-1.5 shrink-0">
                  <EditableText
                    value={item.value}
                    onSave={(v) => updateArr("subIndicators", idx, "value", v)}
                    isModal={isModalView}
                    className={`text-[16px] font-[800] leading-none tracking-tight ${
                      "text-slate-700"
                    }`}
                  />
                  <EditableText
                    value={item.subText || ""}
                    onSave={(v) => updateArr("subIndicators", idx, "subText", v)}
                    isModal={isModalView}
                    className={`text-[14px] font-bold leading-none ${
                      item.trend === "up"
                        ? "text-[#f04452]"
                        : item.trend === "down"
                          ? "text-[#3182f6]"
                          : "text-slate-400"
                    }`}
                    placeholder="등락"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  // ===========================
  // 관련주 칩 렌더링 헬퍼
  // ===========================
  const renderStockChips = (text: string) => {
    const chips = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (chips.length === 0)
      return <span className="text-slate-300 text-[11px]">―</span>;
    return (
      <div className="flex flex-nowrap gap-1">
        {chips.map((chip, i) => {
          // 긴 텍스트 자동 축소: 6자 이상이면 축소
          const fontSize = chip.length >= 8 ? 12 : chip.length >= 6 ? 14 : 16;
          return (
            <span
              key={i}
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {chip}
            </span>
          );
        })}
      </div>
    );
  };

  // ===========================
  // TODAY'S HOT THEME – 키워드-종목 묶음 방식
  // ===========================
  const renderFeaturedStocks = () => {
    // 2페이지 "오늘의 핵심 테마" — 내부는 usSectors 기반 섹터 카드
    return (
      <div
        className={`shrink-0 rounded-2xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/60"} shadow-sm ${cardBg} relative group/addwrap overflow-visible`}
      >
        <div
          className={`${isDark ? "bg-[#16161e]" : "bg-slate-200/70"} px-5 py-2.5 border-b ${cardBorder} rounded-t-2xl`}
          style={data.themeHeaderColor ? { backgroundColor: data.themeHeaderColor } : undefined}
        >
          <EditableText
            value={data.featuredStocksTitle}
            {...ep("featuredStocksTitle")}
            tag="h2"
            className={`text-[18px] font-black ${isDark ? "text-slate-300" : "text-slate-800"} uppercase tracking-tight`}
          />
        </div>
        <div className="px-2 pt-1.5 pb-2">
          {data.usSectors && data.usSectors.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5 items-stretch">
              {(data.usSectors || []).map((sector, sIdx) => {
                      const realIdx = sIdx;
                      const cardBorder2 = isDark ? "border-slate-600/40 bg-slate-800/20" : "border-slate-200 bg-white shadow-sm";
                      const dotColor =
                        sector.sentiment === "긍정" ? "bg-red-500"
                          : sector.sentiment === "부정" ? "bg-blue-500"
                            : "bg-slate-400";
                      const chipColor2 = isDark
                        ? "bg-slate-700/40 text-slate-200 border-slate-500/30"
                        : "bg-slate-100 text-slate-700 border-slate-300/80";
                      return (
                        <div
                          key={sector.id || realIdx}
                          className={`rounded-lg border ${cardBorder2} flex flex-col relative group/sector overflow-visible`}
                        >
                          {!isModalView && data.usSectors!.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = (data.usSectors || []).filter((_, i) => i !== realIdx);
                                onChange({ ...data, usSectors: updated });
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold opacity-0 group-hover/sector:opacity-100 transition-opacity no-print flex items-center justify-center z-50"
                            >
                              ×
                            </button>
                          )}
                          <div className={`flex items-center gap-2 px-2.5 py-2 border-b ${isDark ? "border-[#2a2a3a] bg-[#1a1a24]" : "border-slate-100 bg-slate-100/60"} rounded-t-lg shrink-0`} style={data.themeCardHeaderColor ? { backgroundColor: data.themeCardHeaderColor } : undefined}>
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                            <EditableText
                              value={sector.name}
                              onSave={(v) => {
                                const updated = [...(data.usSectors || [])];
                                updated[realIdx] = { ...updated[realIdx], name: v };
                                onChange({ ...data, usSectors: updated });
                              }}
                              isModal={isModalView}
                              className={`${isDark ? "text-slate-200" : "text-slate-800"} leading-tight`}
                              style={{ fontSize: `${data.themeNameSize ?? 17}px`, fontWeight: data.themeNameWeight ?? '800' }}
                              placeholder="섹터명"
                            />
                            <button
                              onClick={() => {
                                const cycle = ["긍정", "부정", "중립"];
                                const next = cycle[(cycle.indexOf(sector.sentiment) + 1) % cycle.length];
                                const updated = [...(data.usSectors || [])];
                                updated[realIdx] = { ...updated[realIdx], sentiment: next };
                                onChange({ ...data, usSectors: updated });
                              }}
                              className={`ml-auto text-[15px] font-bold rounded px-1.5 py-0.5 cursor-pointer transition-colors shrink-0 ${
                                sector.sentiment === "긍정"
                                  ? "bg-red-100 text-red-700"
                                  : sector.sentiment === "부정"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {sector.sentiment}
                            </button>
                          </div>
                          <div className="px-2.5 pt-1.5 pb-1.5 flex flex-col gap-2.5 flex-grow">
                          <EditableText
                            value={sector.issue}
                            onSave={(v) => {
                              const updated = [...(data.usSectors || [])];
                              updated[realIdx] = { ...updated[realIdx], issue: v };
                              onChange({ ...data, usSectors: updated });
                            }}
                            isModal={isModalView}
                            multiline
                            className={`${isDark ? "text-slate-200" : "text-slate-700"} leading-snug`}
                            style={{ fontSize: `${data.themeIssueSize ?? 16}px`, fontWeight: data.themeIssueWeight ?? '800' }}
                            placeholder="이슈 요약"
                          />
                          <div className="mt-auto">
                          <ChipInput
                            value={sector.stocks}
                            onSave={(v) => {
                              const updated = [...(data.usSectors || [])];
                              updated[realIdx] = { ...updated[realIdx], stocks: v };
                              onChange({ ...data, usSectors: updated });
                            }}
                            isModal={isModalView}
                            placeholder="EX. 관련 종목 입력 후 Enter"
                            chipClassName={data.themeChipColor ? "text-white border-white/30" : chipColor2}
                            size="sm"
                            chipStyle={data.themeChipColor ? { backgroundColor: data.themeChipColor } : undefined}
                          />
                          </div>
                          </div>
                        </div>
                      );
                    })}
              {/* 홀수일 때 빈칸에 회색 + 버튼 */}
              {!isModalView && (data.usSectors || []).length % 2 === 1 && (data.usSectors || []).length < 10 && (
                <button
                  onClick={() => {
                    const newSector = {
                      id: crypto.randomUUID(),
                      name: "",
                      sentiment: "중립",
                      issue: "",
                      stocks: "",
                      perspective: "",
                      column: (data.usSectors || []).length % 2,
                    };
                    onChange({ ...data, usSectors: [...(data.usSectors || []), newSector] });
                  }}
                  className={`rounded-lg border-2 border-dashed ${isDark ? "border-[#2a2a3a] hover:border-[#3a3a4a] hover:bg-[#1a1a2a]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"} flex items-center justify-center transition-all no-print min-h-[60px]`}
                >
                  <span className={`text-[20px] font-bold ${isDark ? "text-slate-500" : "text-slate-300"}`}>+</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
        {/* 섹션 하단 중앙 + 버튼: 짝수(2,4,6,8)일 때만 — absolute로 공간 차지 안함 */}
        {!isModalView && (data.usSectors || []).length > 0 && (data.usSectors || []).length % 2 === 0 && (data.usSectors || []).length < 10 && (
          <div className="flex justify-center no-print" style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, zIndex: 10 }}>
            <button
              onClick={() => {
                const newSector = {
                  id: crypto.randomUUID(),
                  name: "",
                  sentiment: "중립",
                  issue: "",
                  stocks: "",
                  perspective: "",
                  column: (data.usSectors || []).length % 2,
                };
                onChange({ ...data, usSectors: [...(data.usSectors || []), newSector] });
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-bold ${isDark ? "bg-[#23233a] text-slate-400 hover:bg-purple-500/40 hover:text-purple-300 border border-[#2a2a3a]" : "bg-white text-slate-400 hover:bg-purple-100 hover:text-purple-500 border border-slate-200 shadow-sm"} transition-colors`}
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  // ===========================
  // 전일 미증시 섹터 트렌드 + 마감 분석 (1페이지)
  // ===========================
  const renderUsMarketAnalysis = () => {
    return (
      <div className="flex flex-col gap-2 shrink-0">
        {/* 1페이지 섹터 트렌드 — 내부는 featuredStocks 기반 테이블 */}
        <div className={`flex flex-col rounded-xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/70"} ${isDark ? "bg-[#12121a]/50" : "bg-slate-50/30"} relative group/addwrap2 overflow-visible`}>
          <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#2a2a3a] bg-[#16161e]" : "border-slate-200/50 bg-slate-200/70"} rounded-t-xl`} style={data.sectorTrendHeaderColor ? { backgroundColor: data.sectorTrendHeaderColor } : undefined}>
            <EditableText
              value={data.usSectorsTitle || "전일 미증시 섹터 트렌드"}
              onSave={(v) => onChange({ ...data, usSectorsTitle: v })}
              isModal={isModalView}
              tag="h2"
              className={`text-[18px] font-black uppercase tracking-tighter ${pageText}`}
            />
          </div>
          <div className="px-2 pt-1.5 pb-2 grid grid-cols-2 gap-1.5">
            {data.featuredStocks.map((group, gIdx) => (
              <div
                key={group.id || gIdx}
                data-arr="featuredStocks"
                className={`rounded-lg border ${isDark ? "border-[#2a2a3a] bg-[#16161e]/50" : "border-slate-200 bg-white shadow-sm"} overflow-visible group/theme relative`}
              >
                {/* 그룹 삭제 */}
                {!isModalView && data.featuredStocks.length > MIN_ITEMS && (
                  <button
                    onClick={() => removeItem("featuredStocks", gIdx)}
                    className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold opacity-0 group-hover/theme:opacity-100 transition-opacity no-print flex items-center justify-center shadow-sm hover:bg-red-600 z-50"
                  >
                    ×
                  </button>
                )}
                {/* 카테고리 키워드 헤더 */}
                <div
                  className={`px-4 py-2 border-b ${isDark ? "border-[#2a2a3a] bg-[#1a1a24]" : "border-slate-100 bg-slate-100/60"} flex items-center gap-2`}
                  style={data.sectorTrendSubHeaderColor ? { backgroundColor: data.sectorTrendSubHeaderColor } : undefined}
                >
                  <EditableText
                    value={group.keyword}
                    onSave={(v) => updateArr("featuredStocks", gIdx, "keyword", v)}
                    isModal={isModalView}
                    className={`${isDark ? "text-amber-300" : "text-slate-900"} uppercase tracking-tight flex-1`}
                    style={{ fontSize: `${data.sectorTrendNameSize ?? 17}px`, fontWeight: data.sectorTrendNameWeight ?? '800' }}
                    placeholder="EX. 반도체 장비"
                  />
                  {!isModalView && (
                    <button
                      onClick={() => {
                        const sentiments = ["강세", "보합", "약세"];
                        const current = (group as any).sentiment || "강세";
                        const next = sentiments[(sentiments.indexOf(current) + 1) % sentiments.length];
                        const newGroups = data.featuredStocks.map((g, i) =>
                          i === gIdx ? { ...g, sentiment: next } : g
                        );
                        onChange({ ...data, featuredStocks: newGroups });
                      }}
                      className={`ml-auto text-[15px] font-bold rounded px-1.5 py-0.5 cursor-pointer transition-colors shrink-0 ${
                        (group as any).sentiment === "약세"
                          ? "bg-blue-100 text-blue-700"
                          : (group as any).sentiment === "보합"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {(group as any).sentiment || "강세"}
                    </button>
                  )}
                  {isModalView && (
                    <span
                      className={`ml-auto text-[15px] font-bold rounded px-1.5 py-0.5 shrink-0 ${
                        (group as any).sentiment === "약세"
                          ? "bg-blue-100 text-blue-700"
                          : (group as any).sentiment === "보합"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {(group as any).sentiment || "강세"}
                    </span>
                  )}
                </div>
                {/* 종목 리스트 */}
                <div className="px-3 py-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`${isDark ? "text-slate-500" : "text-slate-400"} font-bold uppercase tracking-wider`} style={{ fontSize: data.sectorTrendTableTextSize ? `${data.sectorTrendTableTextSize}px` : '15px', ...(data.sectorTrendTableTextColor ? { color: data.sectorTrendTableTextColor } : {}) }}>
                        <th className="py-0.5 pl-1" style={{ width: "42%" }}>종목명</th>
                        <th className="py-0.5 text-right pr-3" style={{ width: "30%" }}>{isPreMarket ? "전일 종가" : "종가"}</th>
                        <th className="py-0.5 text-right pr-1" style={{ width: "28%" }}>등락률</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-[#1a1a24]/50" : "divide-slate-50"}`}>
                      {group.stocks.map((stock, sIdx) => {
                        const rateVal = stock.change.replace(/[%\s]/g, "");
                        const rateColor =
                          rateVal.includes("-") || rateVal.includes("▼")
                            ? "text-[#3182f6]"
                            : rateVal.includes("+") || rateVal.includes("▲") || parseFloat(rateVal) > 0
                              ? "text-[#f04452]"
                              : pageText;
                        return (
                          <tr key={sIdx} className={`${isDark ? "hover:bg-[#22222e]" : "hover:bg-white"} transition-colors group/stock relative`}>
                            <td className="py-0.5 pl-1 align-middle">
                              {isModalView ? (
                                <AutoFitText
                                  text={stock.name}
                                  baseFontSize={data.sectorTrendTableTextSize || 16}
                                  className={`font-bold ${pageText}`}
                                  style={data.sectorTrendTableTextColor ? { color: data.sectorTrendTableTextColor } : undefined}
                                />
                              ) : (
                                <EditableText
                                  value={stock.name}
                                  onSave={(v) => {
                                    const newStocks = data.featuredStocks.map((g, gi) =>
                                      gi === gIdx ? { ...g, stocks: g.stocks.map((s, si) => si === sIdx ? { ...s, name: v } : s) } : g
                                    );
                                    onChange({ ...data, featuredStocks: newStocks });
                                  }}
                                  isModal={false}
                                  className={`font-bold ${pageText}`}
                                  placeholder="EX. 삼성전자"
                                  style={{ fontSize: data.sectorTrendTableTextSize ? `${data.sectorTrendTableTextSize}px` : '16px', ...(data.sectorTrendTableTextColor ? { color: data.sectorTrendTableTextColor } : {}) }}
                                />
                              )}
                            </td>
                            <td className="py-0.5 text-right pr-3 align-middle">
                              <EditableText
                                value={stock.price}
                                onSave={(v) => {
                                  let formatted = v.trim();
                                  if (formatted && !formatted.includes('$')) {
                                    formatted = '$' + formatted;
                                  }
                                  const newStocks = data.featuredStocks.map((g, gi) =>
                                    gi === gIdx ? { ...g, stocks: g.stocks.map((s, si) => si === sIdx ? { ...s, price: formatted } : s) } : g
                                  );
                                  onChange({ ...data, featuredStocks: newStocks });
                                }}
                                isModal={isModalView}
                                className={`font-bold ${pageText} text-right`}
                                placeholder="0"
                                style={{ fontSize: data.sectorTrendTableTextSize ? `${data.sectorTrendTableTextSize}px` : '16px', ...(data.sectorTrendTableTextColor ? { color: data.sectorTrendTableTextColor } : {}) }}
                              />
                            </td>
                            <td className="py-0.5 text-right pr-1 align-middle">
                              <EditableText
                                value={stock.change}
                                onSave={(v) => {
                                  // 자동 '%' 추가: 값이 있고 '%'가 없으면 추가
                                  let formatted = v.trim();
                                  if (formatted && !formatted.includes('%')) {
                                    formatted = formatted + '%';
                                  }
                                  const newStocks = data.featuredStocks.map((g, gi) =>
                                    gi === gIdx ? { ...g, stocks: g.stocks.map((s, si) => si === sIdx ? { ...s, change: formatted } : s) } : g
                                  );
                                  onChange({ ...data, featuredStocks: newStocks });
                                }}
                                isModal={isModalView}
                                className={`font-[900] ${rateColor} text-right`}
                                style={{ fontSize: data.sectorTrendTableTextSize ? `${data.sectorTrendTableTextSize}px` : '16px' }}
                                placeholder="0%"
                              />
                            </td>
                            {/* 종목 삭제 X 버튼 - 등락률 오른쪽 */}
                            {!isModalView && group.stocks.length > 1 && (
                              <td className="w-0 p-0 align-middle">
                                <button
                                  onClick={() => {
                                    const newStocks = data.featuredStocks.map((g, i) =>
                                      i === gIdx ? { ...g, stocks: g.stocks.filter((_, si) => si !== sIdx) } : g
                                    );
                                    onChange({ ...data, featuredStocks: newStocks });
                                  }}
                                  className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-400 text-white text-[8px] font-bold opacity-0 group-hover/stock:opacity-100 transition-opacity no-print flex items-center justify-center z-10"
                                >
                                  ×
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* 종목 추가 버튼 - 카드 하단 중앙 */}
                {!isModalView && (
                  <button
                    onClick={() => {
                      const newStocks = data.featuredStocks.map((g, i) =>
                        i === gIdx ? { ...g, stocks: [...g.stocks, { name: "", price: "", change: "" }] } : g
                      );
                      onChange({ ...data, featuredStocks: newStocks });
                    }}
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-400 hover:bg-blue-500 text-white text-[12px] font-bold opacity-0 group-hover/theme:opacity-100 transition-opacity no-print flex items-center justify-center z-10 shadow-sm"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            {/* 홀수일 때 빈칸에 회색 + 버튼 */}
            {!isModalView && data.featuredStocks.length % 2 === 1 && data.featuredStocks.length < MAX_STOCKS && (
              <button
                onClick={() => addItem("featuredStocks")}
                className={`rounded-lg border-2 border-dashed ${isDark ? "border-[#2a2a3a] hover:border-[#3a3a4a] hover:bg-[#1a1a2a]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"} flex items-center justify-center transition-all no-print min-h-[60px]`}
              >
                <span className={`text-[20px] font-bold ${isDark ? "text-slate-500" : "text-slate-300"}`}>+</span>
              </button>
            )}
          </div>
          {/* 섹션 하단 중앙 + 버튼: 짝수(2,4,6,8)일 때 — 박스 하단선에 걸침 */}
          {!isModalView && data.featuredStocks.length > 0 && data.featuredStocks.length % 2 === 0 && data.featuredStocks.length < MAX_STOCKS && (
            <div className="flex justify-center no-print" style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, zIndex: 10 }}>
              <button
                onClick={() => addItem("featuredStocks")}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-bold ${isDark ? "bg-[#23233a] text-slate-400 hover:bg-purple-500/40 hover:text-purple-300 border border-[#2a2a3a]" : "bg-white text-slate-400 hover:bg-purple-100 hover:text-purple-500 border border-slate-200 shadow-sm"} transition-colors`}
              >
                +
              </button>
            </div>
          )}
        </div>
        {/* 미증시 마감 분석 (아래) — 타이틀+본문 한 박스 */}
        <div className={`rounded-xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/70"} ${isDark ? "bg-[#12121a]/50" : "bg-slate-50/30"} overflow-hidden mt-1`} style={data.usAnalysisBoxColor ? { backgroundColor: data.usAnalysisBoxColor } : undefined}>
          <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#2a2a3a] bg-[#16161e]" : "border-slate-200/50 bg-slate-200/70"} rounded-t-xl`} style={data.usAnalysisHeaderColor ? { backgroundColor: data.usAnalysisHeaderColor } : undefined}>
            <EditableText
              value={data.usMarketAnalysisTitle}
              {...ep("usMarketAnalysisTitle")}
              tag="h2"
              className={`text-[18px] font-black uppercase tracking-tighter ${pageText}`}
            />
          </div>
          <div className="p-4 cursor-text" style={{ minHeight: data.usMarketAnalysis?.trim() ? undefined : "120px" }} onClick={(e) => { const el = (e.currentTarget as HTMLElement).querySelector('[contenteditable]') as HTMLElement; if (el && e.target === e.currentTarget) el.focus(); }}>
            <EditableText
              value={data.usMarketAnalysis}
              {...ep("usMarketAnalysis")}
              multiline
              className={`text-[16px] font-bold ${pageText} leading-[1.9] whitespace-pre-wrap`}
              placeholder={"ex. 나스닥 +1.2% 상승, AI 반도체 섹터 강세\n엔비디아 실적 발표 앞두고 매수세 유입\n국채 금리 하락에 기술주 전반 상승"}
            />
          </div>
        </div>
      </div>
    );
  };

  // ===========================
  // 전일 국내증시 특징 (2페이지)
  // ===========================
  const renderDomesticAnalysis = () => (
    <div className="flex flex-col gap-2 shrink-0">
      <div className="flex items-center shrink-0">
        <EditableText
          value={data.domesticAnalysisTitle}
          {...ep("domesticAnalysisTitle")}
          tag="h2"
            className={`text-[18px] font-black uppercase tracking-tighter ${pageText}`}
          />
      </div>
      <div className={`${sectionBg} rounded-xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/60"} p-4 shadow-sm`}>
        <EditableText
          value={data.domesticAnalysis}
          {...ep("domesticAnalysis")}
          className={`text-[16px] font-semibold ${pageText} leading-[1.9] whitespace-pre-wrap`}
          placeholder={"EX.\n1. 코스피 5,300pt 복귀, 외인 기관 동반 매수\n2. 반도체 장비주 강세 — HPSP, 한미반도체\n3. 바이오 섹터 소폭 약세 전환\n4. 2차전지 관련주 수급 개선 조짐"}
        />
      </div>
    </div>
  );

  // ===========================
  // 렌더링: 단일 연속 문서 (Word 방식)
  // 콘텐츠가 자연스럽게 흐르고, 297mm 경계에 페이지 브레이크 표시
  // ===========================
  return (
    <div className="relative w-full flex flex-col items-center bg-[#f3f4f6] py-0">
      <div id="report-content" className="flex flex-col gap-6 w-[210mm]">
        {/* ========== 1페이지 ========== */}
        <div
          className={`${pageBg} w-[210mm] min-h-[297mm] shadow-2xl rounded-lg relative`}
        >
          {/* 상단 강조 바 */}
          <div
            className={`absolute top-0 left-0 w-full h-[4px] ${data.headerLineColor ? '' : isDark ? "bg-amber-400" : themeColor} rounded-t-lg`}
            style={data.headerLineColor ? { backgroundColor: data.headerLineColor } : undefined}
          />
          <div className="px-[14mm] pt-[5mm] pb-[8mm] flex flex-col gap-1.5">
            {renderHeader()}
            {renderIndicators()}
            {renderUsMarketAnalysis()}
          </div>
          {/* 페이지 번호 */}
          <div className="absolute bottom-[3mm] left-0 right-0 flex justify-center">
            <span
              className={`text-[7px] font-medium tracking-[0.2em] ${isDark ? "text-slate-600" : "text-slate-300"}`}
            >
              - 1 / 2 -
            </span>
          </div>
        </div>

        {/* ========== 2페이지 ========== */}
        <div
          className={`${pageBg} w-[210mm] min-h-[297mm] shadow-2xl rounded-lg relative`}
        >
          {/* 상단 강조 바 */}
          <div
            className={`absolute top-0 left-0 w-full h-[4px] ${data.headerLineColor ? '' : isDark ? "bg-amber-400" : themeColor} rounded-t-lg`}
            style={data.headerLineColor ? { backgroundColor: data.headerLineColor } : undefined}
          />
          <div className="px-[14mm] pt-[8mm] pb-[8mm] flex flex-col gap-1.5">
            {/* 2페이지 연속 헤더 */}
            <div
              className={`shrink-0 pb-3 border-b-2 ${isDark ? "border-white/5" : "border-slate-900/10"} flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-[12px] font-black text-white rounded-lg ${typeBadge} uppercase tracking-tight shadow-sm`}
                  style={data.headerBadgeColor ? { backgroundColor: data.headerBadgeColor } : undefined}
                >
                  {data.reportType}
                </span>
                <span
                  className={`text-[24px] font-[900] tracking-tighter ${pageText}`}
                >
                  {data.title}
                </span>
              </div>
              <span
                className={`text-[30px] font-[900] tracking-[-0.05em] ${pageText} uppercase shrink-0`}
                style={{ fontStretch: "condensed" }}
              >
                RISING
              </span>
            </div>
            {renderFeaturedStocks()}
            {/* 오늘의 시장전략 — 하늘색+남색 */}
            <div
              className={`shrink-0 mt-1 rounded-2xl border ${
                isDark
                  ? "border-amber-400/20 bg-gradient-to-r from-[#1c162a] to-[#221a30]"
                  : isPreMarket
                    ? "border-slate-800/20 bg-gradient-to-r from-slate-800 to-slate-700"
                    : "border-[#2a2035]/30 bg-gradient-to-r from-[#1c162a] to-[#221a30]"
              } p-5 shadow-md`}
              style={data.strategyBoxColor ? { background: data.strategyBoxColor, borderColor: data.strategyBoxColor } : undefined}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[20px] leading-none">🎯</span>
                <span
                  className={`text-[18px] font-black ${
                    isDark ? "text-amber-400" 
                    : isPreMarket ? "text-sky-300" 
                    : "text-amber-400"
                  } uppercase tracking-widest`}
                >
                  {isPreMarket ? "RISING STOCK 오늘의 핵심 주식 전략" : "RISING STOCK 핵심 내일 시장 전략"}
                </span>
              </div>
              {/* 타이틀과 내용 사이 구분선 */}
              <div className="border-t border-white/15 mb-3" />
              <EditableText
                value={data.todayStrategy}
                {...ep("todayStrategy")}
                multiline
                className="text-[18px] font-bold text-white/90 leading-[2.0] text-justify"
                placeholder="EX. 오늘의 시장전략을 적어주세요"
              />
              <div
                className={`mt-3 pt-3 border-t border-white/10 flex items-center gap-3`}
              >
                <EditableText
                  value={
                    isPreMarket
                      ? data.featuredStockLabel || "금일 공략주"
                      : data.featuredStockLabel || "내일 관심주"
                  }
                  onSave={(v) => onChange({ ...data, featuredStockLabel: v })}
                  isModal={isModalView}
                  className={`shrink-0 uppercase tracking-widest text-[15px] font-[900] bg-white/20 border border-white/20 ${
                    isDark ? "text-amber-300" 
                    : isPreMarket ? "text-sky-200" 
                    : "text-amber-300"
                  } px-3.5 py-1.5 rounded-full`}
                />
                <div className="flex-1 text-white">
                  <ChipInput
                    value={data.expertInterestedStocks}
                    onSave={(v) => onChange({ ...data, expertInterestedStocks: v })}
                    isModal={isModalView}
                    placeholder="종목명 입력 후 Enter"
                    chipClassName={data.stockChipColor ? `text-white border-white/40` : "bg-white/25 text-white border-white/40"}
                    size="lg"
                    chipStyle={data.stockChipColor ? { backgroundColor: data.stockChipColor } : undefined}
                    noWrap
                  />
                </div>
              </div>
            </div>
          </div>
          {/* 전략 하단 구분선 */}
          <div className={`mx-4 mt-3 border-t ${isDark ? "border-white/10" : "border-slate-200"}`} />
          {/* 하단 면책 */}
          <div
            className={`absolute bottom-0 left-0 right-0 px-[14mm] pb-[10mm] pt-2 border-t ${isDark ? "border-white/5" : "border-gray-100"} text-center opacity-40`}
          >
            <p
              className={`text-[7px] ${isDark ? "text-slate-500" : "text-gray-500"} font-bold tracking-tighter whitespace-nowrap`}
            >
              ◆ 본 리포트는 Rising 서비스의 주관적인 견해를 포함하며 투자 결과에
              대한 법적 책임은 투자자 본인에게 있습니다.
            </p>
            {/* 페이지 번호 - 면책 아래 */}
          </div>
          {/* 페이지 번호 - 면책 밖에 별도 배치 */}
          <div className="absolute bottom-[3mm] left-0 right-0 flex justify-center">
            <span
              className={`text-[7px] font-medium tracking-[0.2em] ${isDark ? "text-slate-600" : "text-slate-300"}`}
            >
              - 2 / 2 -
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
