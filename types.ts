
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

export interface ThemeStock {
  name: string;
  price: string;
  change: string;
}

export interface ThemeGroup {
  id: string;
  keyword: string;
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

}

export interface EditorState {
  activeSection: string | null;
  selectedElement: string | null;
  isDirty: boolean;
  zoom: number;
}
