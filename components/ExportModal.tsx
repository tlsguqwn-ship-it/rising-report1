import React, { useState } from 'react';
import { Download, X, ImageIcon, FileText, Loader2, Check, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ReportData } from '../types';
import ReportPreview from './ReportPreview';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: '장전' | '마감';
  date: string;
  reportData?: ReportData;
  darkMode?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, reportType, date, reportData, darkMode = false }) => {

  const [isExporting, setIsExporting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [step, setStep] = useState<'preview' | 'export'>('preview');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('preview');
    setIsDone(false);
    onClose();
  };

  const generateFilename = (pageNum: number) => {
    // date에서 시간 부분 제거 (예: "2026년 2월 10일(월) 08:20 발행" → "2026년 2월 10일(월)")
    const dateOnly = date.replace(/\s*\d{1,2}:\d{2}.*$/, '').trim();
    const mode = reportType === '장전' ? '장전시황' : '마감시황';
    return `${dateOnly} ${mode} (${pageNum})`;
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    setIsDone(false);
    try {
      const content = document.getElementById('report-content');
      if (!content) throw new Error('리포트 콘텐츠를 찾을 수 없습니다.');

      const pixelRatio = 4;

      // zoom 비율 무관하게 100% 크기로 캡처
      // wrapper와 그 위 transform 적용 요소 모두 초기화
      const wrapper = content.parentElement;
      const originalTransform = wrapper?.style.transform || '';
      const originalTransition = wrapper?.style.transition || '';
      if (wrapper) {
        wrapper.style.transition = 'none';
        wrapper.style.transform = 'scale(1)';
      }
      // DOM 리플로우 강제 (transform 변경 반영)
      content.offsetHeight;

      // 편집용 UI 요소 숨기기 (.no-print, contenteditable 하이라이트)
      const noPrintElements = content.querySelectorAll('.no-print') as NodeListOf<HTMLElement>;
      const editableElements = content.querySelectorAll('[contenteditable]') as NodeListOf<HTMLElement>;
      
      noPrintElements.forEach(el => {
        el.dataset.origDisplay = el.style.display;
        el.style.display = 'none';
      });
      editableElements.forEach(el => {
        el.dataset.origOutline = el.style.outline;
        el.dataset.origBg = el.style.background;
        el.dataset.origBoxShadow = el.style.boxShadow;
        el.style.outline = 'none';
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
      });

      const pages = content.children;
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const isDarkExport = darkMode && reportType === '마감';
        const dataUrl = await toPng(page, {
          quality: 1.0,
          pixelRatio,
          backgroundColor: isDarkExport ? '#0f0f14' : '#ffffff',
          cacheBust: true,
          width: page.scrollWidth,
          height: page.scrollHeight,
          filter: (node: HTMLElement) => {
            if (node.classList && node.classList.contains('no-print')) return false;
            return true;
          },
        });

        const link = document.createElement('a');
        link.download = `${generateFilename(i + 1)}.png`;
        link.href = dataUrl;
        link.click();

        await new Promise(r => setTimeout(r, 500));
      }

      // 편집용 UI 요소 복원
      noPrintElements.forEach(el => {
        el.style.display = el.dataset.origDisplay || '';
        delete el.dataset.origDisplay;
      });
      editableElements.forEach(el => {
        el.style.outline = el.dataset.origOutline || '';
        el.style.background = el.dataset.origBg || '';
        el.style.boxShadow = el.dataset.origBoxShadow || '';
        delete el.dataset.origOutline;
        delete el.dataset.origBg;
        delete el.dataset.origBoxShadow;
      });

      if (wrapper) {
        wrapper.style.transform = originalTransform;
        wrapper.style.transition = originalTransition;
      }

      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  // ========================
  // Step 1: 미리보기
  // ========================
  if (step === 'preview') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 no-print animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden animate-scale-in flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">리포트 미리보기</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Final Preview</p>
              </div>
            </div>
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto bg-[#e8eaed] p-6 flex justify-center custom-scrollbar">
            <div className="transform scale-[0.6] origin-top" style={{ minWidth: '430px' }}>
              {reportData && (
                <ReportPreview
                  data={reportData}
                  onChange={() => {}}
                  isModalView={true}
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 flex justify-between items-center flex-shrink-0 bg-white">
            <button onClick={handleClose} className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 rounded-lg transition-all">
              닫기
            </button>
            <button onClick={() => setStep('export')} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 text-sm shadow-lg">
              내보내기
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // Step 2: 내보내기 옵션
  // ========================
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 no-print animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">리포트 내보내기</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Export & Download</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">파일명</span>
            <p className="text-sm font-bold text-slate-700 mt-1 font-mono">{generateFilename(1)}.png</p>
            <p className="text-[11px] text-slate-400 mt-2">고해상도 4x (인쇄/발표용 최고 품질)</p>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm shadow-lg"
            >
              {isExporting ? (
                <><Loader2 size={16} className="animate-spin" /> 생성 중...</>
              ) : isDone ? (
                <><Check size={16} /> 완료!</>
              ) : (
                <><ImageIcon size={16} /> PNG 저장</>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 text-sm shadow-sm"
            >
              <FileText size={16} /> PDF 출력
            </button>
          </div>

          {/* Back Button */}
          <button onClick={() => setStep('preview')} className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5 py-1">
            <ArrowLeft size={14} />
            미리보기로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
