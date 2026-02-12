import React, { useState } from 'react';
import { Download, X, ImageIcon, FileText, Loader2, Check, Eye, ArrowRight, ArrowLeft, Link2, Copy } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ReportData } from '../types';
import ReportPreview from './ReportPreview';
import { publishReport } from '../services/shareReport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: '장전' | '마감';
  date: string;
  reportData?: ReportData;
  darkMode?: boolean;
  onAutoSave?: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, reportType, date, reportData, darkMode = false, onAutoSave }) => {

  const [isExporting, setIsExporting] = useState(false);
  const [isPngDone, setIsPngDone] = useState(false);
  const [isPdfDone, setIsPdfDone] = useState(false);
  const [step, setStep] = useState<'preview' | 'export'>('preview');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // 페이지 수 감지: export 모달 열릴 때 + step 전환 시
  React.useEffect(() => {
    if (isOpen) {
      // 약간의 딜레이 후 DOM에서 페이지 수 확인 (오프스크린 렌더 후)
      const timer = setTimeout(() => {
        const content = document.getElementById('report-content');
        if (content) {
          setTotalPages(content.children.length);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('preview');
    setIsPngDone(false);
    setIsPdfDone(false);
    onClose();
  };

  const generateFilename = (pageNum: number) => {
    const now = new Date();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const yy = String(now.getFullYear()).slice(2);
    const mm = now.getMonth() + 1;
    const dd = now.getDate();
    const dayName = dayNames[now.getDay()];
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const mode = reportType === '장전' ? '장전시황' : '마감시황';
    return `${yy}년${mm}월${dd}일(${dayName}) ${hh}:${min} ${mode} ${pageNum}P`;
  };

  const generatePdfFilename = () => {
    const now = new Date();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const yy = String(now.getFullYear()).slice(2);
    const mm = now.getMonth() + 1;
    const dd = now.getDate();
    const dayName = dayNames[now.getDay()];
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const mode = reportType === '장전' ? '장전시황' : '마감시황';
    return `${yy}년${mm}월${dd}일(${dayName}) ${hh}:${min} ${mode}.pdf`;
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    setIsPngDone(false);
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
          skipFonts: true,
          width: page.scrollWidth,
          height: page.scrollHeight,
          filter: (node: HTMLElement) => {
            if (node.classList && node.classList.contains('no-print')) return false;
            return true;
          },
        });

        const link = document.createElement('a');
        link.download = `${generateFilename(i + 1)}.PNG`;
        link.href = dataUrl;
        link.click();

        // 브라우저 다운로드 간격: 충분한 시간을 두어 팝업 차단 방지
        await new Promise(r => setTimeout(r, 1200));
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

      setIsPngDone(true);
      setTimeout(() => setIsPngDone(false), 3000);
      // PNG 내보내기 완료 시 히스토리 자동 저장
      if (onAutoSave) onAutoSave();
    } catch (err) {
      console.error('Export failed:', err);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    setIsExporting(true);
    setIsPdfDone(false);
    try {
      const content = document.getElementById('report-content');
      if (!content) throw new Error('리포트 콘텐츠를 찾을 수 없습니다.');

      const pixelRatio = 3;

      // zoom 비율 무관하게 100% 크기로 캡처
      const wrapper = content.parentElement;
      const originalTransform = wrapper?.style.transform || '';
      const originalTransition = wrapper?.style.transition || '';
      if (wrapper) {
        wrapper.style.transition = 'none';
        wrapper.style.transform = 'scale(1)';
      }
      content.offsetHeight;

      // 편집용 UI 요소 숨기기
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

      // A4 사이즈 PDF 생성 (210mm x 297mm)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      (pdf as any).setDisplayMode('fullpage');
      const pdfWidth = 210;
      const pdfHeight = 297;

      const pages = content.children;
      const isDarkExport = darkMode && reportType === '마감';

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const dataUrl = await toPng(page, {
          quality: 1.0,
          pixelRatio,
          backgroundColor: isDarkExport ? '#0f0f14' : '#ffffff',
          cacheBust: true,
          skipFonts: true,
          width: page.scrollWidth,
          height: page.scrollHeight,
          filter: (node: HTMLElement) => {
            if (node.classList && node.classList.contains('no-print')) return false;
            return true;
          },
        });

        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
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

      // PDF 다운로드
      pdf.save(generatePdfFilename());

      setIsPdfDone(true);
      setTimeout(() => setIsPdfDone(false), 3000);
      // PDF 내보내기 완료 시 히스토리 자동 저장
      if (onAutoSave) onAutoSave();
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!reportData) return;
    setIsSharing(true);
    try {
      const id = await publishReport(reportData, darkMode);
      const url = `${window.location.origin}?share=${id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      // 공유 링크 생성 시 히스토리 자동 저장
      if (onAutoSave) onAutoSave();
    } catch (err) {
      console.error('Share failed:', err);
      alert('공유 링크 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSharing(false);
    }
  };


  // ========================
  // Render
  // ========================
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 no-print animate-fade-in">

      {/* 오프스크린 캡처용 ReportPreview (항상 렌더링, PDF/PNG 캡처에 사용) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '210mm',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        {reportData && (
          <ReportPreview
            data={reportData}
            onChange={() => {}}
            isModalView={true}
            darkMode={darkMode}
          />
        )}
      </div>

      {/* Step 1: 미리보기 */}
      {step === 'preview' && (
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
      )}

      {/* Step 2: 내보내기 옵션 */}
      {step === 'export' && (
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
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">파일명 ({totalPages}페이지)</span>
              <div className="mt-1 space-y-0.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <p key={i} className="text-sm font-bold text-slate-700 font-mono">{generateFilename(i + 1)}.PNG</p>
                ))}
              </div>
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
                ) : isPngDone ? (
                  <><Check size={16} /> 완료!</>
                ) : (
                  <><ImageIcon size={16} /> PNG 저장</>
                )}
              </button>
              <button
                onClick={handlePrint}
                disabled={isExporting}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 text-sm shadow-sm disabled:opacity-50"
              >
                {isExporting ? (
                  <><Loader2 size={16} className="animate-spin" /> 생성 중...</>
                ) : isPdfDone ? (
                  <><Check size={16} /> 완료!</>
                ) : (
                  <><FileText size={16} /> PDF 출력</>
                )}
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm shadow-lg"
            >
              {isSharing ? (
                <><Loader2 size={16} className="animate-spin" /> 공유 링크 생성 중...</>
              ) : shareUrl ? (
                <><Check size={16} /> 링크 복사 완료!</>
              ) : (
                <><Link2 size={16} /> 공유 링크 생성</>
              )}
            </button>
            {shareUrl && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-[11px] font-mono text-slate-600 bg-transparent outline-none truncate"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                  className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors p-1"
                  title="복사"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}

            {/* Back Button */}
            <button onClick={() => setStep('preview')} className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5 py-1">
              <ArrowLeft size={14} />
              미리보기로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportModal;

