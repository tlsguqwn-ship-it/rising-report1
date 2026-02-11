import React, { useRef, useCallback, useState } from 'react';
import { ReportData } from '../types';
import { createEmptyStock, createEmptySector, createEmptySchedule, MAX_STOCKS, MAX_SECTORS, MAX_SCHEDULE, MIN_ITEMS } from '../constants';

interface Props {
  data: ReportData;
  onChange: (newData: ReportData) => void;
  isModalView?: boolean;
  onElementSelect?: (path: string) => void;
  darkMode?: boolean;
}

// ===========================
// 인라인 편집 가능 텍스트 컴포넌트
// Enter → 줄바꿈, Escape → 편집 종료
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
}> = ({ value, onSave, tag: Tag = 'div', className = '', isModal = false, editPath, onSelect, placeholder }) => {
  const ref = useRef<HTMLElement>(null);
  const savedValue = useRef(value);
  const isEmpty = !value || value.trim() === '';

  const handleFocus = useCallback(() => {
    if (editPath && onSelect) onSelect(editPath);
    savedValue.current = ref.current?.innerText || value;
    // placeholder 표시 중이면 비우고 색상 복원
    if (isEmpty && ref.current && placeholder) {
      ref.current.innerText = '';
      ref.current.style.color = '';
      ref.current.style.whiteSpace = '';
      ref.current.style.overflow = '';
      ref.current.style.textOverflow = '';
    } else if (ref.current) {
      // 기존 텍스트가 있으면 전체 선택 → 바로 타이핑으로 교체 가능
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
  }, [editPath, onSelect, value, isEmpty, placeholder]);

  const handleBlur = useCallback(() => {
    const newVal = ref.current?.innerText || '';
    if (newVal !== savedValue.current) {
      onSave(newVal);
    }
  }, [onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  const TagEl = Tag as any;

  return (
    <TagEl
      ref={ref}
      contentEditable={!isModal}
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none transition-all duration-150 rounded-sm whitespace-pre-wrap ${
        !isModal
          ? 'hover:ring-1 hover:ring-blue-200/60 focus:ring-2 focus:ring-blue-400/40 focus:bg-blue-50/30 cursor-text'
          : ''
      } ${isEmpty && placeholder ? 'truncate overflow-hidden' : ''} ${className}`}
      style={isEmpty && placeholder ? { minHeight: '1.2em', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : undefined}
    >
      {isEmpty && placeholder ? placeholder : value}
    </TagEl>
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
  size?: 'sm' | 'lg';
  vertical?: boolean;
}> = ({ value, onSave, isModal = false, placeholder = '', chipClassName, size = 'sm', vertical = false }) => {
  const [inputVal, setInputVal] = useState('');
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chips = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const defaultChipClass = 'bg-slate-100 text-slate-700 border-slate-200/80';
  const chipStyle = chipClassName || defaultChipClass;

  const isLg = size === 'lg';

  const removeChip = (idx: number) => {
    const newChips = chips.filter((_, i) => i !== idx);
    onSave(newChips.join(', '));
  };

  // 빈 상태 input에서 Enter/blur 시 칩 추가
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed) { onSave(trimmed); setInputVal(''); }
    }
    if (e.key === 'Escape') { setInputVal(''); }
  };

  const handleInputBlur = () => {
    const trimmed = inputVal.trim();
    if (trimmed) { onSave(trimmed); setInputVal(''); }
  };

  // + 버튼: 바로 칩 형태로 추가 + 포커스
  const addChipDirect = () => {
    const newChips = [...chips, '종목명'];
    onSave(newChips.join(', '));
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
      onSave(newChips.join(', '));
    }
  };

  const handleChipKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLSpanElement).blur();
    }
    if (e.key === 'Escape') {
      const el = chipRefs.current[idx];
      if (el) el.innerText = chips[idx];
      el?.blur();
    }
  };

  if (isModal) {
    return (
      <div className={`flex flex-wrap ${isLg ? 'gap-2' : 'gap-1'}`}>
        {chips.map((chip, i) => (
          <span key={i} className={`inline-flex items-center ${isLg ? 'px-3 py-1.5 rounded-lg text-[13px]' : 'px-2 py-0.5 rounded-md text-[10px]'} font-bold border whitespace-nowrap ${chipStyle}`}>
            {chip}
          </span>
        ))}
      </div>
    );
  }

  // 빈 상태: placeholder + input 바로 보이기
  if (chips.length === 0) {
    return (
      <div className={`flex items-center ${isLg ? 'min-h-[32px]' : 'min-h-[24px]'}`}>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`outline-none bg-transparent ${isLg ? 'text-[13px]' : 'text-[10px]'} font-bold min-w-[60px] flex-1 py-0.5 text-slate-700 placeholder:text-slate-300`}
          style={{ color: '#cbd5e1' }}
        />
      </div>
    );
  }

  // 칩을 처음부터 칩 형태로 표시 & contentEditable로 인라인 편집
  const renderChip = (chip: string, i: number) => (
    <span key={i} className={`group/chip relative inline-flex items-center cursor-text ${isLg ? 'px-3 py-1.5 rounded-lg text-[13px]' : 'px-2 py-0.5 rounded-md text-[11px] leading-[18px]'} font-bold border whitespace-nowrap ${chipStyle} hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-300 focus-within:shadow-sm`}>
      <span
        ref={el => { chipRefs.current[i] = el; }}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => finishChipEdit(i)}
        onKeyDown={(e) => handleChipKeyDown(e, i)}
        onFocus={(e) => {
          // 포커스 시 전체 선택
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
      >{chip}</span>
      <button onClick={(e) => { e.stopPropagation(); removeChip(i); }} className={`absolute ${isLg ? '-top-1.5 -right-1.5 w-4 h-4 text-[9px]' : '-top-1 -right-1 w-3.5 h-3.5 text-[8px]'} rounded-full bg-slate-400 hover:bg-red-500 text-white flex items-center justify-center leading-none no-print opacity-0 group-hover/chip:opacity-100 transition-opacity shadow-sm`}>×</button>
    </span>
  );

  const addBtn = (
    <button onClick={addChipDirect} className={`${isLg ? 'w-7 h-7 text-[14px]' : 'w-[18px] h-[18px] text-[11px]'} shrink-0 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-500 font-bold flex items-center justify-center transition-colors no-print border border-slate-200/80`}>+</button>
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
    <div className={`flex flex-wrap ${isLg ? 'gap-3' : 'gap-1.5'} items-center ${isLg ? 'min-h-[32px]' : 'min-h-[22px]'}`}>
      {chips.map((chip, i) => renderChip(chip, i))}
      {addBtn}
    </div>
  );
};

// ===========================
// 감성 배지
// ===========================
const SENTIMENTS = ['긍정', '중립', '부정'];
const SentimentBadge = ({ sentiment, onClick }: { sentiment: string; onClick?: () => void }) => {
  const isPos = sentiment.includes('긍정');
  const isNeg = sentiment.includes('부정');
  return (
    <span onClick={onClick} className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''} ${
      isPos ? 'bg-[#f04452] text-white' :
      isNeg ? 'bg-[#3182f6] text-white' :
      'bg-[#6b7684] text-white'
    }`}>
      {sentiment}
    </span>
  );
};

// ===========================
// 메인 리포트 미리보기 컴포넌트
// 단일 연속 플로우 + 297mm 페이지 경계 표시
// ===========================
const ReportPreview: React.FC<Props> = ({ data, onChange, isModalView = false, onElementSelect, darkMode = false }) => {
  const isPreMarket = data.reportType === '장전';
  const isDark = !isPreMarket && darkMode;

  // 마감 다크모드 vs 화이트모드 vs 장전 테마 색상
  const themeColor = isPreMarket ? 'bg-[#0f172a]' : (isDark ? 'bg-amber-400' : 'bg-[#191f28]');
  const accentColor = isPreMarket ? 'text-sky-500' : (isDark ? 'text-amber-400' : 'text-amber-600');
  const accentBg = isPreMarket ? 'bg-sky-500' : (isDark ? 'bg-amber-500' : 'bg-amber-500');
  const typeBadge = isPreMarket ? 'bg-[#0ea5e9]' : 'bg-amber-500';

  // 다크모드 전용 색상
  const pageBg = isDark ? 'bg-[#0f0f14]' : 'bg-white';
  const pageText = isDark ? 'text-slate-100' : 'text-slate-900';
  const cardBg = isDark ? 'bg-[#1a1a24]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#2a2a3a]' : 'border-slate-100';
  const subText = isDark ? 'text-slate-400' : 'text-slate-600';
  const labelText = isDark ? 'text-slate-500' : 'text-slate-400';
  const sectionBg = isDark ? 'bg-[#12121a]' : 'bg-slate-50';
  const dividerColor = isDark ? 'border-white/5' : 'border-slate-900/10';

  const update = useCallback((path: string, val: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    const keys = path.split('.');
    let curr: any = newData;
    for (let i = 0; i < keys.length - 1; i++) curr = curr[keys[i]];
    curr[keys[keys.length - 1]] = val;
    onChange(newData);
  }, [data, onChange]);

  const updateArr = useCallback((arrKey: string, idx: number, field: string, val: string) => {
    const items = [...(data as any)[arrKey]];
    items[idx] = { ...items[idx], [field]: val };
    onChange({ ...data, [arrKey]: items });
  }, [data, onChange]);

  const addItem = useCallback((arrKey: 'featuredStocks' | 'sectors' | 'marketSchedule') => {
    const creators = { featuredStocks: createEmptyStock, sectors: createEmptySector, marketSchedule: createEmptySchedule };
    const items = [...(data as any)[arrKey], creators[arrKey]()];
    onChange({ ...data, [arrKey]: items });
    // 새 행 추가 후 자동 스크롤
    setTimeout(() => {
      const rows = document.querySelectorAll(`[data-arr="${arrKey}"]`);
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 첫 번째 편집 가능한 요소에 포커스
        const firstEditable = lastRow.querySelector('[contenteditable]') as HTMLElement;
        if (firstEditable) firstEditable.focus();
      }
    }, 100);
  }, [data, onChange]);

  const removeItem = useCallback((arrKey: string, idx: number) => {
    const items = [...(data as any)[arrKey]];
    if (items.length <= MIN_ITEMS) return;
    items.splice(idx, 1);
    onChange({ ...data, [arrKey]: items });
  }, [data, onChange]);

  const cycleSentiment = useCallback((idx: number) => {
    const current = data.sectors[idx].sentiment;
    const nextIdx = (SENTIMENTS.indexOf(current) + 1) % SENTIMENTS.length;
    updateArr('sectors', idx, 'sentiment', SENTIMENTS[nextIdx]);
  }, [data.sectors, updateArr]);

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
            <span className={`px-3 py-1 text-[11px] font-black text-white rounded-lg ${typeBadge} uppercase tracking-tight shadow-sm`}>
              {data.reportType} REPORT
            </span>
          </div>
          <EditableText value={data.title} {...ep('title')} tag="h1" className={`text-[28px] font-[900] tracking-tighter leading-tight ${pageText}`} />
          <EditableText value={data.date} {...ep('date')} className={`text-[13px] font-semibold ${labelText} tracking-tight`} />
        </div>
        <span className={`text-[36px] font-[900] tracking-[-0.05em] ${pageText} uppercase shrink-0 ml-6 leading-none self-center`} style={{ fontStretch: 'condensed' }}>RISING</span>
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
      const topItems = data.summaryItems.slice(0, 2);    // KOSPI, KOSDAQ
      const bottomItems = data.summaryItems.slice(2);    // 외인/기관 x4 + USD/KRW
      return (
        <div className={`shrink-0 ${sectionBg} p-2.5 rounded-2xl border ${cardBorder}`}>
          {/* 상단: 코스피/코스닥 대형 박스 */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {topItems.map((item, idx) => {
              const arrow = item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '';
              const pctText = item.subText || '';
              return (
                <div key={idx} className={`${cardBg} px-4 py-3.5 rounded-xl border ${cardBorder} shadow-sm flex items-center gap-3`}>
                  <span className={`text-[10px] font-extrabold ${labelText} uppercase leading-none tracking-tight shrink-0`}>{item.label}</span>
                  <EditableText
                    value={item.value}
                    onSave={(v) => updateArr('summaryItems', idx, 'value', v)}
                    isModal={isModalView}
                    className={`text-[16px] font-[900] leading-none tracking-tight ${
                      item.trend === 'up' ? 'text-[#f04452]' :
                      item.trend === 'down' ? 'text-[#3182f6]' : pageText
                    }`}
                  />
                  <span className={`text-[11px] font-bold leading-none flex items-center gap-0.5 ml-auto whitespace-nowrap ${
                    item.trend === 'up' ? 'text-[#f04452]' :
                    item.trend === 'down' ? 'text-[#3182f6]' : labelText
                  }`}>
                    {arrow}{pctText}
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
                <div key={idx} className={`${cardBg} px-2 py-2.5 rounded-xl border ${cardBorder} shadow-sm flex flex-col items-center justify-center text-center gap-1`}>
                  <span className={`text-[8px] font-extrabold ${labelText} uppercase leading-none tracking-tight`}>{item.label}</span>
                  <span className={`text-[12px] font-[900] leading-none tracking-tight ${
                    item.trend === 'up' ? 'text-[#f04452]' :
                    item.trend === 'down' ? 'text-[#3182f6]' : pageText
                  }`}>
                    {item.value}
                  </span>
                  {item.subText && item.subText !== '' && item.subText !== '-' && (
                    <span className={`text-[8px] font-bold leading-none ${
                      item.trend === 'up' ? 'text-[#f04452]' :
                      item.trend === 'down' ? 'text-[#3182f6]' : labelText
                    }`}>
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
            <div key={idx} className="bg-white px-2 py-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1.5 leading-none tracking-tight">{item.label}</span>
              <EditableText
                value={item.value}
                onSave={(v) => updateArr('summaryItems', idx, 'value', v)}
                isModal={isModalView}
                className={`text-[13px] font-[900] leading-none tracking-tight ${
                  item.trend === 'up' ? 'text-[#f04452]' :
                  item.trend === 'down' ? 'text-[#3182f6]' : 'text-slate-900'
                }`}
              />
              <span className={`text-[9px] font-bold leading-none mt-1 flex items-center gap-0.5 ${
                item.trend === 'up' ? 'text-[#f04452]' :
                item.trend === 'down' ? 'text-[#3182f6]' : 'text-slate-400'
              }`}>
                {item.trend === 'up' && '▲ '}{item.trend === 'down' && '▼ '}{item.subText}
              </span>
            </div>
          ))}
        </div>
        {/* 보조 지표: 원유/금/BTC 소형 가로 배치 */}
        {data.subIndicators && data.subIndicators.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {data.subIndicators.map((item, idx) => (
              <div key={`sub-${idx}`} className="flex-1 bg-white/70 px-2 py-1.5 rounded-lg border border-slate-100/80 flex items-center justify-between min-w-0">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase leading-none tracking-tight shrink-0">{item.label}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-[800] leading-none tracking-tight ${
                    item.trend === 'up' ? 'text-[#f04452]' :
                    item.trend === 'down' ? 'text-[#3182f6]' : 'text-slate-700'
                  }`}>{item.value}</span>
                  <span className={`text-[7.5px] font-bold leading-none ${
                    item.trend === 'up' ? 'text-[#f04452]' :
                    item.trend === 'down' ? 'text-[#3182f6]' : 'text-slate-400'
                  }`}>
                    {item.trend === 'up' && '▲'}{item.trend === 'down' && '▼'}{item.subText}
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
  // 핵심 시장 전망
  // ===========================
  const renderCoreView = () => (
    <div className={`${
      isPreMarket ? 'bg-[#0f172a]' : (isDark ? 'bg-[#1a1a24] ring-amber-400/20' : 'bg-gradient-to-r from-[#1c162a] to-[#221a30]')
    } text-white rounded-2xl p-5 flex items-center gap-6 relative shadow-xl ring-1 ${
      isPreMarket ? 'ring-white/10' : (isDark ? 'ring-amber-400/30' : 'ring-amber-400/20')
    } shrink-0`}>
      <div className={`shrink-0 flex flex-col items-center justify-center border-r ${
        isPreMarket ? 'border-white/10' : 'border-amber-400/20'
      } pr-6 pl-1`}>
        <EditableText value={data.coreViewTitle} onSave={(v) => update('coreViewTitle', v)} isModal={isModalView}
          className={`text-[15px] font-black uppercase tracking-[0.2em] mb-2 text-center ${
            isPreMarket ? 'text-blue-400' : 'text-amber-400'
          }`} />
        <div className="flex gap-1.5">
          <div className={`w-2 h-2 ${isPreMarket ? 'bg-blue-400' : 'bg-amber-400'} rounded-full animate-pulse`} />
          <div className={`w-2 h-2 ${isPreMarket ? 'bg-blue-400/50' : 'bg-amber-400/50'} rounded-full`} />
          <div className={`w-2 h-2 ${isPreMarket ? 'bg-blue-400/20' : 'bg-amber-400/20'} rounded-full`} />
        </div>
      </div>
      <EditableText value={data.currentMarketView} {...ep('currentMarketView')}
        className="text-[15px] font-bold leading-[1.7] text-slate-50 tracking-tight flex-1" />
    </div>
  );

  // ===========================
  // 개장전 투자전략 (CEO 브리핑)
  // ===========================
  const renderInsight = () => {
    const insightChipColor = isPreMarket
      ? 'bg-sky-100 text-sky-800 border-sky-200/80'
      : (isDark ? 'bg-[#1c162a] text-amber-300 border-amber-400/30' : 'bg-amber-50 text-amber-800 border-amber-200/80');
    return (
      <div className={`
        ${isPreMarket
          ? 'bg-gradient-to-br from-sky-50/80 to-white border-sky-200/50'
          : (isDark
            ? 'bg-[#1a1a24] border-[#2a2a3a]'
            : 'bg-gradient-to-br from-amber-50/80 to-white border-amber-200/50')}
        p-6 rounded-2xl border flex flex-col relative shrink-0
      `}>
        <div className="flex items-center gap-4 mb-4 shrink-0">
          <div className={`w-10 h-10 ${isPreMarket ? 'bg-sky-500' : (isDark ? 'bg-amber-500' : 'bg-amber-400')} text-white rounded-xl flex items-center justify-center text-lg shadow-md ring-2 ${isDark ? 'ring-[#0f0f14]' : 'ring-white'}`}>
            {isPreMarket ? '⚡' : '🎙️'}
          </div>
          <div className="flex flex-col gap-1">
            <EditableText value={data.expertAnalysisSubtitle} {...ep('expertAnalysisSubtitle')} tag="span"
              className={`text-[13px] font-black uppercase tracking-[0.15em] ${isPreMarket ? 'text-sky-600' : (isDark ? 'text-amber-500' : 'text-amber-600')} leading-none`} />
            <EditableText value={data.expertAnalysisTitle} {...ep('expertAnalysisTitle')} tag="h2"
              className={`text-[20px] font-[900] ${isDark ? 'text-slate-100' : 'text-slate-900'} tracking-tight leading-tight`} />
          </div>
        </div>
        <div className={`border-t ${isDark ? 'border-white/5' : 'border-black/5'} pt-4`}>
          <EditableText value={data.expertAnalysis} {...ep('expertAnalysis')}
            className={`text-[17px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'} leading-[2.0] text-justify`} />
        </div>
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'} flex items-center gap-3 shrink-0 flex-wrap`}>
          <span className={`shrink-0 uppercase tracking-widest text-[12px] font-[900] ${isPreMarket ? 'bg-sky-200/70 text-sky-700' : (isDark ? 'bg-amber-400/20 text-amber-500' : 'bg-amber-100 text-amber-700')} px-3.5 py-1.5 rounded-lg`}>
            금일 관심주
          </span>
          <div className="flex-1">
            <ChipInput
              value={data.expertInterestedStocks}
              onSave={(v) => onChange({ ...data, expertInterestedStocks: v })}
              isModal={isModalView}
              placeholder="EX. 종목명 입력 후 Enter"
              chipClassName={insightChipColor}
              size="lg"
            />
          </div>
        </div>
      </div>
    );
  };

  // ===========================
  // 관련주 칩 렌더링 헬퍼
  // ===========================
  const renderStockChips = (text: string) => {
    const chips = text.split(',').map(s => s.trim()).filter(Boolean);
    if (chips.length === 0) return <span className="text-slate-300 text-[11px]">―</span>;
    return (
      <div className="flex flex-nowrap gap-1">
        {chips.map((chip, i) => (
          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">
            {chip}
          </span>
        ))}
      </div>
    );
  };

  // ===========================
  // TODAY'S HOT THEME 테이블
  // ===========================
  const renderFeaturedStocks = () => (
    <div className={`shrink-0 overflow-hidden rounded-2xl border ${isDark ? 'border-[#2a2a3a]' : 'border-slate-200/60'} shadow-sm ${cardBg}`}>
      <div className={`${isDark ? 'bg-[#16161e]' : 'bg-slate-50/50'} px-5 py-3 border-b ${cardBorder}`}>
        <EditableText value={data.featuredStocksTitle} {...ep('featuredStocksTitle')} tag="h2"
          className={`text-[13px] font-black ${isDark ? 'text-slate-300' : 'text-slate-800'} uppercase tracking-tight`} />
      </div>
      <div className="p-2">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className={`h-[8mm] border-b ${cardBorder} ${labelText}`}>
              <th className="px-3 text-[11px] font-bold uppercase tracking-tight pl-4" style={{ width: '22%' }}>{isPreMarket ? '이슈 키워드' : '종목명'}</th>
              <th className="px-2 text-[11px] font-bold uppercase tracking-tight" style={{ width: '30%' }}>{isPreMarket ? '국내 관련주' : '현재가 / 등락'}</th>
              <th className="px-3 text-[11px] font-bold uppercase tracking-tight" style={{ width: '48%' }}>{isPreMarket ? '투자 포인트' : '등락 사유 및 분석'}</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#1a1a24]' : 'divide-slate-50'}`}>
            {data.featuredStocks.map((stock, idx) => (
              <tr key={stock.id || idx} data-arr="featuredStocks" className={`${isDark ? 'hover:bg-[#22222e]' : 'hover:bg-slate-50'} transition-colors group/row relative`}>
                <td className={`px-3 py-2 text-[15px] font-black ${pageText} border-r ${isDark ? 'border-[#1a1a24]' : 'border-slate-50'} align-middle pl-4 relative`} style={{ width: '22%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {!isModalView && data.featuredStocks.length > MIN_ITEMS && (
                    <button onClick={() => removeItem('featuredStocks', idx)} className="absolute -left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold opacity-0 group-hover/row:opacity-100 transition-opacity no-print flex items-center justify-center shadow-sm hover:bg-red-600 z-10">×</button>
                  )}
                  <EditableText value={stock.name} onSave={(v) => updateArr('featuredStocks', idx, 'name', v)} isModal={isModalView} placeholder="EX. AI 반도체" className="truncate" />
                </td>
                <td className={`px-2 py-2 border-r ${isDark ? 'border-[#1a1a24]' : 'border-slate-50'} align-middle`} style={{ width: '30%' }}>
                  {isPreMarket ? (
                    <ChipInput value={stock.change} onSave={(v) => updateArr('featuredStocks', idx, 'change', v)} isModal={isModalView} placeholder="EX. 종목명 입력 후 Enter" vertical />
                  ) : (
                    <span className={`text-[13px] font-[900] leading-snug ${
                      stock.change.includes('+') || stock.change.includes('▲') ? 'text-[#f04452]' :
                      stock.change.includes('-') || stock.change.includes('▼') ? 'text-[#3182f6]' : pageText
                    }`}>
                      <EditableText value={stock.change} onSave={(v) => updateArr('featuredStocks', idx, 'change', v)} isModal={isModalView} placeholder="EX. 52,300원 (+3.2%)" />
                    </span>
                  )}
                </td>
                <td className={`px-3 py-2 text-[15px] font-medium ${subText} leading-[1.5] align-middle`} style={{ width: '48%' }}>
                  <EditableText value={stock.reason} onSave={(v) => updateArr('featuredStocks', idx, 'reason', v)} isModal={isModalView} placeholder="EX. 미국 AI 칩 수요 폭증 및 실적 호조"  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isModalView && data.featuredStocks.length < MAX_STOCKS && (
        <button onClick={() => addItem('featuredStocks')} className="w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-b-2xl transition-colors no-print">
          <span className="text-base leading-none">+</span> 테마 추가
        </button>
      )}
    </div>
  );

  // ===========================
  // 글로벌 마켓 트렌드 + 금일 주요 일정
  // ===========================
  const renderSectorsAndSchedule = () => (
    <div className="grid grid-cols-12 gap-4 shrink-0">
      <div className="col-span-7 flex flex-col">
        <div className="flex items-center mb-2 shrink-0">
          <EditableText value={data.sectorsTitle} {...ep('sectorsTitle')} tag="h2"
            className={`text-[13px] font-black uppercase tracking-tighter ${pageText} flex items-center gap-2 before:content-[''] before:w-1.5 before:h-4 ${isDark ? 'before:bg-slate-400' : 'before:bg-slate-900'} before:rounded-full`} />
        </div>
        <div className="flex flex-col gap-2">
          {data.sectors.map((sector, idx) => (
            <div key={sector.id || idx} data-arr="sectors" className={`${cardBg} rounded-xl border ${isDark ? 'border-[#2a2a3a] hover:border-amber-400/30' : 'border-slate-200/60 hover:border-blue-300'} p-3 shadow-sm transition-all group/sector relative`}>
              {!isModalView && data.sectors.length > MIN_ITEMS && (
                <button onClick={() => removeItem('sectors', idx)} className={`absolute -right-2 -top-2 w-5 h-5 rounded-full ${isPreMarket ? 'bg-red-500' : 'bg-amber-500'} text-white text-[10px] font-bold opacity-0 group-hover/sector:opacity-100 transition-opacity no-print flex items-center justify-center shadow-sm ${isPreMarket ? 'hover:bg-red-600' : 'hover:bg-amber-600'} z-10`}>×</button>
              )}
              <div className="flex justify-between items-center mb-1">
                <EditableText value={sector.name} onSave={(v) => updateArr('sectors', idx, 'name', v)} isModal={isModalView} className={`text-[13px] font-[900] ${pageText} leading-none`} placeholder="EX. 바이오" />
                <SentimentBadge sentiment={sector.sentiment} onClick={!isModalView ? () => cycleSentiment(idx) : undefined} />
              </div>
              <EditableText value={sector.issue} onSave={(v) => updateArr('sectors', idx, 'issue', v)} isModal={isModalView}
                className={`text-[11px] font-medium ${subText} leading-[1.5]`} placeholder="EX. 미국 의회 생물보안법 추진 가속화" />
              <div className={`flex gap-2 items-center mt-1.5 border-t ${isDark ? 'border-white/5' : 'border-slate-50'} pt-1.5`}>
                <span className={`text-[9px] font-black ${labelText} uppercase leading-none tracking-widest shrink-0`}>관심</span>
                <div className="flex-1">
                  <ChipInput value={sector.stocks} onSave={(v) => updateArr('sectors', idx, 'stocks', v)} isModal={isModalView}
                    placeholder="EX. 종목명 입력 후 Enter" size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!isModalView && data.sectors.length < MAX_SECTORS && (
          <button onClick={() => addItem('sectors')} className={`w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold ${isDark ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-400/5' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50/50'} rounded-xl border border-dashed ${isDark ? 'border-[#2a2a3a]' : 'border-slate-200'} transition-colors no-print mt-1`}>
            <span className="text-base leading-none">+</span> 섹터 추가
          </button>
        )}
      </div>
      <div className="col-span-5 flex flex-col">
        <div className="flex items-center mb-3 shrink-0">
          <EditableText value={data.scheduleTitle} {...ep('scheduleTitle')} tag="h2"
            className={`text-[13px] font-black uppercase tracking-tighter ${pageText} flex items-center gap-2 before:content-[''] before:w-1.5 before:h-4 ${isDark ? 'before:bg-slate-400' : 'before:bg-slate-900'} before:rounded-full`} />
        </div>
        <div className={`${sectionBg} rounded-2xl p-5 border ${isDark ? 'border-[#2a2a3a]' : 'border-slate-200/60'} flex flex-col shadow-inner`}>
          <div className="space-y-4 relative">
            <div className={`absolute left-[4px] top-1 bottom-1 w-[2px] ${isDark ? 'bg-[#2a2a3a]' : 'bg-slate-200'}`} />
            {data.marketSchedule.map((item, idx) => (
              <div key={item.id || idx} data-arr="marketSchedule" className="relative group/sched">
                {!isModalView && data.marketSchedule.length > MIN_ITEMS && (
                  <button onClick={() => removeItem('marketSchedule', idx)} className={`absolute -right-2 -top-1 w-5 h-5 rounded-full ${isPreMarket ? 'bg-red-500' : 'bg-amber-500'} text-white text-[10px] font-bold opacity-0 group-hover/sched:opacity-100 transition-opacity no-print flex items-center justify-center shadow-sm ${isPreMarket ? 'hover:bg-red-600' : 'hover:bg-amber-600'} z-10`}>×</button>
                )}
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-[10px] h-[10px] rounded-full ${accentBg} ring-2 ${isDark ? 'ring-[#12121a]' : 'ring-white'} z-10 shadow-sm shrink-0`} />
                  <EditableText value={item.time} onSave={(v) => updateArr('marketSchedule', idx, 'time', v)} isModal={isModalView}
                    className={`text-[12px] font-[900] ${accentColor} tracking-wide leading-none`} placeholder="EX. 08:30" />
                </div>
                <div className="pl-[18px]">
                  <EditableText value={item.event} onSave={(v) => updateArr('marketSchedule', idx, 'event', v)} isModal={isModalView}
                    className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'} leading-[1.6]`} placeholder="EX. 고용보고서 발표" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {!isModalView && data.marketSchedule.length < MAX_SCHEDULE && (
          <button onClick={() => addItem('marketSchedule')} className={`w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold ${isDark ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50/50'} rounded-xl transition-colors no-print mt-2`}>
            <span className="text-base leading-none">+</span> 일정 추가
          </button>
        )}
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
        <div className={`${pageBg} w-[210mm] min-h-[297mm] shadow-2xl rounded-lg relative`}>
          {/* 상단 강조 바 */}
          <div className={`absolute top-0 left-0 w-full h-[4px] ${isDark ? 'bg-amber-400' : themeColor} rounded-t-lg`} />
          <div className="px-[14mm] pt-[5mm] pb-[8mm] flex flex-col gap-2.5">
            {renderHeader()}
            {renderIndicators()}
            {renderCoreView()}
            {renderInsight()}
            {renderFeaturedStocks()}
          </div>
        </div>

        {/* ========== 2페이지 ========== */}
        <div className={`${pageBg} w-[210mm] min-h-[297mm] shadow-2xl rounded-lg relative`}>
          {/* 상단 강조 바 */}
          <div className={`absolute top-0 left-0 w-full h-[4px] ${isDark ? 'bg-amber-400' : themeColor} rounded-t-lg`} />
          <div className="px-[14mm] pt-[8mm] pb-[8mm] flex flex-col gap-2.5">
            {/* 2페이지 연속 헤더 */}
            <div className={`shrink-0 pb-3 border-b-2 ${isDark ? 'border-white/5' : 'border-slate-900/10'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 text-[10px] font-black text-white rounded-md ${typeBadge} uppercase tracking-tight shadow-sm`}>{data.reportType}</span>
                <span className={`text-[18px] font-[900] tracking-tighter ${pageText}`}>{data.title}</span>
              </div>
              <span className={`text-[24px] font-[900] tracking-[-0.05em] ${pageText} uppercase shrink-0`} style={{ fontStretch: 'condensed' }}>RISING</span>
            </div>
            {renderSectorsAndSchedule()}
            {/* 마무리 코멘트 */}
            <div className={`shrink-0 mt-1 rounded-2xl border ${
              isDark ? 'border-amber-400/20 bg-gradient-to-r from-[#1c162a] to-[#221a30]'
              : (isPreMarket ? 'border-slate-800/20 bg-gradient-to-r from-slate-800 to-slate-700'
              : 'border-[#2a2035]/30 bg-gradient-to-r from-[#1c162a] to-[#221a30]')
            } p-4 shadow-md`}>
              <div className="flex items-start gap-3">
                <span className="text-[18px] leading-none mt-[3px]">💬</span>
                <div className="flex-1">
                  <span className={`text-[10px] font-black ${isDark ? 'text-amber-400' : (isPreMarket ? 'text-slate-300' : 'text-amber-400')} uppercase tracking-widest`}>오늘의 한마디</span>
                  <EditableText value={data.dailyComment} {...ep('dailyComment')} className="text-[12px] font-bold text-white/90 leading-[1.6] mt-1" />
                </div>
              </div>
            </div>
          </div>
          {/* 하단 면책 */}
          <div className={`absolute bottom-0 left-0 right-0 px-[14mm] pb-[6mm] pt-2 border-t ${isDark ? 'border-white/5' : 'border-gray-100'} text-center opacity-40`}>
            <p className={`text-[7px] ${isDark ? 'text-slate-500' : 'text-gray-500'} font-bold tracking-tighter whitespace-nowrap`}>
              ◆ 본 리포트는 Rising 서비스의 주관적인 견해를 포함하며 투자 결과에 대한 법적 책임은 투자자 본인에게 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
