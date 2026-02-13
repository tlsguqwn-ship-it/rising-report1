import React, { useCallback } from 'react';
import { ReportData, MarketSummaryItem, Sector, ThemeGroup, MarketSchedule } from '../types';
import { createEmptySector, createEmptyStock, createEmptySchedule, MAX_SECTORS, MAX_STOCKS, MAX_SCHEDULE } from './morningConstants';
import { getTossIconUrl } from '../lib/tossThemeIcons';

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

/**
 * 장전리포트 에디터 컴포넌트
 * - 기존 ReportEditor.tsx를 건드리지 않는 독립 컴포넌트
 * - 장전 리포트에 필요한 섹션만 포함
 */
export default function MorningEditor({ data, onChange }: Props) {

  const update = useCallback((patch: Partial<ReportData>) => {
    onChange({ ...data, ...patch });
  }, [data, onChange]);

  // 지표 업데이트
  const updateIndicator = (index: number, field: keyof MarketSummaryItem, value: string) => {
    const items = [...data.summaryItems];
    items[index] = { ...items[index], [field]: value };
    // trend 자동 결정
    if (field === 'subText') {
      const num = parseFloat(value.replace(/[^-\d.]/g, ''));
      items[index].trend = num > 0 ? 'up' : num < 0 ? 'down' : 'neutral';
    }
    update({ summaryItems: items });
  };

  const updateSubIndicator = (index: number, field: keyof MarketSummaryItem, value: string) => {
    const items = [...(data.subIndicators || [])];
    items[index] = { ...items[index], [field]: value };
    if (field === 'subText') {
      const num = parseFloat(value.replace(/[^-\d.]/g, ''));
      items[index].trend = num > 0 ? 'up' : num < 0 ? 'down' : 'neutral';
    }
    update({ subIndicators: items });
  };

  // 미증시 섹터 트렌드 업데이트
  const updateUsSector = (index: number, field: keyof Sector, value: string) => {
    const sectors = [...(data.usSectors || [])];
    sectors[index] = { ...sectors[index], [field]: value };
    update({ usSectors: sectors });
  };

  // 핵심 테마 업데이트
  const updateTheme = (index: number, field: string, value: any) => {
    const themes = [...data.featuredStocks];
    if (field === 'keyword' || field === 'sentiment') {
      themes[index] = { ...themes[index], [field]: value };
    }
    update({ featuredStocks: themes });
  };

  const updateThemeStock = (themeIndex: number, stockIndex: number, field: string, value: string) => {
    const themes = [...data.featuredStocks];
    const stocks = [...themes[themeIndex].stocks];
    stocks[stockIndex] = { ...stocks[stockIndex], [field]: value };
    themes[themeIndex] = { ...themes[themeIndex], stocks };
    update({ featuredStocks: themes });
  };

  const addThemeStock = (themeIndex: number) => {
    const themes = [...data.featuredStocks];
    themes[themeIndex] = {
      ...themes[themeIndex],
      stocks: [...themes[themeIndex].stocks, { name: '', price: '', change: '' }],
    };
    update({ featuredStocks: themes });
  };

  const removeThemeStock = (themeIndex: number, stockIndex: number) => {
    const themes = [...data.featuredStocks];
    if (themes[themeIndex].stocks.length <= 1) return;
    themes[themeIndex] = {
      ...themes[themeIndex],
      stocks: themes[themeIndex].stocks.filter((_, i) => i !== stockIndex),
    };
    update({ featuredStocks: themes });
  };

  // 국내 연관 섹터 업데이트
  const updateSector = (index: number, field: keyof Sector, value: string) => {
    const sectors = [...data.sectors];
    sectors[index] = { ...sectors[index], [field]: value };
    update({ sectors });
  };

  // 일정 업데이트
  const updateSchedule = (index: number, field: keyof MarketSchedule, value: string) => {
    const schedules = [...data.marketSchedule];
    schedules[index] = { ...schedules[index], [field]: value };
    update({ marketSchedule: schedules });
  };

  // 테마 추가/삭제
  const addTheme = () => {
    if (data.featuredStocks.length >= MAX_STOCKS) return;
    update({ featuredStocks: [...data.featuredStocks, createEmptyStock()] });
  };
  const removeTheme = (index: number) => {
    if (data.featuredStocks.length <= 1) return;
    update({ featuredStocks: data.featuredStocks.filter((_, i) => i !== index) });
  };

  // 섹터 추가/삭제
  const addSector = () => {
    if (data.sectors.length >= MAX_SECTORS) return;
    update({ sectors: [...data.sectors, createEmptySector()] });
  };
  const removeSector = (index: number) => {
    if (data.sectors.length <= 1) return;
    update({ sectors: data.sectors.filter((_, i) => i !== index) });
  };

  // 일정 추가/삭제
  const addSchedule = () => {
    if (data.marketSchedule.length >= MAX_SCHEDULE) return;
    update({ marketSchedule: [...data.marketSchedule, createEmptySchedule()] });
  };
  const removeSchedule = (index: number) => {
    if (data.marketSchedule.length <= 1) return;
    update({ marketSchedule: data.marketSchedule.filter((_, i) => i !== index) });
  };

  // US 섹터 추가/삭제
  const addUsSector = () => {
    const sectors = data.usSectors || [];
    if (sectors.length >= 8) return;
    const col = sectors.length % 2;
    update({ usSectors: [...sectors, { ...createEmptySector(), column: col }] });
  };
  const removeUsSector = (index: number) => {
    const sectors = data.usSectors || [];
    if (sectors.length <= 1) return;
    update({ usSectors: sectors.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 space-y-5 text-sm">
      {/* ─── 1. 글로벌 지표 ─── */}
      <Section title="📊 미증시 & 글로벌 지표" icon="1">
        <div className="space-y-2">
          {data.summaryItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center">
              <span className="text-slate-400 text-xs truncate">{item.label}</span>
              <input type="text" value={item.value} onChange={e => updateIndicator(i, 'value', e.target.value)}
                className="editor-input" placeholder="수치" />
              <input type="text" value={item.subText} onChange={e => updateIndicator(i, 'subText', e.target.value)}
                className="editor-input" placeholder="등락률" />
            </div>
          ))}
        </div>
        {data.subIndicators && data.subIndicators.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
            <p className="text-xs text-slate-500 mb-1">보조 지표</p>
            {data.subIndicators.map((item, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center">
                <span className="text-slate-400 text-xs truncate">{item.label}</span>
                <input type="text" value={item.value} onChange={e => updateSubIndicator(i, 'value', e.target.value)}
                  className="editor-input" placeholder="수치" />
                <input type="text" value={item.subText} onChange={e => updateSubIndicator(i, 'subText', e.target.value)}
                  className="editor-input" placeholder="등락률" />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ─── 2. 핵심 시황 요약 ─── */}
      <Section title="🎯 모닝 핵심 시황" icon="2">
        <textarea value={data.currentMarketView} onChange={e => update({ currentMarketView: e.target.value })}
          className="editor-textarea h-20" placeholder="오늘의 핵심 시황을 입력하세요..." />
      </Section>

      {/* ─── 3. 전일 미증시 섹터 트렌드 ─── */}
      <Section title="🌐 전일 미증시 섹터 트렌드" icon="3"
        onAdd={addUsSector} addLabel="섹터 추가">
        <div className="space-y-3">
          {(data.usSectors || []).map((sector, i) => (
            <div key={sector.id || i} className="bg-slate-800/50 rounded-lg p-3 space-y-2 relative group">
              <button onClick={() => removeUsSector(i)}
                className="absolute top-1 right-1 text-red-400/60 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <input type="text" value={sector.name} onChange={e => updateUsSector(i, 'name', e.target.value)}
                  className="editor-input font-medium" placeholder="섹터명" />
                <select value={sector.sentiment} onChange={e => updateUsSector(i, 'sentiment', e.target.value)}
                  className="editor-input text-xs">
                  <option value="긍정">🟢 긍정</option>
                  <option value="중립">🟡 중립</option>
                  <option value="부정">🔴 부정</option>
                </select>
              </div>
              <input type="text" value={sector.issue} onChange={e => updateUsSector(i, 'issue', e.target.value)}
                className="editor-input" placeholder="이슈 요약" />
              <input type="text" value={sector.stocks} onChange={e => updateUsSector(i, 'stocks', e.target.value)}
                className="editor-input" placeholder="관련 종목 (쉼표 구분)" />
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 4. 전일 미증시 마감 분석 ─── */}
      <Section title="📝 전일 미증시 마감 분석" icon="4">
        <textarea value={data.usMarketAnalysis} onChange={e => update({ usMarketAnalysis: e.target.value })}
          className="editor-textarea h-32" placeholder="전일 미증시 마감 분석을 입력하세요..." />
      </Section>

      {/* ─── 5. 전일 국내증시 특징 ─── */}
      <Section title="🏠 전일 국내증시 특징" icon="5">
        <textarea value={data.domesticAnalysis} onChange={e => update({ domesticAnalysis: e.target.value })}
          className="editor-textarea h-32" placeholder="전일 국내증시 특징을 입력하세요..." />
      </Section>

      {/* ─── 6. 오늘의 핵심 테마 ─── */}
      <Section title="🔥 오늘의 핵심 테마" icon="6"
        onAdd={addTheme} addLabel="테마 추가">
        <div className="space-y-3">
          {data.featuredStocks.map((theme, ti) => {
            const iconUrl = getTossIconUrl(theme.keyword);
            return (
              <div key={theme.id || ti} className="bg-slate-800/50 rounded-lg p-3 space-y-2 relative group">
                <button onClick={() => removeTheme(ti)}
                  className="absolute top-1 right-1 text-red-400/60 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                <div className="flex items-center gap-2">
                  {iconUrl && <img src={iconUrl} alt="" className="w-6 h-6 rounded" />}
                  <input type="text" value={theme.keyword} onChange={e => updateTheme(ti, 'keyword', e.target.value)}
                    className="editor-input flex-1 font-medium" placeholder="테마명 (예: AI 반도체)" />
                  <select value={theme.sentiment || '강세'} onChange={e => updateTheme(ti, 'sentiment', e.target.value)}
                    className="editor-input w-20 text-xs">
                    <option value="강세">🟢 강세</option>
                    <option value="약세">🔴 약세</option>
                    <option value="중립">🟡 중립</option>
                  </select>
                </div>
                {theme.stocks.map((stock, si) => (
                  <div key={si} className="grid grid-cols-[1fr_80px_80px_24px] gap-1 items-center">
                    <input type="text" value={stock.name} onChange={e => updateThemeStock(ti, si, 'name', e.target.value)}
                      className="editor-input text-xs" placeholder="종목명" />
                    <input type="text" value={stock.price} onChange={e => updateThemeStock(ti, si, 'price', e.target.value)}
                      className="editor-input text-xs" placeholder="가격" />
                    <input type="text" value={stock.change} onChange={e => updateThemeStock(ti, si, 'change', e.target.value)}
                      className="editor-input text-xs" placeholder="등락률" />
                    <button onClick={() => removeThemeStock(ti, si)}
                      className="text-red-400/40 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
                <button onClick={() => addThemeStock(ti)}
                  className="text-xs text-blue-400/60 hover:text-blue-400 mt-1">+ 종목 추가</button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─── 7. 국내 연관 섹터 ─── */}
      <Section title="🎯 국내 연관 섹터" icon="7"
        onAdd={addSector} addLabel="섹터 추가">
        <div className="space-y-3">
          {data.sectors.map((sector, i) => (
            <div key={sector.id || i} className="bg-slate-800/50 rounded-lg p-3 space-y-2 relative group">
              <button onClick={() => removeSector(i)}
                className="absolute top-1 right-1 text-red-400/60 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <input type="text" value={sector.name} onChange={e => updateSector(i, 'name', e.target.value)}
                  className="editor-input font-medium" placeholder="섹터명" />
                <select value={sector.sentiment} onChange={e => updateSector(i, 'sentiment', e.target.value)}
                  className="editor-input text-xs">
                  <option value="긍정">🟢 긍정</option>
                  <option value="중립">🟡 중립</option>
                  <option value="부정">🔴 부정</option>
                </select>
              </div>
              <input type="text" value={sector.issue} onChange={e => updateSector(i, 'issue', e.target.value)}
                className="editor-input" placeholder="이슈 요약" />
              <input type="text" value={sector.stocks} onChange={e => updateSector(i, 'stocks', e.target.value)}
                className="editor-input" placeholder="관련 종목 (쉼표 구분)" />
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 8. 금일 시장전략 ─── */}
      <Section title="⚡ 금일 시장전략" icon="8">
        <textarea value={data.todayStrategy} onChange={e => update({ todayStrategy: e.target.value })}
          className="editor-textarea h-32" placeholder="금일 시장전략을 입력하세요..." />
        <div className="mt-2">
          <label className="text-xs text-slate-500 block mb-1">관심 종목</label>
          <input type="text" value={data.expertInterestedStocks}
            onChange={e => update({ expertInterestedStocks: e.target.value })}
            className="editor-input" placeholder="종목명 (쉼표 구분)" />
        </div>
      </Section>

      {/* ─── 9. 일정 ─── */}
      <Section title="📅 금일 주요 일정" icon="9"
        onAdd={addSchedule} addLabel="일정 추가">
        <div className="space-y-2">
          {data.marketSchedule.map((s, i) => (
            <div key={s.id || i} className="grid grid-cols-[70px_1fr_24px] gap-2 items-center">
              <input type="text" value={s.time} onChange={e => updateSchedule(i, 'time', e.target.value)}
                className="editor-input text-center text-xs" placeholder="시간" />
              <input type="text" value={s.event} onChange={e => updateSchedule(i, 'event', e.target.value)}
                className="editor-input text-xs" placeholder="이벤트" />
              <button onClick={() => removeSchedule(i)}
                className="text-red-400/40 hover:text-red-400 text-xs">✕</button>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 10. 전문가 브리핑 ─── */}
      <Section title="💬 모닝 브리핑" icon="10">
        <textarea value={data.expertAnalysis} onChange={e => update({ expertAnalysis: e.target.value })}
          className="editor-textarea h-40" placeholder="전문가 모닝 브리핑을 입력하세요..." />
      </Section>

      {/* 하단 여백 */}
      <div className="h-20" />
    </div>
  );
}

// ─── 공통 섹션 래퍼 ─── */
function Section({ title, icon, children, onAdd, addLabel }: {
  title: string; icon: string; children: React.ReactNode;
  onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold">{icon}</span>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        {onAdd && (
          <button onClick={onAdd}
            className="text-xs text-blue-400/70 hover:text-blue-400 flex items-center gap-1 transition-colors">
            <span>+</span> {addLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
