import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReportData } from './types';
import { INITIAL_REPORT, PRE_MARKET_REPORT_TEMPLATE, CLOSE_REPORT_TEMPLATE, SHARED_FIELDS } from './constants';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Toolbar from './components/Toolbar';
import ExportModal from './components/ExportModal';
import ReportEditor from './components/ReportEditor';
import ReportPreview from './components/ReportPreview';

const getStorageKey = (type: '장전' | '마감') => `rising-report-${type === '장전' ? 'pre' : 'close'}`;

const loadSavedTemplate = (type: '장전' | '마감'): ReportData | null => {
  try {
    const saved = localStorage.getItem(getStorageKey(type));
    if (saved) {
      const data = JSON.parse(saved) as ReportData;
      // 타이틀 마이그레이션: 구 타이틀 → 새 타이틀
      const titleMigrations: Record<string, string> = {
        '[마감 REPORT] RISING STOCK 마감 시황 리포트': 'RISING STOCK 마감 시황',
        '[장전 REPORT] RISING STOCK 마켓 데일리 리포트': 'RISING STOCK 장전 시황',
        'RISING STOCK 마켓 데일리': 'RISING STOCK 장전 시황',
      };
      if (data.title && titleMigrations[data.title]) {
        data.title = titleMigrations[data.title];
      }
      // 마감 리포트 sentiment 마이그레이션: 긍정→강세, 부정→약세, 중립→보합
      if (type === '마감' && data.sectors) {
        const sentimentMap: Record<string, string> = { '긍정': '강세', '부정': '약세', '중립': '보합' };
        data.sectors = data.sectors.map(s => ({
          ...s,
          sentiment: sentimentMap[s.sentiment] || s.sentiment,
        }));
      }
      return data;
    }
  } catch { /* ignore */ }
  return null;
};

const getLastMode = (): '장전' | '마감' => {
  try {
    const saved = localStorage.getItem('rising-report-lastMode');
    if (saved === '장전' || saved === '마감') return saved;
  } catch { /* ignore */ }
  return INITIAL_REPORT.reportType;
};

