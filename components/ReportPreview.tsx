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
  isModal?: boolean;
  editPath?: string;
  onSelect?: (path: string) => void;
  placeholder?: string;
}> = ({
  value,
  onSave,
  tag: Tag = "div",
  className = "",
  isModal = false,
  editPath,
  onSelect,
  placeholder,
}) => {
  const ref = useRef<HTMLElement>(null);
  const savedValue = useRef(value);
  const isEmpty = !value || value.trim() === "";
  const [localEmpty, setLocalEmpty] = useState(isEmpty);

  useEffect(() => {
    setLocalEmpty(!value || value.trim() === "");
  }, [value]);

  const handleFocus = useCallback(() => {
    if (editPath && onSelect) onSelect(editPath);
    savedValue.current = value;
    // 기존 텍스트가 있으면 전체 선택 → 바로 타이핑으로 교체 가능
    if (!isEmpty && ref.current) {
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
    // 빈 상태(placeholder)일 때는 아무 것도 안 함 — 커서만 자연스럽게 표시
  }, [editPath, onSelect, value, isEmpty]);

  const handleBlur = useCallback(() => {
    const newVal = ref.current?.innerText || "";
    setLocalEmpty(!newVal.trim());
    if (newVal !== savedValue.current) {
      onSave(newVal);
    }
  }, [onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  const handleInput = useCallback(() => {
    const text = ref.current?.innerText?.trim() || "";
    setLocalEmpty(!text);
  }, []);

  const TagEl = Tag as any;

  // 모달(미리보기) 모드
  if (isModal) {
    return (
      <TagEl className={className}>
        {isEmpty && placeholder ? placeholder : value}
      </TagEl>
    );
  }

  const showPlaceholder = localEmpty && placeholder;

  return (
    <div style={{ position: "relative" }} className={className}>
      <TagEl
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="outline-none transition-all duration-150 whitespace-pre-wrap hover:ring-1 hover:ring-blue-200/60 focus:ring-2 focus:ring-blue-400/40 cursor-text"
        style={{ minHeight: "1.2em", minWidth: "2em" }}
      >
        {value}
      </TagEl>
      {showPlaceholder && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#cbd5e1",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            userSelect: "none",
          }}
        >
          {placeholder}
        </span>
      )}
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
  size?: "sm" | "lg";
  vertical?: boolean;
}> = ({
  value,
  onSave,
  isModal = false,
  placeholder = "",
  chipClassName,
  size = "sm",
  vertical = false,
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
  const chipStyle = chipClassName || defaultChipClass;

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
            className={`inline-flex items-center ${isLg ? "px-3.5 py-1.5 rounded-full text-[13px]" : "px-2 py-0.5 rounded-md text-[10px]"} font-bold border whitespace-nowrap ${chipStyle}`}
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
          className={`outline-none bg-transparent ${isLg ? "text-[13px]" : "text-[10px]"} font-bold min-w-[60px] flex-1 py-0.5 text-slate-700 placeholder:text-slate-300 caret-slate-500`}
          style={{ caretColor: "#64748b" }}
        />
      </div>
    );
  }

  // 칩을 처음부터 칩 형태로 표시 & contentEditable로 인라인 편집
  const renderChip = (chip: string, i: number) => (
    <span
      key={i}
      className={`group/chip relative inline-flex items-center cursor-text ${isLg ? "px-3.5 py-1.5 rounded-full text-[13px]" : "px-2 py-0.5 rounded-md text-[11px] leading-[18px]"} font-bold border whitespace-nowrap ${chipStyle} hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-300 focus-within:shadow-sm`}
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
        className={`absolute ${isLg ? "-top-1.5 -right-1.5 w-4 h-4 text-[9px]" : "-top-1 -right-1 w-3.5 h-3.5 text-[8px]"} rounded-full bg-slate-400 hover:bg-red-500 text-white flex items-center justify-center leading-none no-print opacity-0 group-hover/chip:opacity-100 transition-opacity shadow-sm`}
      >
        ×
      </button>
    </span>
  );

  const addBtn = (
    <button
      onClick={addChipDirect}
      className={`${isLg ? "w-7 h-7 text-[14px]" : "w-[18px] h-[18px] text-[11px]"} shrink-0 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-500 font-bold flex items-center justify-center transition-colors no-print border border-slate-200/80`}
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
      className={`flex flex-wrap ${isLg ? "gap-3" : "gap-1.5"} items-center ${isLg ? "min-h-[32px]" : "min-h-[22px]"}`}
    >
      {chips.map((chip, i) => renderChip(chip, i))}
      {addBtn}
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
      className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase ${onClick ? "cursor-pointer hover:opacity-80 active:scale-95 transition-all" : ""} ${
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 text-[11px] font-black text-white rounded-lg ${typeBadge} uppercase tracking-tight shadow-sm`}
            >
              {isPreMarket ? "MORNING REPORT" : "CLOSING REPORT"}
            </span>
          </div>
          <EditableText
            value={data.title}
            {...ep("title")}
            tag="h1"
            className={`text-[28px] font-[900] tracking-tighter leading-tight ${pageText}`}
          />
          <EditableText
            value={data.date}
            {...ep("date")}
            className={`text-[13px] font-semibold ${labelText} tracking-tight`}
            placeholder="2026년 2월 11일 (화) 15:40 발행"
          />
        </div>
        <span
          className={`text-[36px] font-[900] uppercase leading-none shrink-0 ml-6 self-center text-transparent bg-clip-text`}
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
                    className={`text-[13px] font-extrabold ${labelText} uppercase leading-none tracking-tight w-[56px] shrink-0 -translate-y-[1px]`}
                  >
                    {item.label}
                  </span>
                  <div className="flex-1 flex items-center justify-center">
                    <EditableText
                      value={item.value}
                      onSave={(v) => updateArr("summaryItems", idx, "value", v)}
                      isModal={isModalView}
                      className={`text-[22px] font-[900] leading-none tracking-tight text-center ${trendColor}`}
                    />
                  </div>
                  <span
                    className={`text-[14px] font-bold leading-none shrink-0 whitespace-nowrap ${trendColor}`}
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
                    className={`text-[10px] font-extrabold ${labelText} uppercase leading-none tracking-tight`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-[15px] font-[900] leading-none tracking-tight ${
                      item.trend === "up"
                        ? "text-[#f04452]"
                        : item.trend === "down"
                          ? "text-[#3182f6]"
                          : pageText
                    }`}
                  >
                    {item.value}
                  </span>
                  {item.subText &&
                    item.subText !== "" &&
                    item.subText !== "-" && (
                      <span
                        className={`text-[10px] font-bold leading-none ${
                          item.trend === "up"
                            ? "text-[#f04452]"
                            : item.trend === "down"
                              ? "text-[#3182f6]"
                              : labelText
                        }`}
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
      <div className="shrink-0 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
        <div className={`grid grid-cols-${itemCount} gap-2`}>
          {data.summaryItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white px-2 py-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center"
            >
              <span className="text-[11px] font-extrabold text-slate-400 uppercase block mb-2 leading-none tracking-tight">
                {item.label}
              </span>
              <EditableText
                value={item.value}
                onSave={(v) => updateArr("summaryItems", idx, "value", v)}
                isModal={isModalView}
                className={`text-[18px] font-[900] leading-none tracking-tight ${
                  item.trend === "up"
                    ? "text-[#f04452]"
                    : item.trend === "down"
                      ? "text-[#3182f6]"
                      : "text-slate-900"
                }`}
              />
              <span
                className={`text-[11px] font-bold leading-none mt-2 flex items-center gap-0.5 ${
                  item.trend === "up"
                    ? "text-[#f04452]"
                    : item.trend === "down"
                      ? "text-[#3182f6]"
                      : "text-slate-400"
                }`}
              >
                {item.trend === "up" && "▲ "}
                {item.trend === "down" && "▼ "}
                {item.subText}
              </span>
            </div>
          ))}
        </div>
        {/* 보조 지표: 원유/금/BTC 소형 가로 배치 */}
        {data.subIndicators && data.subIndicators.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {data.subIndicators.map((item, idx) => (
              <div
                key={`sub-${idx}`}
                className="flex-1 bg-white px-3 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-2 min-w-0 whitespace-nowrap overflow-hidden"
              >
                <span className="text-[12px] font-extrabold text-slate-400 uppercase leading-none tracking-tight shrink-0">
                  {item.label}
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[16px] font-[800] leading-none tracking-tight ${
                      item.trend === "up"
                        ? "text-[#f04452]"
                        : item.trend === "down"
                          ? "text-[#3182f6]"
                          : "text-slate-700"
                    }`}
                  >
                    {item.value}
                  </span>
                  <span
                    className={`text-[12px] font-bold leading-none ${
                      item.trend === "up"
                        ? "text-[#f04452]"
                        : item.trend === "down"
                          ? "text-[#3182f6]"
                          : "text-slate-400"
                    }`}
                  >
                    {item.trend === "up" && "▲"}
                    {item.trend === "down" && "▼"}
                    {item.subText}
                  </span>
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
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap"
          >
            {chip}
          </span>
        ))}
      </div>
    );
  };

  // ===========================
  // TODAY'S HOT THEME – 키워드-종목 묶음 방식
  // ===========================
  const renderFeaturedStocks = () => {
    // 종목 추가 헬퍼
    const addStockToGroup = (groupIdx: number) => {
      const newStocks = data.featuredStocks.map((g, i) =>
        i === groupIdx
          ? { ...g, stocks: [...g.stocks, { name: "", price: "", change: "" }] }
          : g,
      );
      onChange({ ...data, featuredStocks: newStocks });
    };
    // 종목 삭제 헬퍼
    const removeStockFromGroup = (groupIdx: number, stockIdx: number) => {
      const newStocks = data.featuredStocks.map((g, i) =>
        i === groupIdx
          ? { ...g, stocks: g.stocks.filter((_, si) => si !== stockIdx) }
          : g,
      );
      onChange({ ...data, featuredStocks: newStocks });
    };
    // 그룹 내 종목 필드 업데이트 헬퍼
    const updateStockField = (
      groupIdx: number,
      stockIdx: number,
      field: "name" | "price" | "change",
      value: string,
    ) => {
      const newStocks = data.featuredStocks.map((g, gi) =>
        gi === groupIdx
          ? {
              ...g,
              stocks: g.stocks.map((s, si) =>
                si === stockIdx ? { ...s, [field]: value } : s,
              ),
            }
          : g,
      );
      onChange({ ...data, featuredStocks: newStocks });
    };

    return (
      <div
        className={`shrink-0 overflow-hidden rounded-2xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/60"} shadow-sm ${cardBg}`}
      >
        <div
          className={`${isDark ? "bg-[#16161e]" : "bg-slate-50/50"} px-5 py-3 border-b ${cardBorder}`}
        >
          <EditableText
            value={data.featuredStocksTitle}
            {...ep("featuredStocksTitle")}
            tag="h2"
            className={`text-[13px] font-black ${isDark ? "text-slate-300" : "text-slate-800"} uppercase tracking-tight`}
          />
        </div>
        <div className="p-3 grid grid-cols-2 gap-3">
          {data.featuredStocks.map((group, gIdx) => (
            <div
              key={group.id || gIdx}
              data-arr="featuredStocks"
              className={`rounded-xl border ${isDark ? "border-[#2a2a3a] bg-[#16161e]/50" : "border-slate-100 bg-slate-50/40"} overflow-hidden group/theme relative`}
            >
              {/* 그룹 삭제 */}
              {!isModalView && data.featuredStocks.length > MIN_ITEMS && (
                <button
                  onClick={() => removeItem("featuredStocks", gIdx)}
                  className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold opacity-0 group-hover/theme:opacity-100 transition-opacity no-print flex items-center justify-center shadow-sm hover:bg-red-600 z-10"
                >
                  ×
                </button>
              )}

              {/* 카테고리 키워드 헤더 */}
              <div
                className={`px-4 py-2 border-b ${isDark ? "border-[#2a2a3a] bg-[#1a1a24]" : "border-slate-100 bg-slate-100/60"} flex items-center gap-2`}
              >
                <div
                  className={`w-1.5 h-4 rounded-full ${isDark ? "bg-amber-400" : "bg-blue-500"} shrink-0`}
                />
                <EditableText
                  value={group.keyword}
                  onSave={(v) =>
                    updateArr("featuredStocks", gIdx, "keyword", v)
                  }
                  isModal={isModalView}
                  className={`text-[15px] font-black ${isDark ? "text-amber-300" : "text-blue-700"} uppercase tracking-tight flex-1`}
                  placeholder="EX. 반도체 장비"
                />
              </div>

              {/* 종목 리스트 */}
              <div className="px-3 py-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={`${isDark ? "text-slate-500" : "text-slate-400"} text-[11px] font-bold uppercase tracking-wider`}
                    >
                      <th className="py-1 pl-1" style={{ width: "42%" }}>
                        종목명
                      </th>
                      <th
                        className="py-1 text-right pr-3"
                        style={{ width: "30%" }}
                      >
                        {isPreMarket ? "전일 종가" : "종가"}
                      </th>
                      <th
                        className="py-1 text-right pr-1"
                        style={{ width: "28%" }}
                      >
                        등락률
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${isDark ? "divide-[#1a1a24]/50" : "divide-slate-50"}`}
                  >
                    {group.stocks.map((stock, sIdx) => {
                      const rateVal = stock.change.replace(/[%\s]/g, "");
                      const rateColor =
                        rateVal.includes("-") || rateVal.includes("▼")
                          ? "text-[#3182f6]"
                          : rateVal.includes("+") ||
                              rateVal.includes("▲") ||
                              parseFloat(rateVal) > 0
                            ? "text-[#f04452]"
                            : pageText;

                      return (
                        <tr
                          key={sIdx}
                          className={`${isDark ? "hover:bg-[#22222e]" : "hover:bg-white"} transition-colors group/stock relative`}
                        >
                          <td className="py-1.5 pl-1 align-middle">
                            {!isModalView && group.stocks.length > 1 && (
                              <button
                                onClick={() =>
                                  removeStockFromGroup(gIdx, sIdx)
                                }
                                className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-400 text-white text-[8px] font-bold opacity-0 group-hover/stock:opacity-100 transition-opacity no-print flex items-center justify-center z-10"
                              >
                                ×
                              </button>
                            )}
                            <EditableText
                              value={stock.name}
                              onSave={(v) =>
                                updateStockField(gIdx, sIdx, "name", v)
                              }
                              isModal={isModalView}
                              className={`text-[14px] font-bold ${pageText}`}
                              placeholder="EX. 삼성전자"
                            />
                          </td>
                          <td className="py-1.5 text-right pr-3 align-middle">
                            <EditableText
                              value={stock.price}
                              onSave={(v) =>
                                updateStockField(gIdx, sIdx, "price", v)
                              }
                              isModal={isModalView}
                              className={`text-[14px] font-bold ${rateColor} text-right`}
                              placeholder="0"
                            />
                          </td>
                          <td className="py-1.5 text-right pr-1 align-middle">
                            <EditableText
                              value={stock.change}
                              onSave={(v) =>
                                updateStockField(gIdx, sIdx, "change", v)
                              }
                              isModal={isModalView}
                              className={`text-[14px] font-[900] ${rateColor} text-right`}
                              placeholder="0%"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* 종목 추가 버튼 */}
                {!isModalView && (
                  <button
                    onClick={() => addStockToGroup(gIdx)}
                    className={`w-full py-1 mt-1 flex items-center justify-center gap-1 text-[9px] font-bold ${isDark ? "text-slate-600 hover:text-amber-400" : "text-slate-300 hover:text-blue-500"} rounded-lg border border-dashed ${isDark ? "border-[#2a2a3a]" : "border-slate-200"} transition-colors no-print`}
                  >
                    <span className="text-sm leading-none">+</span> 종목
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {!isModalView && data.featuredStocks.length < MAX_STOCKS && (
          <button
            onClick={() => addItem("featuredStocks")}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-b-2xl transition-colors no-print"
          >
            <span className="text-base leading-none">+</span> 테마 그룹 추가
          </button>
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
        {data.usSectors && data.usSectors.length > 0 && (
          <div className={`flex flex-col gap-2 rounded-xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/70"} p-3 ${isDark ? "bg-[#12121a]/50" : "bg-slate-50/30"}`}>
            <div className="flex items-center shrink-0">
              <EditableText
                value={data.usSectorsTitle || "전일 미증시 섹터 트렌드"}
                onSave={(v) => onChange({ ...data, usSectorsTitle: v })}
                isModal={isModalView}
                tag="h2"
                className={`text-[18px] font-black uppercase tracking-tighter ${pageText} flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 ${isDark ? "before:bg-amber-400" : "before:bg-blue-600"} before:rounded-full`}
              />
            </div>
            {/* 2열 균등 배분 레이아웃 */}
            <div className="flex gap-2 items-start">
              {[0, 1].map((col) => {
                // 인덱스 기반 균등 배분: 짝수→좌, 홀수→우
                const colSectors = (data.usSectors || []).filter((_, i) => i % 2 === col);
                return (
                  <div
                    key={col}
                    className="flex-1 flex flex-col gap-2 min-h-[40px]"
                  >
                    {colSectors.map((sector) => {
                      const realIdx = data.usSectors!.indexOf(sector);
                      const cardBorder = isDark ? "border-slate-600/40 bg-slate-800/20" : "border-slate-200/80 bg-white/60";
                      const dotColor =
                        sector.sentiment === "강세" ? "bg-red-500"
                          : sector.sentiment === "약세" ? "bg-blue-500"
                            : "bg-slate-400";
                      const chipColor = isDark
                        ? "bg-slate-700/40 text-slate-200 border-slate-500/30"
                        : "bg-slate-100 text-slate-700 border-slate-300/80";
                      return (
                        <div
                          key={sector.id || realIdx}
                          className={`rounded-xl border ${cardBorder} p-2.5 flex flex-col gap-1.5 relative group/sector`}
                        >
                          {/* 섹터 삭제 버튼 */}
                          {!isModalView && data.usSectors!.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = (data.usSectors || []).filter((_, i) => i !== realIdx);
                                onChange({ ...data, usSectors: updated });
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold opacity-0 group-hover/sector:opacity-100 transition-opacity no-print flex items-center justify-center z-10"
                            >
                              ×
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                            <EditableText
                              value={sector.name}
                              onSave={(v) => {
                                const updated = [...(data.usSectors || [])];
                                updated[realIdx] = { ...updated[realIdx], name: v };
                                onChange({ ...data, usSectors: updated });
                              }}
                              isModal={isModalView}
                              className={`text-[15px] font-[800] ${isDark ? "text-slate-200" : "text-slate-800"} leading-tight`}
                              placeholder="섹터명"
                            />
                            <button
                              onClick={() => {
                                const cycle = ["강세", "중립", "약세"];
                                const next = cycle[(cycle.indexOf(sector.sentiment) + 1) % 3];
                                const updated = [...(data.usSectors || [])];
                                updated[realIdx] = { ...updated[realIdx], sentiment: next };
                                onChange({ ...data, usSectors: updated });
                              }}
                              className={`ml-auto text-[11px] font-bold rounded px-1.5 py-0.5 cursor-pointer transition-colors shrink-0 ${
                                sector.sentiment === "강세"
                                  ? "bg-red-100 text-red-700"
                                  : sector.sentiment === "약세"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {sector.sentiment}
                            </button>
                          </div>
                          <EditableText
                            value={sector.issue}
                            onSave={(v) => {
                              const updated = [...(data.usSectors || [])];
                              updated[realIdx] = { ...updated[realIdx], issue: v };
                              onChange({ ...data, usSectors: updated });
                            }}
                            isModal={isModalView}
                            className={`text-[14px] font-semibold ${isDark ? "text-slate-200" : "text-slate-700"} leading-snug`}
                            placeholder="이슈 요약"
                          />
                          <ChipInput
                            value={sector.stocks}
                            onSave={(v) => {
                              const updated = [...(data.usSectors || [])];
                              updated[realIdx] = { ...updated[realIdx], stocks: v };
                              onChange({ ...data, usSectors: updated });
                            }}
                            isModal={isModalView}
                            placeholder="종목 입력 후 Enter"
                            chipClassName={chipColor}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {/* 섹터 추가 버튼 */}
            {!isModalView && data.usSectors.length < 10 && (
              <button
                onClick={() => {
                  const newSector = {
                    id: crypto.randomUUID(),
                    name: "",
                    sentiment: "중립",
                    issue: "",
                    stocks: "",
                    perspective: "",
                  };
                  onChange({ ...data, usSectors: [...(data.usSectors || []), newSector] });
                }}
                className={`w-full py-1.5 flex items-center justify-center gap-1 text-[12px] font-bold ${isDark ? "text-slate-600 hover:text-amber-400" : "text-slate-400 hover:text-blue-500"} rounded-lg border border-dashed ${isDark ? "border-[#2a2a3a]" : "border-slate-200"} transition-colors no-print`}
              >
                <span className="text-base leading-none">+</span> 섹터 추가 ({data.usSectors.length}/10)
              </button>
            )}
          </div>
        )}
        {/* 미증시 마감 분석 (아래) */}
        <div className="flex items-center shrink-0 mt-1">
          <EditableText
            value={data.usMarketAnalysisTitle}
            {...ep("usMarketAnalysisTitle")}
            tag="h2"
            className={`text-[18px] font-black uppercase tracking-tighter ${pageText} flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 ${isDark ? "before:bg-amber-400" : "before:bg-blue-600"} before:rounded-full`}
          />
        </div>
        <div className={`${sectionBg} rounded-xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/60"} p-4 shadow-sm`}>
          <EditableText
            value={data.usMarketAnalysis}
            {...ep("usMarketAnalysis")}
            className={`text-[16px] font-medium ${pageText} leading-[1.9] whitespace-pre-wrap`}
            placeholder={"EX.\n• 나스닥 +1.2% 상승, AI 반도체 섹터 강세\n• 엔비디아 실적 발표 앞두고 매수세 유입\n• 국채 금리 하락에 기술주 전반 상승"}
          />
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
            className={`text-[18px] font-black uppercase tracking-tighter ${pageText} flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 ${isDark ? "before:bg-amber-400" : "before:bg-red-500"} before:rounded-full`}
        />
      </div>
      <div className={`${sectionBg} rounded-xl border ${isDark ? "border-[#2a2a3a]" : "border-slate-200/60"} p-4 shadow-sm`}>
        <EditableText
          value={data.domesticAnalysis}
          {...ep("domesticAnalysis")}
          className={`text-[16px] font-medium ${pageText} leading-[1.9] whitespace-pre-wrap`}
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
            className={`absolute top-0 left-0 w-full h-[4px] ${isDark ? "bg-amber-400" : themeColor} rounded-t-lg`}
          />
          <div className="px-[14mm] pt-[5mm] pb-[8mm] flex flex-col gap-2.5">
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
            className={`absolute top-0 left-0 w-full h-[4px] ${isDark ? "bg-amber-400" : themeColor} rounded-t-lg`}
          />
          <div className="px-[14mm] pt-[8mm] pb-[8mm] flex flex-col gap-2.5">
            {/* 2페이지 연속 헤더 */}
            <div
              className={`shrink-0 pb-3 border-b-2 ${isDark ? "border-white/5" : "border-slate-900/10"} flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-black text-white rounded-md ${typeBadge} uppercase tracking-tight shadow-sm`}
                >
                  {data.reportType}
                </span>
                <span
                  className={`text-[18px] font-[900] tracking-tighter ${pageText}`}
                >
                  {data.title}
                </span>
              </div>
              <span
                className={`text-[24px] font-[900] tracking-[-0.05em] ${pageText} uppercase shrink-0`}
                style={{ fontStretch: "condensed" }}
              >
                RISING
              </span>
            </div>
            {renderDomesticAnalysis()}
            {renderFeaturedStocks()}
            {/* 오늘의 시장전략 */}
            <div
              className={`shrink-0 mt-1 rounded-2xl border ${
                isDark
                  ? "border-amber-400/20 bg-gradient-to-r from-[#1c162a] to-[#221a30]"
                  : isPreMarket
                    ? "border-slate-800/20 bg-gradient-to-r from-slate-800 to-slate-700"
                    : "border-[#2a2035]/30 bg-gradient-to-r from-[#1c162a] to-[#221a30]"
              } p-5 shadow-md`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[20px] leading-none">🎯</span>
                <span
                  className={`text-[17px] font-black ${isDark ? "text-amber-400" : isPreMarket ? "text-sky-300" : "text-amber-400"} uppercase tracking-widest`}
                >
                  {isPreMarket ? "금일 시장전략" : "내일 시장전략"}
                </span>
              </div>
              <EditableText
                value={data.todayStrategy}
                {...ep("todayStrategy")}
                className="text-[18px] font-bold text-white/90 leading-[2.0] text-justify"
                placeholder="EX. 오늘의 시장전략을 적어주세요"
              />
              {/* 마무리 한마디 */}
              <div className={`mt-4 pt-3 border-t border-white/10`}>
                <div className="flex items-start gap-2">
                  <span className="text-[14px] leading-none mt-[2px]">💬</span>
                  <EditableText
                    value={data.dailyComment}
                    {...ep("dailyComment")}
                    className="text-[15px] font-bold text-white/60 leading-[1.6] italic"
                    placeholder="EX. 오늘의 한마디를 적어주세요"
                  />
                </div>
              </div>
              {/* 공략주 칩 */}
              <div
                className={`mt-3 pt-3 border-t border-white/10 flex items-center gap-3 shrink-0 flex-wrap`}
              >
                <EditableText
                  value={
                    isPreMarket
                      ? data.featuredStockLabel || "금일 공략주"
                      : data.featuredStockLabel || "내일 관심주"
                  }
                  onSave={(v) => onChange({ ...data, featuredStockLabel: v })}
                  isModal={isModalView}
                  className={`shrink-0 uppercase tracking-widest text-[15px] font-[900] bg-white/10 text-amber-300 px-3.5 py-1.5 rounded-full`}
                />
                <div className="flex-1">
                  <ChipInput
                    value={data.expertInterestedStocks}
                    onSave={(v) => onChange({ ...data, expertInterestedStocks: v })}
                    isModal={isModalView}
                    placeholder="EX. 종목명 입력 후 Enter"
                    chipClassName="bg-white/10 text-white/80 border-white/20"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
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
