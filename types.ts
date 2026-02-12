
export interface MarketSummaryItem {
  label: string;
  value: string;
  subText: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface Sector {
  id: string;
  name: string;
  sentiment: '긍정' | '중립' | '부정' | string;
  issue: string;
  stocks: string;
  perspective: string;
  column?: number;  // 0=좌, 1=우
}

export interface MarketSchedule {
  id: string;
  time: string;
  event: string;
}

export interface ThemeStock {
  name: string;
  price: string;
  change: string;
}

export interface ThemeGroup {
  id: string;
  keyword: string;
  sentiment?: string;
  stocks: ThemeStock[];
}

// 하위 호환용
export type FeaturedStock = ThemeGroup;

export interface ReportData {
  title: string;
  date: string;
  reportType: '장전' | '마감';
  summaryTitle: string;
  currentMarketView: string;
  summaryItems: MarketSummaryItem[];
  subIndicators?: MarketSummaryItem[];
  sectors: Sector[];
  expertAnalysis: string;
  expertAnalysisTitle: string;
  expertInterestedStocks: string;
  featuredStockLabel?: string;
  marketSchedule: MarketSchedule[];
  featuredStocks: ThemeGroup[];
  featuredStocksTitle: string;
  sectorsTitle: string;
  scheduleTitle: string;
  coreViewTitle: string;
  expertAnalysisSubtitle: string;
  dailyComment: string;
  // 전문가 텍스트 분석 섹션 (2페이지)
  usMarketAnalysis: string;        // 전일 미증시 마감 분석
  usMarketAnalysisTitle: string;
  domesticAnalysis: string;        // 전일 국내증시 특징섹터/종목
  domesticAnalysisTitle: string;
  todayStrategy: string;           // 금일 시장전략
  todayStrategyTitle: string;
  usSectors?: Sector[];             // 전일 미증시 섹터 트렌드
  usSectorsTitle?: string;

  // 커스텀 색상 (undefined이면 기본 Tailwind 색상 사용)
  // 현재 지표
  indicatorBoxColor?: string;             // 지표 박스 배경색

  // 전일 미증시 섹터 트렌드
  sectorTrendHeaderColor?: string;        // 메인 헤더 배경색
  sectorTrendSubHeaderColor?: string;     // 각 소메뉴 헤더 배경색
  sectorTrendTableTextColor?: string;     // 종목명/종가/등락률 텍스트 색상
  sectorTrendTableTextSize?: number;      // 테이블 텍스트 크기 (px)

  // 전일 미증시 마감 분석
  usAnalysisHeaderColor?: string;         // 헤더 배경색
  usAnalysisBoxColor?: string;            // 내용 박스 배경색

  // 오늘의 핵심 테마
  themeHeaderColor?: string;              // 메인 헤더 배경색
  themeCardHeaderColor?: string;          // 각 소메뉴 헤더 배경색
  themeChipColor?: string;                // 종목 칩 배경색

  // 핵심 금일 시장 전략
  strategyBoxColor?: string;              // 박스 배경색
  stockChipColor?: string;                // 종목 칩 배경색

  // 헤더 뱃지 (MORNING REPORT / CLOSING REPORT)
  headerBadgeColor?: string;              // 뱃지 배경색
  headerLineColor?: string;               // 상단 강조 바(라인) 색상

  // 지표 텍스트 스타일
  indicatorLabelSize?: number;            // 라벨 크기 (px)
  indicatorLabelColor?: string;           // 라벨 색상
  indicatorLabelWeight?: string;          // 라벨 굵기
  indicatorValueSize?: number;            // 지표값 크기 (px)
  indicatorValueColor?: string;           // 지표값 색상
  indicatorValueWeight?: string;          // 지표값 굵기
  indicatorChangeSize?: number;           // 등락률 크기 (px)
  indicatorChangeWeight?: string;         // 등락률 굵기

  // 섹터 트렌드 텍스트 스타일
  sectorTrendNameSize?: number;           // 섹터명 크기
  sectorTrendNameWeight?: string;         // 섹터명 굵기
  sectorTrendIssueSize?: number;          // 이슈 텍스트 크기
  sectorTrendIssueWeight?: string;        // 이슈 텍스트 굵기

  // 핵심 테마 텍스트 스타일
  themeNameSize?: number;                 // 테마명 크기
  themeNameWeight?: string;               // 테마명 굵기
  themeIssueSize?: number;                // 이슈 텍스트 크기
  themeIssueWeight?: string;              // 이슈 텍스트 굵기

}

export interface EditorState {
  activeSection: string | null;
  selectedElement: string | null;
  isDirty: boolean;
  zoom: number;
}
