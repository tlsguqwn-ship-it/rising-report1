import React, { useState, useEffect } from 'react';
import { ReportData, Sector, FeaturedStock, MarketSchedule } from '../types';
import { PRE_MARKET_REPORT_TEMPLATE, CLOSE_REPORT_TEMPLATE, createEmptySector, createEmptyStock, createEmptySchedule, MAX_SECTORS, MAX_STOCKS, MAX_SCHEDULE, MIN_ITEMS } from '../constants';
import { fetchMarketIndicators } from '../services/gemini';
import {
  ChevronDown, Plus, Trash2, GripVertical, Loader2, RotateCcw,
  Settings, BarChart3, Eye, Star, PenTool, Layers, Calendar, Info, MessageSquare, Save, RefreshCw, Clock, History
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
  children: React.ReactNode;
}> = ({ label, icon, isOpen, onToggle, summary, summaryNode, badge, children }) => (
  <div className={`overflow-hidden transition-all duration-200 border ${isOpen ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-900/5' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'} rounded-2xl`}>
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
          {!isOpen && summaryNode ? summaryNode : (!isOpen && summary && <p className="text-[11px] text-slate-400 font-medium truncate max-w-[360px] mt-0.5">{summary}</p>)}
        </div>
      </div>
      <ChevronDown size={16} className={`text-slate-300 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-slate-600' : ''}`} />
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
const ReportEditor: React.FC<Props> = ({ data, onChange, activeSection, onSectionChange, onSave, onFullReset, templateHistory = [], onRestoreHistory }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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
        // 지표 업데이트 후 자동 저장
        if (onSave) setTimeout(() => onSave(), 100);
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
    <div className="pb-8 space-y-3.5">
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
      {templateHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                <History size={13} className="text-slate-500" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-slate-700">저장 히스토리</span>
                <span className="text-[10px] text-slate-400 ml-2">최근 {templateHistory.length}개</span>
              </div>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          {showHistory && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
              {templateHistory.map((entry, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (confirm(`${entry.savedAt} 시점의 템플릿으로 복원하시겠습니까?`)) {
                      onRestoreHistory?.(entry.data);
                    }
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                        #{idx + 1}
                      </span>
                      <span className="text-[12px] font-bold text-slate-700">{entry.savedAt}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      복원
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {entry.data.title} · {entry.data.featuredStocks?.map(s => s.name).filter(Boolean).join(', ') || '데이터 없음'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}


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
          badge={`${data.summaryItems.length}개`}
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
              <label className={labelStyle}>섹션 제목 <FieldTip text="핵심시각 영역의 제목. 장전=MORNING CORE VIEW, 마감=MARKET CORE VIEW" /></label>
              <input type="text" value={data.coreViewTitle} onChange={(e) => handleChange('coreViewTitle', e.target.value)} className={`${inputStyle} mt-1.5`} />
            </div>
            <div>
              <label className={labelStyle}>핵심 분석 <FieldTip text="오늘 시장의 핵심을 2-3문장으로 요약하세요. 이 영역이 리포트의 첫인상을 결정합니다." /></label>
              <textarea value={data.currentMarketView} onChange={(e) => handleChange('currentMarketView', e.target.value)} className={`${inputStyle} mt-1.5 min-h-[100px] resize-y`} />
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
          summary={data.featuredStocks.map(s => s.name).join(', ')}
          badge={`${data.featuredStocks.length}/${MAX_STOCKS}`}
        >
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>섹션 제목</label>
              <input type="text" value={data.featuredStocksTitle} onChange={(e) => handleChange('featuredStocksTitle', e.target.value)} className={`${inputStyle} mt-1.5`} />
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('featuredStocks')}>
              <SortableContext items={data.featuredStocks.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {data.featuredStocks.map((stock, idx) => (
                  <SortableItem key={stock.id} id={stock.id} onRemove={() => removeItem('featuredStocks', idx)} canRemove={data.featuredStocks.length > MIN_ITEMS}>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={stock.name} onChange={(e) => updateArrayItem('featuredStocks', idx, 'name', e.target.value)} className={inputStyle} placeholder="종목/키워드" />
                        <input type="text" value={stock.change} onChange={(e) => updateArrayItem('featuredStocks', idx, 'change', e.target.value)} className={inputStyle} placeholder="변동/관련주" />
                      </div>
                      <input type="text" value={stock.reason} onChange={(e) => updateArrayItem('featuredStocks', idx, 'reason', e.target.value)} className={inputStyle} placeholder="분석 사유" />
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            {data.featuredStocks.length < MAX_STOCKS && (
              <button onClick={() => addItem('featuredStocks')} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-[13px] font-bold text-blue-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> 종목 추가
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelStyle}>메인 타이틀</label>
                <input type="text" value={data.expertAnalysisTitle} onChange={(e) => handleChange('expertAnalysisTitle', e.target.value)} className={`${inputStyle} mt-1.5`} />
              </div>
              <div>
                <label className={labelStyle}>서브 타이틀</label>
                <input type="text" value={data.expertAnalysisSubtitle} onChange={(e) => handleChange('expertAnalysisSubtitle', e.target.value)} className={`${inputStyle} mt-1.5`} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>인사이트 본문 <FieldTip text="BLUF(Bottom Line Up Front) 스타일: 결론을 먼저, 근거를 뒤에 배치하세요." /></label>
              <textarea value={data.expertAnalysis} onChange={(e) => handleChange('expertAnalysis', e.target.value)} className={`${inputStyle} mt-1.5 min-h-[120px] resize-y`} />
            </div>
            <div>
              <label className={labelStyle}>핵심 관심 종목 <FieldTip text="쉼표로 구분하여 입력. 예: 알테오젠, HLB, 현대중공업" /></label>
              <input type="text" value={data.expertInterestedStocks} onChange={(e) => handleChange('expertInterestedStocks', e.target.value)} className={`${inputStyle} mt-1.5`} />
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
          badge={`${data.sectors.length}/${MAX_SECTORS}`}
        >
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>섹션 제목</label>
              <input type="text" value={data.sectorsTitle} onChange={(e) => handleChange('sectorsTitle', e.target.value)} className={`${inputStyle} mt-1.5`} />
            </div>
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
          badge={`${data.marketSchedule.length}/${MAX_SCHEDULE}`}
        >
          <div className="space-y-3">
            <div>
              <label className={labelStyle}>섹션 제목</label>
              <input type="text" value={data.scheduleTitle} onChange={(e) => handleChange('scheduleTitle', e.target.value)} className={`${inputStyle} mt-1.5`} />
            </div>
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
    </div>
  );
};

export default ReportEditor;
