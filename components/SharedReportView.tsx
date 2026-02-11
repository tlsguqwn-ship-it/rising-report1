import React, { useEffect, useState } from 'react';
import { getSharedReport, SharedReport } from '../services/shareReport';
import ReportPreview from './ReportPreview';

interface Props {
  shareId: string;
}

const SharedReportView: React.FC<Props> = ({ shareId }) => {
  const [report, setReport] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getSharedReport(shareId);
      if (data) {
        setReport(data);
      } else {
        setError(true);
      }
      setLoading(false);
    })();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm font-bold text-slate-500 tracking-wide">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-black text-slate-800 mb-2">리포트를 찾을 수 없습니다</h2>
          <p className="text-sm text-slate-500">링크가 잘못되었거나 삭제된 리포트입니다.</p>
          <a href="/" className="inline-block mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  const publishDate = new Date(report.created_at).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-[900] tracking-[-0.05em] text-slate-900 uppercase" style={{ fontStretch: 'condensed' }}>RISING</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">공유 리포트</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium">{publishDate} 발행</span>
            <a href="/" className="text-[11px] text-slate-500 hover:text-slate-800 font-bold transition-colors">
              RISING 바로가기 →
            </a>
          </div>
        </div>
      </div>

      {/* 리포트 콘텐츠 */}
      <div className="py-8">
        <ReportPreview
          data={report.report_data}
          onChange={() => {}}
          isModalView={true}
          darkMode={report.dark_mode}
        />
      </div>
    </div>
  );
};

export default SharedReportView;