const App: React.FC = () => {
  const lastMode = getLastMode();
  const initialData = loadSavedTemplate(lastMode) || (lastMode === '장전' ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE);
  const { state: reportData, setState: setReportData, undo, redo, canUndo, canRedo, reset } = useUndoRedo<ReportData>(initialData);
  const [showExport, setShowExport] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [templateHistory, setTemplateHistory] = useState<Array<{data: ReportData, savedAt: string}>>([]); 
  const [showHistory, setShowHistory] = useState(false);

  // ===========================
  // 현재 시각을 발행시간 포맷으로 생성
  // ===========================
  const formatCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[now.getDay()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일 (${dayName}) ${hours}:${minutes} 발행`;
  };

  // ===========================
  // 접속 시 발행시간 자동 설정 + 히스토리 로드
  // ===========================
  useEffect(() => {
    setReportData({ ...reportData, date: formatCurrentDate() });
    // 템플릿 히스토리 로드
    try {
      const historyKey = `rising-report-history-${reportData.reportType === '장전' ? 'pre' : 'close'}`;
      const saved = localStorage.getItem(historyKey);
      if (saved) setTemplateHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================
  // Mode Switch with shared fields preservation
  // ===========================
  const handleModeSwitch = useCallback(() => {
    const next = reportData.reportType === '장전' ? '마감' : '장전';

    // 현재 데이터를 localStorage에 저장 (되돌아올 때 유지)
    try { localStorage.setItem(getStorageKey(reportData.reportType), JSON.stringify(reportData)); } catch { /* ignore */ }

    // 마지막 모드 저장
    try { localStorage.setItem('rising-report-lastMode', next); } catch { /* ignore */ }

    // 전환 대상 타입의 히스토리 로드
    try {
      const historyKey = `rising-report-history-${next === '장전' ? 'pre' : 'close'}`;
      const saved = localStorage.getItem(historyKey);
      setTemplateHistory(saved ? JSON.parse(saved) : []);
    } catch { setTemplateHistory([]); }

    // 전환 대상 타입의 저장된 데이터 확인
    const savedForNext = loadSavedTemplate(next);
    if (savedForNext) {
      setReportData(savedForNext);
    } else {
      const template = next === '장전' ? { ...PRE_MARKET_REPORT_TEMPLATE } : { ...CLOSE_REPORT_TEMPLATE };
      SHARED_FIELDS.forEach((field) => {
        (template as any)[field] = (reportData as any)[field];
      });
      setReportData(template);
    }
  }, [reportData, setReportData]);

  // ===========================
  // Reset to template
  // ===========================
  const handleReset = useCallback(() => {
    // 저장된 템플릿이 있는지 확인
    const storageKey = getStorageKey(reportData.reportType);
    const saved = localStorage.getItem(storageKey);
    const hasSaved = !!saved;

    // 모든 contenteditable 요소의 인라인 서식 정리
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.fontSize = '';
      htmlEl.style.color = '';
      htmlEl.querySelectorAll('font').forEach(font => {
        const text = document.createTextNode(font.textContent || '');
        font.parentNode?.replaceChild(text, font);
      });
      htmlEl.querySelectorAll('span[style]').forEach(span => {
        const text = document.createTextNode(span.textContent || '');
        span.parentNode?.replaceChild(text, span);
      });
    });

    if (hasSaved) {
      // 저장된 템플릿으로 복원
      try {
        const savedData = JSON.parse(saved!);
        reset(savedData);
      } catch {
        // 파싱 실패 시 기본 템플릿으로
        const template = reportData.reportType === '장전' ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE;
        reset(template);
      }
    } else {
      // 기본 템플릿으로 초기화
      const template = reportData.reportType === '장전' ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE;
      reset(template);
    }
  }, [reportData.reportType, reset]);

  // ===========================
  // Full Reset (완전 초기화)
  // ===========================
  const handleFullReset = useCallback(() => {
    if (!confirm('저장된 템플릿을 포함한 모든 데이터를 완전히 초기화합니다. 계속하시겠습니까?')) return;
    localStorage.removeItem(getStorageKey(reportData.reportType));

    // 모든 contenteditable 요소의 인라인 서식 정리
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.fontSize = '';
      htmlEl.style.color = '';
      htmlEl.querySelectorAll('font').forEach(font => {
        const text = document.createTextNode(font.textContent || '');
        font.parentNode?.replaceChild(text, font);
      });
      htmlEl.querySelectorAll('span[style]').forEach(span => {
        const text = document.createTextNode(span.textContent || '');
        span.parentNode?.replaceChild(text, span);
      });
    });

    const template = reportData.reportType === '장전' ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE;
    reset(template);
  }, [reportData.reportType, reset]);

  // ===========================
  // Save / Load Template
  // ===========================
  const saveTemplate = useCallback(() => {
    try {
      const storageKey = getStorageKey(reportData.reportType);
      localStorage.setItem(storageKey, JSON.stringify(reportData));
      
      // 히스토리에 추가 (최근 5개)
      const historyKey = `rising-report-history-${reportData.reportType === '장전' ? 'pre' : 'close'}`;
      const now = new Date();
      const timeStr = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const entry = { data: JSON.parse(JSON.stringify(reportData)), savedAt: timeStr };
      let history: Array<{data: ReportData, savedAt: string}> = [];
      try {
        const existing = localStorage.getItem(historyKey);
        if (existing) history = JSON.parse(existing);
      } catch { /* ignore */ }
      history.unshift(entry);
      if (history.length > 5) history = history.slice(0, 5);
      localStorage.setItem(historyKey, JSON.stringify(history));
      setTemplateHistory(history);
      
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch {
      alert('⚠️ 저장 실패: 브라우저 저장공간이 부족합니다.');
    }
  }, [reportData]);

  // ===========================
  // Keyboard Shortcuts
  // ===========================
  const shortcuts = useMemo(() => ({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'ctrl+s': saveTemplate,
    'ctrl+e': () => setShowExport(true),
  }), [undo, redo, saveTemplate]);

  useKeyboardShortcuts(shortcuts);

  // ===========================
  // Element selection from preview → editor sync
  // ===========================
  const handleElementSelect = useCallback((path: string) => {
    // Auto-open the relevant accordion section
    if (path.includes('sector')) setActiveSection('sectors');
    else if (path.includes('featuredStock')) setActiveSection('stocks');
    else if (path.includes('expert') || path.includes('Analysis')) setActiveSection('insight');
    else if (path.includes('market') || path.includes('schedule')) setActiveSection('schedule');
    else if (path.includes('summary') || path.includes('currentMarket')) setActiveSection('coreview');
    else if (path.includes('title') || path.includes('date')) setActiveSection('setup');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Toolbar
        reportType={reportData.reportType}
        onModeSwitch={handleModeSwitch}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onReset={handleReset}
        onExport={() => {
          // 리포트 완성 시 현재시각 자동 적용
          const dateStr = formatCurrentDate();
          setReportData({ ...reportData, date: dateStr });
          setShowExport(true);
        }}
        zoom={zoom}
        onZoomChange={setZoom}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(prev => !prev)}
      />

      <main className="flex-1 flex min-h-0">
        {/* Left: Editor Panel */}
        <aside className="hidden lg:block h-[calc(100vh-56px)] overflow-y-auto bg-white border-r border-slate-200 p-5 no-print custom-scrollbar" style={{ width: 'clamp(380px, 28vw, 560px)', minWidth: '380px', flexShrink: 0 }}>
          <ReportEditor
            data={reportData}
            onChange={setReportData}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onSave={saveTemplate}
            onFullReset={handleFullReset}
            templateHistory={templateHistory}
            onRestoreHistory={(histData) => {
              reset(histData);
            }}
            onDeleteHistory={(idx) => {
              const historyKey = `rising-report-history-${reportData.reportType === '장전' ? 'pre' : 'close'}`;
              const newHistory = [...templateHistory];
              newHistory.splice(idx, 1);
              setTemplateHistory(newHistory);
              try { localStorage.setItem(historyKey, JSON.stringify(newHistory)); } catch { /* ignore */ }
            }}
          />
        </aside>

        {/* Right: Preview Pane */}
        <div className="flex-1 h-[calc(100vh-56px)] overflow-y-auto overflow-x-auto bg-[#e8eaed] no-print custom-scrollbar flex items-start justify-center" style={{ padding: 'clamp(8px, 2vw, 32px)' }}>
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
            }}
          >
            <ReportPreview
              data={reportData}
              onChange={setReportData}
              onElementSelect={handleElementSelect}
              darkMode={darkMode}
            />
          </div>
        </div>
      </main>

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        reportType={reportData.reportType}
        date={reportData.date}
        reportData={reportData}
        darkMode={darkMode}
      />
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 z-50 animate-fade-in">
          ✅ 템플릿 저장 완료
        </div>
      )}
    </div>
  );
};

export default App;
