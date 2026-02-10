
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
  sectors: Sector[];
  expertAnalysis: string;
  expertAnalysisTitle: string;
  expertInterestedStocks: string;
  marketSchedule: MarketSchedule[];
  featuredStocks: FeaturedStock[];
  featuredStocksTitle: string;
  sectorsTitle: string;
  scheduleTitle: string;
  coreViewTitle: string;
  expertAnalysisSubtitle: string;
  dailyComment: string;
}

export interface EditorState {
  activeSection: string | null;
  selectedElement: string | null;
  isDirty: boolean;
  zoom: number;
}
