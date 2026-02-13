import React, { useState, useMemo, useCallback, useRef } from 'react';
import { ReportData } from '../types';
import { loadMorningData, saveMorningData, MORNING_TEMPLATE, EMPTY_MORNING_TEMPLATE } from './morningConstants';
import MorningEditor from './MorningEditor';
import MorningPreview from './MorningPreview';

/**
 * 장전리포트 메인 애플리케이션
 * - 기존 App.tsx를 건드리지 않는 독립 컴포넌트
 * - 에디터(좌) + 프리뷰(우) 2패널 레이아웃
 * - Export/클립보드 복사/초기화 기능 포함
 */
export default function MorningApp() {
  const [data, setData] = useState<ReportData>(() => loadMorningData());
  const [zoom, setZoom] = useState(0.55);
  const [showPreview, setShowPreview] = useState(true);
  const [exportStatus, setExportStatus] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  // 날짜 자동 세팅
  const dateStr = useMemo(() => {
    if (data.date) return data.date;
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${y}년 ${m}월 ${day}일(${weekdays[d.getDay()]}) ${hh}:${mm} 발행`;
  }, [data.date]);

  // 데이터 변경 핸들러
  const handleChange = useCallback((newData: ReportData) => {
    setData(newData);
    saveMorningData(newData);
  }, []);

  // 초기화
  const handleReset = useCallback(() => {
    if (confirm('장전 리포트를 초기화하시겠습니까?')) {
      const fresh = JSON.parse(JSON.stringify(EMPTY_MORNING_TEMPLATE));
      setData(fresh);
      saveMorningData(fresh);
    }
  }, []);

  // 샘플 데이터 로드
  const handleLoadSample = useCallback(() => {
    if (confirm('샘플 데이터를 불러오시겠습니까? 현재 데이터가 덮어씌워집니다.')) {
      const sample = JSON.parse(JSON.stringify(MORNING_TEMPLATE));
      setData(sample);
      saveMorningData(sample);
    }
  }, []);

  // 클립보드에 HTML 복사 (노션/카카오톡 붙여넣기용)
  const handleCopyToClipboard = useCallback(async () => {
    const el = document.getElementById('report-content');
    if (!el) return;
    try {
      setExportStatus('복사 중...');
      const html = el.outerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([el.innerText], { type: 'text/plain' }),
        }),
      ]);
      setExportStatus('✅ 클립보드 복사 완료!');
      setTimeout(() => setExportStatus(''), 2000);
    } catch (e) {
      setExportStatus('❌ 복사 실패');
      setTimeout(() => setExportStatus(''), 2000);
    }
  }, []);

  // JSON 내보내기
  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morning_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  // JSON 가져오기
  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as ReportData;
          setData(imported);
          saveMorningData(imported);
          setExportStatus('✅ 가져오기 완료!');
          setTimeout(() => setExportStatus(''), 2000);
        } catch {
          setExportStatus('❌ 올바른 JSON 파일이 아닙니다');
          setTimeout(() => setExportStatus(''), 2000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // 인쇄
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 상단 네비게이션 */}
      <nav className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between shadow-lg no-print border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌅</span>
            <h1 className="text-base font-bold tracking-tight">
              RISING STOCK <span className="text-amber-400">장전 리포트</span>
            </h1>
          </div>
          <span className="text-[11px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{dateStr}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export 상태 표시 */}
          {exportStatus && (
            <span className="text-xs text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-lg animate-pulse">
              {exportStatus}
            </span>
          )}

          {/* 줌 컨트롤 */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.05))}
              className="text-slate-400 hover:text-white text-sm px-1">−</button>
            <span className="text-[10px] text-slate-300 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.05))}
              className="text-slate-400 hover:text-white text-sm px-1">+</button>
          </div>

          {/* 프리뷰 토글 */}
          <button onClick={() => setShowPreview(!showPreview)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              showPreview ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
            👁 {showPreview ? 'ON' : 'OFF'}
          </button>

          {/* 구분선 */}
          <div className="w-px h-5 bg-slate-700" />

          {/* 샘플 / 초기화 */}
          <button onClick={handleLoadSample}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
            📋 샘플
          </button>
          <button onClick={handleReset}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">
            🔄 초기화
          </button>

          <div className="w-px h-5 bg-slate-700" />

          {/* Export 버튼들 */}
          <button onClick={handleCopyToClipboard}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors">
            📋 복사
          </button>
          <button onClick={handleExportJSON}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors">
            💾 저장
          </button>
          <button onClick={handleImportJSON}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors">
            📂 불러오기
          </button>
          <button onClick={handlePrint}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 transition-colors">
            🖨 인쇄
          </button>
        </div>
      </nav>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 에디터 */}
        <aside className={`${showPreview ? 'w-[440px] min-w-[440px]' : 'w-full max-w-3xl mx-auto'} bg-slate-900 overflow-y-auto custom-scrollbar transition-all duration-300`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#334155 transparent',
          }}>
          <MorningEditor data={data} onChange={handleChange} />
        </aside>

        {/* 우측: 프리뷰 */}
        {showPreview && (
          <main className="flex-1 overflow-auto p-6"
            style={{
              background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#94a3b8 transparent',
            }}>
            <div ref={previewRef} style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
            }}>
              <MorningPreview data={{ ...data, date: data.date || dateStr }} />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
