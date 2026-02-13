import React, { useState, useEffect } from 'react';
import { ReportData, Sector, FeaturedStock, MarketSchedule } from '../types';
import { PRE_MARKET_REPORT_TEMPLATE, CLOSE_REPORT_TEMPLATE, EMPTY_PRE_MARKET_TEMPLATE, EMPTY_CLOSE_TEMPLATE, createEmptySector, createEmptyStock, createEmptySchedule, MAX_SECTORS, MAX_STOCKS, MAX_SCHEDULE, MIN_ITEMS } from '../constants';
import { fetchMarketIndicators } from '../services/gemini';
import {
  ChevronDown, Plus, Trash2, GripVertical, Loader2, RotateCcw,
  Settings, BarChart3, Eye, Star, PenTool, Layers, Calendar, Info, MessageSquare, Save, RefreshCw, Clock, History, Palette
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  data: ReportData;
  onChange: (newData: ReportData) => void;
  activeSection: string | null;
  onSectionChange: (section: string | null) => void;
  onSave?: () => void;
  onFullReset?: () => void;
  templateHistory?: Array<{data: ReportData, savedAt: string}>;
  onRestoreHistory?: (data: ReportData) => void;
  onDeleteHistory?: (idx: number) => void;
}

// ===========================
// Sortable Item Wrapper
// ===========================
const SortableItem: React.FC<{
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ id, children, onRemove, canRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-3 p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title="드래그하여 순서 변경"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="mt-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all"
            title="삭제"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

// ===========================
// Accordion Section
// ===========================
const AccordionSection: React.FC<{
  id: string;
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  summary?: string;
  summaryNode?: React.ReactNode;
  badge?: React.ReactNode;
  onReset?: () => void;
  children: React.ReactNode;
}> = ({ id, label, icon, isOpen, onToggle, summary, summaryNode, badge, onReset, children }) => (
  <div id={`editor-section-${id}`} className={`overflow-hidden transition-all duration-200 border ${isOpen ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-900/5' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'} rounded-2xl`}>
    <button
      onClick={onToggle}
      className="w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm shrink-0 ${isOpen ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-[13px] font-extrabold ${isOpen ? 'text-slate-900' : 'text-slate-600'} tracking-tight`}>{label}</h3>
            {badge && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{badge}</span>}
          </div>

        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {onReset && (
          <span
            onClick={(e) => { e.stopPropagation(); if (confirm('이 섹션을 기본값으로 초기화하시겠습니까?')) onReset(); }}
            className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            title="이 섹션 초기화"
          >
            <RotateCcw size={13} />
          </span>
        )}
        <ChevronDown size={16} className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-600' : ''}`} />
      </div>
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 invisible pointer-events-none'}`}>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ===========================
// Field Tooltip
// ===========================
const FieldTip: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1.5">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-300 hover:text-slate-500 transition-colors"
      >
        <Info size={12} />
      </button>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-900 text-white text-[10px] font-medium px-3 py-2 rounded-lg shadow-xl z-50 w-48 leading-relaxed animate-fade-in pointer-events-none">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
};

// ===========================
// Main Editor Component
// ===========================
const COLOR_KEYS = [
  'indicatorBoxColor', 'sectorTrendHeaderColor', 'sectorTrendSubHeaderColor',
  'sectorTrendTableTextColor', 'sectorTrendTableTextSize', 'usAnalysisHeaderColor',
  'usAnalysisBoxColor', 'usAnalysisTextSize', 'usAnalysisTextColor',
  'domesticTextSize', 'domesticTextColor',
  'themeHeaderColor', 'themeCardHeaderColor', 'themeChipColor', 'themeChipTextColor',
  'strategyBoxColor', 'stockChipColor', 'strategyTextSize', 'strategyTextColor', 'headerBadgeColor',
  'disclaimerTextSize', 'disclaimerTextColor', 'pageNumberSize', 'pageNumberColor',
  'indicatorLabelSize', 'indicatorLabelColor', 'indicatorLabelWeight',
  'indicatorValueSize', 'indicatorValueColor', 'indicatorValueWeight',
  'indicatorChangeSize', 'indicatorChangeWeight',
  'sectorTrendNameSize', 'sectorTrendNameWeight',
  'sectorTrendIssueSize', 'sectorTrendIssueWeight',
  'themeNameSize', 'themeNameWeight',
  'themeIssueSize', 'themeIssueWeight',
] as const;

const PRESETS_STORAGE_KEY = 'rising_color_presets';

interface ColorPreset {
  id: string;
  name: string;
  savedAt: string;
  colors: Record<string, any>;
}

const ReportEditor: React.FC<Props> = ({ data, onChange, activeSection, onSectionChange, onSave, onFullReset, templateHistory = [], onRestoreHistory, onDeleteHistory }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copyToast, setCopyToast] = useState<{text: string; x: number; y: number} | null>(null);

  // 색상 프리셋 (localStorage 영구 저장)
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>(() => {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveColorPresets = (presets: ColorPreset[]) => {
    setColorPresets(presets);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  };

  const handleSaveColorPreset = () => {
    if (colorPresets.length >= 5) {
      alert('최대 5개까지 저장할 수 있습니다.\n기존 프리셋을 삭제한 후 다시 저장해주세요.');
      return;
    }
    const colors: Record<string, any> = {};
    COLOR_KEYS.forEach(key => {
      if ((data as any)[key] !== undefined) colors[key] = (data as any)[key];
    });
    const now = new Date();
    const name = `프리셋 ${colorPresets.length + 1}`;
    const savedAt = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newPreset: ColorPreset = { id: crypto.randomUUID(), name, savedAt, colors };
    saveColorPresets([...colorPresets, newPreset]);
  };

  const handleLoadColorPreset = (preset: ColorPreset) => {
    const resetColors: Record<string, any> = {};
    COLOR_KEYS.forEach(key => { resetColors[key] = undefined; });
    onChange({ ...data, ...resetColors, ...preset.colors });
  };

  const handleDeleteColorPreset = (id: string) => {
    saveColorPresets(colorPresets.filter(p => p.id !== id));
  };

  /** contentEditable 내 선택된 텍스트가 있으면 foreColor 적용, 없으면 false 반환 */
  const applyColorToSelection = (color: string): boolean => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.anchorNode) {
      const editable = (sel.anchorNode.nodeType === Node.TEXT_NODE
        ? sel.anchorNode.parentElement
        : sel.anchorNode as HTMLElement
      )?.closest('[contenteditable="true"]');
      if (editable) {
        document.execCommand('foreColor', false, color);
        return true;
      }
    }
    return false;
  };

  const handleCopyColor = (color: string, label: string, e: React.MouseEvent) => {
    navigator.clipboard.writeText(color);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCopyToast({ text: `${label} (${color})`, x: rect.left + rect.width / 2, y: rect.top - 8 });
    setTimeout(() => setCopyToast(null), 1200);
  };

  // 스타일 그룹별 초기화: 해당 색상 키들만 undefined로 리셋
  const resetStyleGroup = (keys: string[]) => {
    if (!confirm('이 항목의 색상을 기본값으로 초기화하시겠습니까?')) return;
    const patch: Record<string, any> = {};
    keys.forEach(k => { patch[k] = undefined; });
    onChange({ ...data, ...patch });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleSection = (id: string) => {
    onSectionChange(activeSection === id ? null : id);
  };

  const handleChange = (path: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(data)); // deep clone
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const updateArrayItem = (key: keyof ReportData, index: number, field: string, value: any) => {
    const items = [...(data[key] as any[])];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...data, [key]: items });
  };

  const addItem = (key: 'sectors' | 'featuredStocks' | 'marketSchedule') => {
    const creators = { sectors: createEmptySector, featuredStocks: createEmptyStock, marketSchedule: createEmptySchedule };
    const limits = { sectors: MAX_SECTORS, featuredStocks: MAX_STOCKS, marketSchedule: MAX_SCHEDULE };
    if ((data[key] as any[]).length >= limits[key]) return;
    onChange({ ...data, [key]: [...(data[key] as any[]), creators[key]()] });
  };

  const removeItem = (key: 'sectors' | 'featuredStocks' | 'marketSchedule', index: number) => {
    if ((data[key] as any[]).length <= MIN_ITEMS) return;
    const items = [...(data[key] as any[])];
    items.splice(index, 1);
    onChange({ ...data, [key]: items });
  };

  const handleDragEnd = (key: 'sectors' | 'featuredStocks' | 'marketSchedule') => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = data[key] as any[];
    const oldIndex = items.findIndex((i: any) => i.id === active.id);
    const newIndex = items.findIndex((i: any) => i.id === over.id);
    onChange({ ...data, [key]: arrayMove(items, oldIndex, newIndex) });
  };

  // ===========================
  // 섹션별 개별 초기화
  // ===========================
  const getEmptyTemplate = () => data.reportType === '장전' ? EMPTY_PRE_MARKET_TEMPLATE : EMPTY_CLOSE_TEMPLATE;

  const resetSection = (sectionId: string) => {
    const tmpl = getEmptyTemplate();
    const resetFields: Record<string, (keyof ReportData)[]> = {
      setup: ['title', 'date'],
      indicators: ['summaryItems', 'summaryTitle', 'subIndicators'],
      coreview: ['currentMarketView', 'coreViewTitle'],
      stocks: ['featuredStocks', 'featuredStocksTitle'],
      insight: ['expertAnalysis', 'expertAnalysisTitle', 'expertInterestedStocks', 'expertAnalysisSubtitle'],
      sectors: ['sectors', 'sectorsTitle'],
      schedule: ['marketSchedule', 'scheduleTitle'],
      comment: ['dailyComment'],
    };
    const fields = resetFields[sectionId];
    if (!fields) return;
    const patch: Partial<ReportData> = {};
    fields.forEach(key => {
      const val = (tmpl as any)[key];
      (patch as any)[key] = Array.isArray(val) ? JSON.parse(JSON.stringify(val)) : val;
    });
    onChange({ ...data, ...patch });
  };

  // 프리셋 이름 변경
  const handleRenamePreset = (id: string, newName: string) => {
    const updated = colorPresets.map(p => p.id === id ? { ...p, name: newName } : p);
    saveColorPresets(updated);
  };

  // ===========================
  // 실시간 지표 업데이트 (Perplexity API)
  // ===========================
  const handleFetchMarketData = async () => {
    setIsFetching(true);
    try {
      const result = await fetchMarketIndicators(data.reportType as '장전' | '마감');
      if (result && result.items && result.items.length > 0) {
        const updates: any = { ...data, summaryItems: result.items };
        if (result.subItems && result.subItems.length > 0) {
          updates.subIndicators = result.subItems;
        }
        onChange(updates);
        const now = new Date();
        setLastFetched(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        // 자동 저장 제거 — 저장은 사용자가 직접 버튼을 누를 때만
      } else {
        alert('⚠️ 지표 데이터를 가져오지 못했습니다. 다시 시도해주세요.');
      }
    } catch {
      alert('❌ API 호출 실패. 네트워크 연결을 확인해주세요.');
    } finally {
      setIsFetching(false);
    }
  };

  // ===========================
  // 페이지 로드 시 자동 지표 불러오기
  // ===========================


  // ===========================
  // 발행시간 자동 업데이트
  // ===========================
  const handleAutoDate = () => {
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const formatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일(${days[now.getDay()]}) ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 발행`;
    handleChange('date', formatted);
  };

  const inputStyle = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all placeholder:text-slate-300 shadow-sm";
  const labelStyle = "text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center mb-1.5";

  return (
    <div className="pb-8 space-y-3.5 relative">
      {/* 실시간 지표 업데이트 */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[50px] rounded-full" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
            <BarChart3 size={16} />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-tight uppercase">실시간 지표 업데이트</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Gemini Search Powered</p>
          </div>
        </div>
        <div className="space-y-2.5">
          <button
            onClick={handleFetchMarketData}
            disabled={isFetching}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-3 px-4 rounded-xl text-[13px] font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isFetching ? <><Loader2 size={15} className="animate-spin" /> 지표 가져오는 중...</> : <><RefreshCw size={15} /> 주요 지표 불러오기</>}
          </button>
          <button
            onClick={handleAutoDate}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
          >
            <Clock size={14} /> 발행시간 현재시각 적용
          </button>
          {lastFetched && (
            <p className="text-[10px] text-slate-500 text-center">마지막 업데이트: {lastFetched}</p>
          )}
        </div>
      </div>

      {/* [마감 전용] 히트맵 자동 캡쳐 */}
      {data.reportType === '마감' && (
        <div className="bg-gradient-to-br from-amber-900 to-yellow-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[50px] rounded-full" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-[16px]">🗺️</span>
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight uppercase">히트맵 자동 캡쳐</h2>
              <p className="text-[9px] text-amber-300/70 font-bold uppercase tracking-widest">Puppeteer 자동 스크린샷</p>
            </div>
          </div>
          <div className="space-y-2">
            {/* 한번에 모두 캡쳐 */}
            <button
              onClick={async () => {
                const btn = document.getElementById('btn-capture-all') as HTMLButtonElement;
                if (btn) btn.disabled = true;
                try {
                  const results: any = {};
                  for (const market of ['kospi', 'kosdaq'] as const) {
                    const statusEl = document.getElementById(`capture-status-${market}`);
                    if (statusEl) statusEl.textContent = '캡쳐 중...';
                    const res = await fetch(`/api/capture-heatmap?market=${market}`);
                    const json = await res.json();
                    if (json.success) {
                      results[market] = json.dataUrl;
                      if (statusEl) statusEl.textContent = '✅ 완료';
                    } else {
                      if (statusEl) statusEl.textContent = '❌ 실패';
                      alert(`${market.toUpperCase()} 캡쳐 실패: ${json.error}`);
                    }
                  }
                  const update: any = { ...data };
                  if (results.kospi) update.kospiHeatmapImage = { src: results.kospi, width: 300, x: 0, y: 0 };
                  if (results.kosdaq) update.kosdaqHeatmapImage = { src: results.kosdaq, width: 300, x: 0, y: 0 };
                  onChange(update);
                } catch (err: any) {
                  alert(`캡쳐 오류: ${err.message}`);
                } finally {
                  if (btn) btn.disabled = false;
                  setTimeout(() => {
                    for (const m of ['kospi','kosdaq']) {
                      const el = document.getElementById(`capture-status-${m}`);
                      if (el) el.textContent = '';
                    }
                  }, 3000);
                }
              }}
              id="btn-capture-all"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-wait text-white py-3 px-4 rounded-xl text-[13px] font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} /> KOSPI + KOSDAQ 한번에 캡쳐
            </button>

            {/* 개별 캡쳐 버튼 */}
            <div className="grid grid-cols-2 gap-2">
              {(['kospi', 'kosdaq'] as const).map((market) => (
                <button
                  key={market}
                  onClick={async () => {
                    const btn = document.getElementById(`btn-capture-${market}`) as HTMLButtonElement;
                    if (btn) btn.disabled = true;
                    const statusEl = document.getElementById(`capture-status-${market}`);
                    if (statusEl) statusEl.textContent = '캡쳐 중...';
                    try {
                      const res = await fetch(`/api/capture-heatmap?market=${market}`);
                      const json = await res.json();
                      if (json.success) {
                        const key = market === 'kospi' ? 'kospiHeatmapImage' : 'kosdaqHeatmapImage';
                        onChange({ ...data, [key]: { src: json.dataUrl, width: 300, x: 0, y: 0 } });
                        if (statusEl) statusEl.textContent = '✅ 완료';
                      } else {
                        if (statusEl) statusEl.textContent = '❌ 실패';
                        alert(`캡쳐 실패: ${json.error}`);
                      }
                    } catch (err: any) {
                      if (statusEl) statusEl.textContent = '❌ 오류';
                      alert(`캡쳐 오류: ${err.message}`);
                    } finally {
                      if (btn) btn.disabled = false;
                      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
                    }
                  }}
                  id={`btn-capture-${market}`}
                  className="bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:cursor-wait text-white py-2.5 px-3 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 border border-white/10"
                >
                  <span className="flex items-center gap-1">📊 {market.toUpperCase()} 캡쳐</span>
                  <span id={`capture-status-${market}`} className="text-[9px] text-amber-300 min-h-[14px]">
                    {data[market === 'kospi' ? 'kospiHeatmapImage' : 'kosdaqHeatmapImage'] ? '✅ 이미지 있음' : ''}
                  </span>
                </button>
              ))}
            </div>

            {/* 수동 첨부 (대체 수단) */}
            <details className="group">
              <summary className="text-[10px] text-amber-400/60 text-center cursor-pointer hover:text-amber-300/80 transition-colors">
                📎 수동 이미지 첨부 (대체 수단)
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['kospi', 'kosdaq'] as const).map((market) => (
                  <label key={`manual-${market}`} className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-white/10 cursor-pointer">
                    📎 {market.toUpperCase()} 첨부
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const key = market === 'kospi' ? 'kospiHeatmapImage' : 'kosdaqHeatmapImage';
                            onChange({ ...data, [key]: { src: ev.target?.result as string, width: 300, x: 0, y: 0 } });
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                ))}
              </div>
            </details>

            {/* 삭제 버튼 */}
            {(data.kospiHeatmapImage || data.kosdaqHeatmapImage) && (
              <button
                onClick={() => {
                  if (confirm('히트맵 이미지를 모두 삭제하시겠습니까?')) {
                    onChange({ ...data, kospiHeatmapImage: undefined, kosdaqHeatmapImage: undefined });
                  }
                }}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-red-500/20"
              >
                🗑️ 히트맵 이미지 모두 삭제
              </button>
            )}
            <p className="text-[9px] text-amber-400/50 text-center">
              캡쳐 버튼 클릭 시 자동으로 한경 마켓맵을 캡쳐합니다 (약 8초 소요)
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl p-4 shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
          >
            <Save size={16} />
            <span className="text-sm font-black tracking-tight">템플릿 저장</span>
            <span className="text-[10px] font-bold opacity-70 ml-1">Ctrl+S</span>
          </button>
          {onFullReset && (
            <button
              onClick={onFullReset}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl p-4 shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              title="저장된 템플릿 포함 완전 초기화"
            >
              <RotateCcw size={14} />
              <span className="text-[11px] font-black tracking-tight">초기화</span>
            </button>
          )}
        </div>
      )}

      {/* Template History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => templateHistory.length > 0 && setShowHistory(!showHistory)}
            className={`w-full px-5 py-3 flex items-center justify-between text-left transition-colors ${templateHistory.length > 0 ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                <History size={13} className="text-slate-500" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-slate-700">저장 히스토리</span>
                <span className="text-[10px] text-slate-400 ml-2">{templateHistory.length > 0 ? `최근 ${templateHistory.length}개` : '없음'}</span>
              </div>
            </div>
            {templateHistory.length > 0 && (
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            )}
          </button>
          {showHistory && templateHistory.length > 0 && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
              {templateHistory.map((entry, idx) => {
                const displayNum = templateHistory.length - idx;
                return (
                  <div
                    key={idx}
                    className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => {
                        if (confirm(`${entry.savedAt} 시점의 템플릿으로 복원하시겠습니까?`)) {
                          onRestoreHistory?.(entry.data);
                        }
                      }}>
                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                          #{displayNum}
                        </span>
                        <span className="text-[12px] font-bold text-slate-700">{entry.savedAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
                          if (confirm(`${entry.savedAt} 시점의 템플릿으로 복원하시겠습니까?`)) {
                            onRestoreHistory?.(entry.data);
                          }
                        }}>
                          복원
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHistory?.(idx);
                          }}
                          className="text-slate-400 hover:text-red-500 transition-all p-1 rounded hover:bg-red-50"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate cursor-pointer" onClick={() => {
                      if (confirm(`${entry.savedAt} 시점의 템플릿으로 복원하시겠습니까?`)) {
                        onRestoreHistory?.(entry.data);
                      }
                    }}>
                      {entry.data.title} · {entry.data.featuredStocks?.map(s => s.keyword).filter(Boolean).join(', ') || '데이터 없음'}
                    </p>
                  </div>
                );
              })}
        </div>
          )}
        </div>


      {/* 색상 · 스타일 · 텍스트 설정 패널 */}
      <div className="overflow-hidden transition-all duration-200 border bg-white border-slate-200 shadow-md ring-1 ring-slate-900/5 rounded-2xl">
        <button onClick={() => onSectionChange(activeSection === 'stylePanel' ? null : 'stylePanel')} className="w-full px-5 py-3.5 flex items-center gap-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50/50 transition-colors">
          <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm shrink-0 bg-slate-900 text-white shadow-sm">
            <Palette size={14} />
          </span>
          <h3 className="text-[13px] font-extrabold text-slate-900 tracking-tight flex-1 text-left">색상 · 스타일 · 텍스트 설정</h3>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${activeSection === 'stylePanel' || activeSection === null ? '' : '-rotate-90'}`} />
        </button>
        {activeSection === 'stylePanel' && <div className="p-5">
        <div className="space-y-4">
          {/* 적용중 색상 */}
          {(() => {
            const colorKeys: { key: string; label: string }[] = [
              { key: 'indicatorBoxColor', label: '지표 박스' },
              { key: 'sectorTrendHeaderColor', label: '섹터 헤더' },
              { key: 'sectorTrendSubHeaderColor', label: '섹터 서브헤더' },
              { key: 'sectorTrendTableTextColor', label: '섹터 텍스트' },
              { key: 'usAnalysisHeaderColor', label: '분석 헤더' },
              { key: 'usAnalysisBoxColor', label: '분석 박스' },
              { key: 'themeHeaderColor', label: '테마 헤더' },
              { key: 'themeCardHeaderColor', label: '테마 카드헤더' },
              { key: 'themeChipColor', label: '테마 칩' },
              { key: 'strategyBoxColor', label: '전략 박스' },
              { key: 'stockChipColor', label: '종목 칩' },
              { key: 'headerBadgeColor', label: '헤더 배지' },
            ];
            const appliedColors = colorKeys.filter(c => (data as any)[c.key]).map(c => ({ ...c, color: (data as any)[c.key] as string }));
            if (appliedColors.length === 0) return null;
            return (
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />적용중 색상
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {appliedColors.map((ac) => (
                    <button
                      key={ac.key}
                      title={`${ac.label}: ${ac.color}`}
                      onMouseDown={(e) => { e.preventDefault(); if (!applyColorToSelection(ac.color)) handleCopyColor(ac.color, ac.label, e); }}
                      className="w-7 h-7 rounded-lg border-2 border-emerald-400 hover:scale-110 hover:shadow-md transition-all cursor-pointer relative group/ac ring-1 ring-emerald-200"
                      style={{ backgroundColor: ac.color }}
                    >
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-600 opacity-0 group-hover/ac:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">{ac.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-emerald-500 mt-2 font-semibold">텍스트 선택 시 클릭하면 색상 적용, 미선택 시 복사됩니다.</p>
              </div>
            );
          })()}

          {/* 퀵 색상 팔레트 */}
          <div>
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">추천 팔레트</h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { color: '#f8fafc', label: '화이트' },
                { color: '#e2e8f0', label: '라이트 그레이' },
                { color: '#94a3b8', label: '슬레이트' },
                { color: '#64748b', label: '쿨 그레이' },
                { color: '#334155', label: '다크 슬레이트' },
                { color: '#1e293b', label: '네이비' },
                { color: '#0f172a', label: '딥 블랙' },
                { color: '#7c3aed', label: '퍼플' },
                { color: '#6d28d9', label: '딥 퍼플' },
                { color: '#2563eb', label: '블루' },
                { color: '#1d4ed8', label: '로얄 블루' },
                { color: '#0891b2', label: '시안' },
                { color: '#059669', label: '에메랄드' },
                { color: '#16a34a', label: '그린' },
                { color: '#65a30d', label: '라임' },
                { color: '#eab308', label: '옐로우' },
                { color: '#d97706', label: '앰버' },
                { color: '#ea580c', label: '오렌지' },
                { color: '#dc2626', label: '레드' },
                { color: '#be123c', label: '로즈' },
                { color: '#db2777', label: '핑크' },
                { color: '#c026d3', label: '퓨시아' },
                { color: '#f1f5f9', label: '슬레이트 50' },
                { color: '#fafafa', label: '뉴트럴 50' },
                { color: '#fef3c7', label: '앰버 100' },
                { color: '#dbeafe', label: '블루 100' },
                { color: '#ede9fe', label: '바이올렛 100' },
                { color: '#fce7f3', label: '핑크 100' },
                { color: '#d1fae5', label: '에메랄드 100' },
                { color: '#fee2e2', label: '레드 100' },
              ].map((preset) => (
                <button
                  key={preset.color}
                  title={`${preset.label} (${preset.color})`}
                  onMouseDown={(e) => { e.preventDefault(); if (!applyColorToSelection(preset.color)) handleCopyColor(preset.color, preset.label, e); }}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:scale-110 hover:shadow-md transition-all cursor-pointer relative group/qp active:scale-90"
                  style={{ backgroundColor: preset.color }}
                >
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 opacity-0 group-hover/qp:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-10 bg-white/80 px-1 rounded">{preset.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-2">텍스트 선택 후 클릭하면 색상 적용 · 미선택 시 색상코드 복사</p>
          </div>

          {/* 상단 강조 라인 */}
          <div>
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />상단 강조 라인
              <button onClick={() => resetStyleGroup(['headerLineColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const val = data.headerLineColor || (data.reportType === '장전' ? '#0f172a' : '#191f28');
                return (
                  <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">라인 색상</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val} onChange={(e) => onChange({ ...data, headerLineColor: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, headerLineColor: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, headerLineColor: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {data.headerLineColor && <button onClick={() => onChange({ ...data, headerLineColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })()}
            </div>
          </div>

          {/* 헤더 뱃지 (MORNING REPORT / CLOSING REPORT) */}
          <div>
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />헤더 뱃지
              <button onClick={() => resetStyleGroup(['headerBadgeColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const val = data.headerBadgeColor || (data.reportType === '장전' ? '#0ea5e9' : '#f59e0b');
                return (
                  <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">뱃지 색상</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val} onChange={(e) => onChange({ ...data, headerBadgeColor: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, headerBadgeColor: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, headerBadgeColor: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {data.headerBadgeColor && <button onClick={() => onChange({ ...data, headerBadgeColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })()}
            </div>
          </div>

          {/* 현재 지표 */}
          <div id="style-sub-indicator">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />현재 지표
              <button onClick={() => resetStyleGroup(['indicatorBoxColor','indicatorLabelSize','indicatorLabelWeight','indicatorValueSize','indicatorValueWeight','indicatorChangeSize','indicatorChangeWeight'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                const val = data.indicatorBoxColor || '#f8fafc';
                return (
                  <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">박스 색상</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val} onChange={(e) => onChange({ ...data, indicatorBoxColor: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, indicatorBoxColor: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, indicatorBoxColor: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {data.indicatorBoxColor && <button onClick={() => onChange({ ...data, indicatorBoxColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })()}
              {/* 지표 텍스트 스타일 */}
              {([
                { title: '라벨', sizeKey: 'indicatorLabelSize', weightKey: 'indicatorLabelWeight', defaultSize: 16, colorKey: 'indicatorLabelColor', defaultColor: '#64748b' },
                { title: '값', sizeKey: 'indicatorValueSize', weightKey: 'indicatorValueWeight', defaultSize: 18, colorKey: 'indicatorValueColor', defaultColor: '#0f172a' },
                { title: '등락률', sizeKey: 'indicatorChangeSize', weightKey: 'indicatorChangeWeight', defaultSize: 14, colorKey: '', defaultColor: '' },
              ] as Array<{title:string; sizeKey:string; weightKey:string; defaultSize:number; colorKey:string; defaultColor:string}>).map(({ title, sizeKey, weightKey, defaultSize, colorKey, defaultColor }) => {
                const curSize = (data as any)[sizeKey] ?? defaultSize;
                const curWeight = (data as any)[weightKey] ?? '800';
                const curColor = colorKey ? ((data as any)[colorKey] || defaultColor) : '';
                return (
                  <div key={sizeKey} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 w-[90px] shrink-0">📊 {title}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onChange({ ...data, [sizeKey]: Math.max(8, curSize - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                      <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{curSize}</span>
                      <button onClick={() => onChange({ ...data, [sizeKey]: Math.min(30, curSize + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                      <select value={curWeight} onChange={(e) => onChange({ ...data, [weightKey]: e.target.value })} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.5">
                        <option value="400">Regular</option>
                        <option value="600">Semi</option>
                        <option value="700">Bold</option>
                        <option value="800">Extra</option>
                        <option value="900">Black</option>
                      </select>
                      {colorKey && <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: curColor }} title={`텍스트 색상: ${curColor}`} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 전일 미증시 섹터 트렌드 */}
          <div id="style-sub-sector">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />섹터 트렌드
              <button onClick={() => resetStyleGroup(['sectorTrendHeaderColor','sectorTrendSubHeaderColor','sectorTrendTableTextColor','sectorTrendTableTextSize','sectorTrendNameSize','sectorTrendNameWeight','sectorTrendIssueSize','sectorTrendIssueWeight'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'sectorTrendHeaderColor' as const, label: '헤더 색상', def: '#e2e8f0' },
                { key: 'sectorTrendSubHeaderColor' as const, label: '소메뉴 헤더 색상', def: '#f1f5f9' },
                { key: 'sectorTrendTableTextColor' as const, label: '테이블 텍스트 색상', def: '#334155' },
              ].map(({ key, label, def }) => {
                const val = (data as any)[key] || def;
                return (
                  <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val} onChange={(e) => onChange({ ...data, [key]: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, [key]: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, [key]: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {(data as any)[key] && <button onClick={() => onChange({ ...data, [key]: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })}
              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">테이블 텍스트 크기</span>
                <div className="flex items-center gap-1.5">
                  <select value={data.sectorTrendTableTextSize || 16} onChange={(e) => onChange({ ...data, sectorTrendTableTextSize: Number(e.target.value) })} className="text-[11px] font-bold bg-white border border-slate-200 rounded px-2 py-1">
                    {[12, 13, 14, 15, 16, 17, 18].map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                  {data.sectorTrendTableTextSize && <button onClick={() => onChange({ ...data, sectorTrendTableTextSize: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                </div>
              </label>
              {/* 섹터 텍스트 스타일 */}
              {([
                { title: '섹터명', sizeKey: 'sectorTrendNameSize', weightKey: 'sectorTrendNameWeight', defaultSize: 17, colorKey: 'sectorTrendTableTextColor', defaultColor: '#334155' },
                { title: '이슈', sizeKey: 'sectorTrendIssueSize', weightKey: 'sectorTrendIssueWeight', defaultSize: 16, colorKey: 'sectorTrendTableTextColor', defaultColor: '#334155' },
              ] as Array<{title:string; sizeKey:string; weightKey:string; defaultSize:number; colorKey:string; defaultColor:string}>).map(({ title, sizeKey, weightKey, defaultSize, colorKey, defaultColor }) => {
                const curSize = (data as any)[sizeKey] ?? defaultSize;
                const curWeight = (data as any)[weightKey] ?? '800';
                const curColor = colorKey ? ((data as any)[colorKey] || defaultColor) : '';
                return (
                  <div key={sizeKey} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 w-[90px] shrink-0">🏷️ {title}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onChange({ ...data, [sizeKey]: Math.max(8, curSize - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                      <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{curSize}</span>
                      <button onClick={() => onChange({ ...data, [sizeKey]: Math.min(30, curSize + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                      <select value={curWeight} onChange={(e) => onChange({ ...data, [weightKey]: e.target.value })} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.5">
                        <option value="400">Regular</option>
                        <option value="600">Semi</option>
                        <option value="700">Bold</option>
                        <option value="800">Extra</option>
                        <option value="900">Black</option>
                      </select>
                      {colorKey && <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: curColor }} title={`텍스트 색상: ${curColor}`} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 전일 미증시 마감 분석 */}
          <div id="style-sub-usAnalysis">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />마감 분석
              <button onClick={() => resetStyleGroup(['usAnalysisHeaderColor','usAnalysisBoxColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'usAnalysisHeaderColor' as const, label: '헤더 색상', def: '#0ea5e9' },
                { key: 'usAnalysisBoxColor' as const, label: '내용 박스 색상', def: '#fafafa' },
              ].map(({ key, label, def }) => {
                const val = (data as any)[key] || def;
                return (
                  <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val} onChange={(e) => onChange({ ...data, [key]: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, [key]: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, [key]: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {(data as any)[key] && <button onClick={() => onChange({ ...data, [key]: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })}
              {/* 본문 텍스트 크기/색상 */}
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">📝 본문 텍스트</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onChange({ ...data, usAnalysisTextSize: Math.max(10, (data.usAnalysisTextSize || 16) - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{data.usAnalysisTextSize || 16}</span>
                  <button onClick={() => onChange({ ...data, usAnalysisTextSize: Math.min(24, (data.usAnalysisTextSize || 16) + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                  <input type="color" value={data.usAnalysisTextColor || '#fafafa'} onChange={(e) => onChange({ ...data, usAnalysisTextColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-slate-200" />
                  {(data.usAnalysisTextSize || data.usAnalysisTextColor) && <button onClick={() => onChange({ ...data, usAnalysisTextSize: undefined, usAnalysisTextColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                </div>
              </div>
            </div>
          </div>

          {/* [마감 전용] 마감 섹션 공통 색상 */}
          {data.reportType === '마감' && (
            <div id="style-sub-closing">
              <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />마감 섹션 색상
                <button onClick={() => resetStyleGroup(['closingHeaderColor','closingHeaderTextColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'closingHeaderColor' as const, label: '섹션 헤더 배경', def: '#f59e0b' },
                  { key: 'closingHeaderTextColor' as const, label: '섹션 헤더 텍스트', def: '#1e293b' },
                ].map(({ key, label, def }) => {
                  const val = (data as any)[key] || def;
                  return (
                    <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={val} onChange={(e) => onChange({ ...data, [key]: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                        <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, [key]: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, [key]: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                        {(data as any)[key] && <button onClick={() => onChange({ ...data, [key]: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 전일 국내증시 특징 */}
          <div id="style-sub-domestic">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />국내증시 특징
              <button onClick={() => resetStyleGroup(['domesticTextSize','domesticTextColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">📝 본문 텍스트</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onChange({ ...data, domesticTextSize: Math.max(10, (data.domesticTextSize || 16) - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{data.domesticTextSize || 16}</span>
                  <button onClick={() => onChange({ ...data, domesticTextSize: Math.min(24, (data.domesticTextSize || 16) + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                  <input type="color" value={data.domesticTextColor || '#334155'} onChange={(e) => onChange({ ...data, domesticTextColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-slate-200" />
                  {(data.domesticTextSize || data.domesticTextColor) && <button onClick={() => onChange({ ...data, domesticTextSize: undefined, domesticTextColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                </div>
              </div>
            </div>
          </div>

          {/* 오늘의 핵심 테마 */}
          <div id="style-sub-theme">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />핵심 테마
              <button onClick={() => resetStyleGroup(['themeHeaderColor','themeCardHeaderColor','themeChipColor','themeChipTextColor','themeNameSize','themeNameWeight','themeIssueSize','themeIssueWeight'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'themeHeaderColor' as const, label: '메인 헤더 색상', def: '#e2e8f0' },
                { key: 'themeCardHeaderColor' as const, label: '소메뉴 헤더 색상', def: '#f1f5f9' },
                { key: 'themeChipColor' as const, label: '종목 칩 색상', def: '#f1f5f9' },
                { key: 'themeChipTextColor' as const, label: '칩 텍스트 색상', def: '#334155' },
              ].map(({ key, label, def }) => {
                const val = (data as any)[key] || def;
                return (
                  <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val} onChange={(e) => onChange({ ...data, [key]: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, [key]: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, [key]: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {(data as any)[key] && <button onClick={() => onChange({ ...data, [key]: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })}
              {/* 테마 텍스트 스타일 */}
              {([
                { title: '테마명', sizeKey: 'themeNameSize', weightKey: 'themeNameWeight', defaultSize: 17, colorKey: '', defaultColor: '' },
                { title: '이슈', sizeKey: 'themeIssueSize', weightKey: 'themeIssueWeight', defaultSize: 16, colorKey: '', defaultColor: '' },
              ] as Array<{title:string; sizeKey:string; weightKey:string; defaultSize:number; colorKey:string; defaultColor:string}>).map(({ title, sizeKey, weightKey, defaultSize, colorKey, defaultColor }) => {
                const curSize = (data as any)[sizeKey] ?? defaultSize;
                const curWeight = (data as any)[weightKey] ?? '800';
                const curColor = colorKey ? ((data as any)[colorKey] || defaultColor) : '';
                return (
                  <div key={sizeKey} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 w-[90px] shrink-0">⭐ {title}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onChange({ ...data, [sizeKey]: Math.max(8, curSize - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                      <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{curSize}</span>
                      <button onClick={() => onChange({ ...data, [sizeKey]: Math.min(30, curSize + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                      <select value={curWeight} onChange={(e) => onChange({ ...data, [weightKey]: e.target.value })} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.5">
                        <option value="400">Regular</option>
                        <option value="600">Semi</option>
                        <option value="700">Bold</option>
                        <option value="800">Extra</option>
                        <option value="900">Black</option>
                      </select>
                      {colorKey && <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: curColor }} title={`텍스트 색상: ${curColor}`} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 핵심 금일 시장 전략 */}
          <div id="style-sub-strategy">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />시장 전략
              <button onClick={() => resetStyleGroup(['strategyBoxColor','stockChipColor','strategyTextSize','strategyTextColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'strategyBoxColor' as const, label: '박스 색상', def: '#1e293b' },
                { key: 'stockChipColor' as const, label: '종목 칩 색상', def: '#ffffff40' },
              ].map(({ key, label, def }) => {
                const val = (data as any)[key] || def;
                return (
                  <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={val.length <= 7 ? val : val.slice(0,7)} onChange={(e) => onChange({ ...data, [key]: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                      <input type="text" value={val} onChange={(e) => { if (/^#[0-9a-fA-F]{0,8}$/.test(e.target.value) || e.target.value === '') onChange({ ...data, [key]: e.target.value || undefined }); }} onPaste={(e) => { const pasted = e.clipboardData.getData('text').trim(); if (/^#[0-9a-fA-F]{3,8}$/.test(pasted)) { e.preventDefault(); onChange({ ...data, [key]: pasted }); }}} className="w-[72px] text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-1 text-center" />
                      {(data as any)[key] && <button onClick={() => onChange({ ...data, [key]: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                    </div>
                  </label>
                );
              })}
              {/* 본문 텍스트 크기/색상 */}
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">📝 본문 텍스트</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onChange({ ...data, strategyTextSize: Math.max(10, (data.strategyTextSize || 18) - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{data.strategyTextSize || 18}</span>
                  <button onClick={() => onChange({ ...data, strategyTextSize: Math.min(28, (data.strategyTextSize || 18) + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                  <input type="color" value={data.strategyTextColor || '#e6e6e6'} onChange={(e) => onChange({ ...data, strategyTextColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-slate-200" />
                  {(data.strategyTextSize || data.strategyTextColor) && <button onClick={() => onChange({ ...data, strategyTextSize: undefined, strategyTextColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 면책·페이지번호 */}
          <div id="style-sub-footer">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400" />면책·페이지번호
              <button onClick={() => resetStyleGroup(['disclaimerTextSize','disclaimerTextColor','pageNumberSize','pageNumberColor'])} className="ml-auto text-[9px] text-slate-300 hover:text-red-500 transition-colors" title="초기화"><RotateCcw size={10} /></button>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">📝 면책 텍스트</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onChange({ ...data, disclaimerTextSize: Math.max(5, (data.disclaimerTextSize || 7) - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{data.disclaimerTextSize || 7}</span>
                  <button onClick={() => onChange({ ...data, disclaimerTextSize: Math.min(14, (data.disclaimerTextSize || 7) + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                  <input type="color" value={data.disclaimerTextColor || '#64748b'} onChange={(e) => onChange({ ...data, disclaimerTextColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-slate-200" />
                  {(data.disclaimerTextSize || data.disclaimerTextColor) && <button onClick={() => onChange({ ...data, disclaimerTextSize: undefined, disclaimerTextColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">#️⃣ 페이지 번호</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onChange({ ...data, pageNumberSize: Math.max(5, (data.pageNumberSize || 7) - 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">−</button>
                  <span className="text-[11px] font-mono font-bold text-slate-700 w-[26px] text-center">{data.pageNumberSize || 7}</span>
                  <button onClick={() => onChange({ ...data, pageNumberSize: Math.min(14, (data.pageNumberSize || 7) + 1) })} className="w-5 h-5 rounded bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300">+</button>
                  <input type="color" value={data.pageNumberColor || '#64748b'} onChange={(e) => onChange({ ...data, pageNumberColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-slate-200" />
                  {(data.pageNumberSize || data.pageNumberColor) && <button onClick={() => onChange({ ...data, pageNumberSize: undefined, pageNumberColor: undefined })} className="text-[9px] text-slate-400 hover:text-red-500">✕</button>}
                </div>
              </div>
            </div>
          </div>

          {/* 색상 프리셋 저장/불러오기 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" />저장된 색상 프리셋
              </h4>
              <span className="text-[9px] text-slate-400">{colorPresets.length}/5</span>
            </div>
            <button
              onClick={handleSaveColorPreset}
              disabled={colorPresets.length >= 5}
              className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                colorPresets.length >= 5
                  ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                  : "border-violet-200 text-violet-500 hover:text-violet-700 hover:border-violet-400 hover:bg-violet-50/50 bg-white"
              }`}
            >
              💾 현재 색상 저장 {colorPresets.length >= 5 && "(슬롯 꽉참)"}
            </button>
            {colorPresets.length > 0 && (
              <div className="space-y-1">
                {colorPresets.map((preset) => {
                  // 저장된 색상 중 최대 5개를 미리보기 원으로 표시
                  const previewColors = Object.values(preset.colors).filter(v => typeof v === 'string' && v.startsWith('#')).slice(0, 5);
                  return (
                    <div key={preset.id} className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100 group/preset">
                      <div className="flex gap-0.5 shrink-0">
                        {previewColors.map((c, i) => (
                          <span key={i} className="w-3 h-3 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: c as string }} />
                        ))}
                        {previewColors.length === 0 && <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />}
                      </div>
                      <input
                        type="text"
                        value={preset.name}
                        onChange={(e) => handleRenamePreset(preset.id, e.target.value)}
                        className="text-[10px] font-bold text-slate-600 flex-1 truncate bg-transparent outline-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-violet-300 rounded px-1 py-0.5 transition-all min-w-0"
                        title="클릭하여 이름 변경"
                      />
                      <span className="text-[9px] text-slate-400 shrink-0">{preset.savedAt}</span>
                      <button
                        onClick={() => handleLoadColorPreset(preset)}
                        className="text-[9px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-600 hover:bg-violet-200 rounded transition-colors shrink-0"
                      >
                        적용
                      </button>
                      <button
                        onClick={() => { if (confirm(`"${preset.name}" 프리셋을 삭제하시겠습니까?`)) handleDeleteColorPreset(preset.id); }}
                        className="text-[9px] text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/preset:opacity-100 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 전체 초기화 — 작은 버튼 */}
          <button
            onClick={() => {
              if (!confirm('모든 스타일 설정을 기본값으로 초기화하시겠습니까?')) return;
              const resetColors: Record<string, any> = {};
              COLOR_KEYS.forEach(key => { resetColors[key] = undefined; });
              onChange({ ...data, ...resetColors });
            }}
            className="w-full py-1 border border-dashed border-red-200 rounded-md text-[10px] font-bold text-red-300 hover:text-red-500 hover:border-red-400 hover:bg-red-50/50 transition-all"
          >
            스타일 초기화
          </button>
        </div>
        </div>}
      </div>

      {/* Editor Sections */}
      <div className="space-y-3">
        {/* 1. Basic Setup */}
        <AccordionSection
          id="setup"
          label="기본 설정"
          icon={<Settings size={14} />}
          isOpen={activeSection === 'setup'}
          onToggle={() => toggleSection('setup')}
          summary={`${data.reportType} | ${data.date}`}

        >
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>발행 일자 <FieldTip text="리포트 상단에 표시되는 날짜입니다. 예: 2026년 2월 10일(월)" /></label>
              <input type="text" value={data.date} onChange={(e) => handleChange('date', e.target.value)} className={`${inputStyle} mt-1.5`} placeholder="2026년 2월 10일(월)" />
            </div>
            <div>
              <label className={labelStyle}>메인 타이틀 <FieldTip text="리포트 최상단 제목입니다. 모드에 따라 자동 설정됩니다." /></label>
              <input type="text" value={data.title} onChange={(e) => handleChange('title', e.target.value)} className={`${inputStyle} mt-1.5`} />
            </div>
          </div>
        </AccordionSection>

        {/* 2. Indicators */}
        <AccordionSection
          id="indicators"
          label={data.summaryTitle}
          icon={<BarChart3 size={14} />}
          isOpen={activeSection === 'indicators'}
          onToggle={() => toggleSection('indicators')}
          summary={data.summaryItems.map(i => `${i.label} ${i.subText}`).join(' · ')}
          summaryNode={
            lastFetched ? (
              <p className="text-[11px] font-bold truncate max-w-[360px] mt-0.5" style={{ color: '#dc2626' }}>
                ✅ 업데이트됨 {lastFetched}
              </p>
            ) : isFetching ? (
              <p className="text-[11px] text-amber-500 font-medium truncate max-w-[360px] mt-0.5">
                ⏳ 데이터 로딩 중...
              </p>
            ) : undefined
          }


        >
          <div className="space-y-3">
            {data.summaryItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <input type="text" value={item.label} onChange={(e) => updateArrayItem('summaryItems', idx, 'label', e.target.value)} className={`${inputStyle} flex-1 !py-1.5 !text-[11px] font-black`} placeholder="지표명" />
                  <select value={item.trend} onChange={(e) => updateArrayItem('summaryItems', idx, 'trend', e.target.value)} className={`${inputStyle} !w-16 !py-1.5 !text-[11px]`}>
                    <option value="up">▲</option>
                    <option value="down">▼</option>
                    <option value="neutral">—</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={item.value} onChange={(e) => updateArrayItem('summaryItems', idx, 'value', e.target.value)} className={inputStyle} placeholder="값 (EX. 5,124.55)" />
                  <input type="text" value={item.subText} onChange={(e) => updateArrayItem('summaryItems', idx, 'subText', e.target.value)} className={inputStyle} placeholder="변동률 (EX. +0.35%)" />
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* 3. Core View */}
        <AccordionSection
          id="coreview"
          label={data.coreViewTitle}
          icon={<Eye size={14} />}
          isOpen={activeSection === 'coreview'}
          onToggle={() => toggleSection('coreview')}
          summary={data.currentMarketView.substring(0, 60) + '...'}

        >
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>핵심 분석 <FieldTip text="오늘 시장의 핵심을 2-3문장으로 요약하세요. 이 영역이 리포트의 첫인상을 결정합니다." /></label>
              <textarea value={data.currentMarketView} onChange={(e) => handleChange('currentMarketView', e.target.value)} className={`${inputStyle} mt-1.5 min-h-[100px] resize-y`} placeholder={data.reportType === '장전' ? 'EX. 미국 증시 강세에 따른 국내 시장 갭업 출발 전망...' : 'EX. 오늘 국내 증시는 외인 매수세에 힘입어...'} />
            </div>
          </div>
        </AccordionSection>

        {/* 4. Featured Stocks */}
        <AccordionSection
          id="stocks"
          label={data.featuredStocksTitle}
          icon={<Star size={14} />}
          isOpen={activeSection === 'stocks'}
          onToggle={() => toggleSection('stocks')}
           summary={data.featuredStocks.map(s => s.keyword).join(', ')}


        >
          <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('featuredStocks')}>
              <SortableContext items={data.featuredStocks.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {data.featuredStocks.map((group, idx) => (
                  <SortableItem key={group.id} id={group.id} onRemove={() => removeItem('featuredStocks', idx)} canRemove={data.featuredStocks.length > MIN_ITEMS}>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <input type="text" value={group.keyword} onChange={(e) => updateArrayItem('featuredStocks', idx, 'keyword', e.target.value)} className={inputStyle} placeholder="테마 키워드 (EX. AI 반도체)" />
                      <div className="space-y-1 pl-2 border-l-2 border-blue-200">
                        {group.stocks.map((stock, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-3 gap-1">
                            <input type="text" value={stock.name} onChange={(e) => {
                              const newStocks = [...group.stocks];
                              newStocks[sIdx] = { ...newStocks[sIdx], name: e.target.value };
                              updateArrayItem('featuredStocks', idx, 'stocks', newStocks);
                            }} className={inputStyle} placeholder="종목명" />
                            <input type="text" value={stock.price} onChange={(e) => {
                              const newStocks = [...group.stocks];
                              newStocks[sIdx] = { ...newStocks[sIdx], price: e.target.value };
                              updateArrayItem('featuredStocks', idx, 'stocks', newStocks);
                            }} className={inputStyle} placeholder="가격" />
                            <input type="text" value={stock.change} onChange={(e) => {
                              const newStocks = [...group.stocks];
                              newStocks[sIdx] = { ...newStocks[sIdx], change: e.target.value };
                              updateArrayItem('featuredStocks', idx, 'stocks', newStocks);
                            }} className={inputStyle} placeholder="등락률" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            {data.featuredStocks.length < MAX_STOCKS && (
              <button onClick={() => addItem('featuredStocks')} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-[13px] font-bold text-blue-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> 테마 추가
              </button>
            )}
          </div>
        </AccordionSection>

        {/* 5. Expert Insight */}
        <AccordionSection
          id="insight"
          label={data.expertAnalysisTitle}
          icon={<PenTool size={14} />}
          isOpen={activeSection === 'insight'}
          onToggle={() => toggleSection('insight')}

        >
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>인사이트 본문 <FieldTip text="BLUF(Bottom Line Up Front) 스타일: 결론을 먼저, 근거를 뒤에 배치하세요." /></label>
              <textarea value={data.expertAnalysis} onChange={(e) => handleChange('expertAnalysis', e.target.value)} className={`${inputStyle} mt-1.5 min-h-[120px] resize-y`} placeholder={data.reportType === '장전' ? 'EX. 오늘 시장은 미국 증시 강세의 여파로...' : 'EX. 금일 장 마감 후 종합적으로 분석하면...'} />
            </div>
            <div>
              <label className={labelStyle}>핵심 관심 종목 <FieldTip text="쉼표로 구분하여 입력. 예: 알테오젠, HLB, 현대중공업" /></label>
              <input type="text" value={data.expertInterestedStocks} onChange={(e) => handleChange('expertInterestedStocks', e.target.value)} className={`${inputStyle} mt-1.5`} placeholder="EX. 알테오젠, HLB, 현대중공업" />
            </div>
          </div>
        </AccordionSection>

        {/* 6. Sectors */}
        <AccordionSection
          id="sectors"
          label={data.sectorsTitle}
          icon={<Layers size={14} />}
          isOpen={activeSection === 'sectors'}
          onToggle={() => toggleSection('sectors')}


        >
          <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('sectors')}>
              <SortableContext items={data.sectors.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {data.sectors.map((sector, idx) => (
                  <SortableItem key={sector.id} id={sector.id} onRemove={() => removeItem('sectors', idx)} canRemove={data.sectors.length > MIN_ITEMS}>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5 border-l-4 border-l-slate-900">
                      <div className="flex gap-2">
                        <input type="text" value={sector.name} onChange={(e) => updateArrayItem('sectors', idx, 'name', e.target.value)} className={`${inputStyle} flex-1`} placeholder="섹터명" />
                        <select value={sector.sentiment} onChange={(e) => updateArrayItem('sectors', idx, 'sentiment', e.target.value)} className={`${inputStyle} w-20`}>
                          <option value="긍정">긍정</option>
                          <option value="중립">중립</option>
                          <option value="부정">부정</option>
                          <option value="공략">공략</option>
                        </select>
                      </div>
                      <textarea value={sector.issue} onChange={(e) => updateArrayItem('sectors', idx, 'issue', e.target.value)} className={`${inputStyle} min-h-[50px]`} placeholder="이슈 분석" />
                      <input type="text" value={sector.stocks} onChange={(e) => updateArrayItem('sectors', idx, 'stocks', e.target.value)} className={inputStyle} placeholder="관련주 (쉼표 구분)" />
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            {data.sectors.length < MAX_SECTORS && (
              <button onClick={() => addItem('sectors')} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-[13px] font-bold text-blue-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> 섹터 추가
              </button>
            )}
          </div>
        </AccordionSection>

        {/* 7. Schedule */}
        <AccordionSection
          id="schedule"
          label={data.scheduleTitle}
          icon={<Calendar size={14} />}
          isOpen={activeSection === 'schedule'}
          onToggle={() => toggleSection('schedule')}


        >
          <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('marketSchedule')}>
              <SortableContext items={data.marketSchedule.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {data.marketSchedule.map((item, idx) => (
                  <SortableItem key={item.id} id={item.id} onRemove={() => removeItem('marketSchedule', idx)} canRemove={data.marketSchedule.length > MIN_ITEMS}>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <input type="text" value={item.time} onChange={(e) => updateArrayItem('marketSchedule', idx, 'time', e.target.value)} className={`${inputStyle} w-24`} placeholder="08:30" />
                      <textarea value={item.event} onChange={(e) => updateArrayItem('marketSchedule', idx, 'event', e.target.value)} className={`${inputStyle} w-full min-h-[60px]`} placeholder="일정 내용" />
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            {data.marketSchedule.length < MAX_SCHEDULE && (
              <button onClick={() => addItem('marketSchedule')} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-[13px] font-bold text-blue-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> 일정 추가
              </button>
            )}
          </div>
        </AccordionSection>

        {/* 8. Daily Comment */}
        <AccordionSection
          id="comment"
          label="오늘의 한마디"
          icon={<MessageSquare size={14} />}
          isOpen={activeSection === 'comment'}
          onToggle={() => toggleSection('comment')}
          summary={data.dailyComment?.substring(0, 50) + '...'}

        >
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>투자자에게 전하는 한마디 <FieldTip text="리포트 하단에 표시되는 데일리 코멘트입니다. 짧고 임팩트 있게 작성하세요." /></label>
              <textarea value={data.dailyComment || ''} onChange={(e) => handleChange('dailyComment', e.target.value)} className={`${inputStyle} mt-1.5 min-h-[80px] resize-y`} placeholder="EX. 변동성이 큰 장세에서는 포지션 사이즈 조절이 핵심입니다." />
            </div>
          </div>
        </AccordionSection>
      </div>
      {/* 인라인 복사 토스트 */}
      {copyToast && (
        <div
          className="fixed z-[200] pointer-events-none animate-fade-in"
          style={{ left: copyToast.x, top: copyToast.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-bold flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[9px]">✓</span>
            {copyToast.text} 복사됨
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportEditor;
