
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
}

export interface MarketSchedule {
  id: string;
  time: string;
  event: string;
}

export interface FeaturedStock {
  id: string;
  name: string;
  change: string;
  reason: string;
}

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
  featuredStocks: FeaturedStock[];
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
  // 이미지 첨부 (추후 구현, 와이어프레임용)
  usMarketImage?: string;          // 미증시 차트 이미지 URL
  domesticImage?: string;          // 국내증시 이미지 URL
}

export interface EditorState {
  activeSection: string | null;
  selectedElement: string | null;
  isDirty: boolean;
  zoom: number;
}
