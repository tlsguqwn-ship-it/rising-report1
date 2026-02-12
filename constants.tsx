
import { ReportData, Sector, ThemeGroup, MarketSchedule } from './types';

// ===========================
// 팩토리 함수: 빈 항목 생성
// ===========================
let _idCounter = Date.now();
const genId = () => `item-${_idCounter++}`;

export const createEmptySector = (): Sector => ({
  id: genId(),
  name: '새 섹터',
  sentiment: '중립',
  issue: '',
  stocks: '',
  perspective: '',
});

export const createEmptyStock = (): ThemeGroup => ({
  id: genId(),
  keyword: '',
  stocks: [{ name: '', price: '', change: '' }],
});

export const createEmptySchedule = (): MarketSchedule => ({
  id: genId(),
  time: '',
  event: '',
});

// ===========================
// 항목 제한
// ===========================
export const MAX_SECTORS = 5;
export const MAX_STOCKS = 5;
export const MAX_SCHEDULE = 5;
export const MIN_ITEMS = 1;

// ===========================
// 모드 전환 시 유지되는 공통 필드
// ===========================
export const SHARED_FIELDS: (keyof ReportData)[] = [
  'date',
  'expertAnalysis',
  'expertInterestedStocks',
];

// ===========================
// 마감 리포트 템플릿
// ===========================
export const CLOSE_REPORT_TEMPLATE: ReportData = {
  title: "RISING STOCK 마감 시황",
  date: "",
  reportType: "마감",
  summaryTitle: "국내 증시 및 수급 현황",
  currentMarketView: "",
  summaryItems: [
    { label: "KOSPI", value: "0", subText: "0%", trend: "neutral" },
    { label: "KOSDAQ", value: "0", subText: "0%", trend: "neutral" },
    { label: "KOSPI 외인", value: "0억", subText: "-", trend: "neutral" },
    { label: "KOSPI 기관", value: "0억", subText: "-", trend: "neutral" },
    { label: "KOSDAQ 외인", value: "0억", subText: "-", trend: "neutral" },
    { label: "KOSDAQ 기관", value: "0억", subText: "-", trend: "neutral" },
    { label: "원달러환율", value: "0", subText: "0%", trend: "neutral" }
  ],
  marketSchedule: [
    { id: genId(), time: "장마감", event: "국내 소비자물가지수(CPI) 발표" },
    { id: genId(), time: "", event: "" },
    { id: genId(), time: "", event: "" }
  ],
  featuredStocks: [
    {
      id: genId(),
      keyword: '반도체 장비',
      stocks: [
        { name: '삼성전자', price: '50,000', change: '-2.5%' },
        { name: 'SK하이닉스', price: '180,000', change: '+1.2%' },
      ],
    },
    {
      id: genId(),
      keyword: '',
      stocks: [{ name: '', price: '', change: '' }],
    },
  ],
  sectors: [
    {
      id: genId(),
      name: "바이오 & CDMO",
      sentiment: "강세",
      issue: "생물보안법 수혜 및 금리 인하 기대감에 따른 수급 개선",
      stocks: "삼성바이오로직스, 셀트리온",
      perspective: "",
    },
    {
      id: genId(),
      name: "",
      sentiment: "중립",
      issue: "",
      stocks: "",
      perspective: "",
    },
    {
      id: genId(),
      name: "",
      sentiment: "중립",
      issue: "",
      stocks: "",
      perspective: "",
    }
  ],
  expertAnalysis: "",
  expertAnalysisTitle: "RISING STOCK 마감 브리핑",
  expertInterestedStocks: "",
  featuredStocksTitle: "오늘의 주요 종목",
  sectorsTitle: "금일 마감 섹터 트렌드",
  scheduleTitle: "내일 주요 일정",
  coreViewTitle: "마감 시황 요약",
  expertAnalysisSubtitle: "장 마감 총평 및 전략",
  dailyComment: "",
  usMarketAnalysis: "",
  usMarketAnalysisTitle: "전일 미증시 마감 분석",
  domesticAnalysis: "",
  domesticAnalysisTitle: "전일 국내증시 특징섹터 및 특징종목",
  todayStrategy: "",
  todayStrategyTitle: "금일 시장전략",
};

// ===========================
// 장전 리포트 템플릿
// ===========================
export const PRE_MARKET_REPORT_TEMPLATE: ReportData = {
  title: "RISING STOCK 장전 시황",
  date: "",
  reportType: "장전",
  summaryTitle: "미국 증시 및 글로벌 지표",
  currentMarketView: "",
  summaryItems: [
    { label: "NASDAQ", value: "0", subText: "0%", trend: "neutral" },
    { label: "다우존스", value: "0", subText: "0%", trend: "neutral" },
    { label: "VIX", value: "0", subText: "0%", trend: "neutral" },
    { label: "야간선물", value: "0", subText: "0%", trend: "neutral" },
    { label: "원달러환율", value: "0", subText: "0%", trend: "neutral" }
  ],
  subIndicators: [
    { label: "WTI/USD", value: "0", subText: "0%", trend: "neutral" },
    { label: "금/USD", value: "0", subText: "0%", trend: "neutral" },
    { label: "BTC", value: "0", subText: "0%", trend: "neutral" }
  ],
  marketSchedule: [
    { id: genId(), time: "09:00", event: "국내 증시 시초가 형성" },
    { id: genId(), time: "", event: "" },
    { id: genId(), time: "", event: "" }
  ],
  featuredStocks: [
    {
      id: genId(),
      keyword: 'AI & HBM 장비',
      stocks: [
        { name: '한미반도체', price: '120,000', change: '+5.2%' },
        { name: 'HPSP', price: '42,000', change: '+3.8%' },
      ],
    },
    {
      id: genId(),
      keyword: '',
      stocks: [{ name: '', price: '', change: '' }],
    },
  ],
  sectors: [
    {
      id: genId(),
      name: "AI & HBM 장비",
      sentiment: "긍정",
      issue: "미국 반도체 지수 강세로 소부장 테마 매수세 유입",
      stocks: "HPSP, 주성엔지니어링",
      perspective: "",
    },
    {
      id: genId(),
      name: "",
      sentiment: "중립",
      issue: "",
      stocks: "",
      perspective: "",
    },
    {
      id: genId(),
      name: "",
      sentiment: "중립",
      issue: "",
      stocks: "",
      perspective: "",
    }
  ],
  expertAnalysis: "",
  expertAnalysisTitle: "RISING STOCK 모닝 브리핑",
  expertInterestedStocks: "",
  featuredStocksTitle: "오늘의 핵심 테마",
  sectorsTitle: "전일 글로벌 마켓 트렌드",
  scheduleTitle: "금일 주요 일정",
  coreViewTitle: "모닝 핵심 시황",
  expertAnalysisSubtitle: "개장 전 투자 전략",
  dailyComment: "",
  usMarketAnalysis: "",
  usMarketAnalysisTitle: "전일 미증시 마감 분석",
  domesticAnalysis: "",
  domesticAnalysisTitle: "전일 국내증시 특징섹터 및 특징종목",
  todayStrategy: "",
  todayStrategyTitle: "금일 시장전략",
};

// KST 기준: 06:00~17:59 → 장전, 18:00~05:59 → 마감
const getInitialReport = (): ReportData => {
  const hour = new Date().getHours(); // 브라우저 로컬 시간 (KST)
  return hour >= 6 && hour < 18 ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE;
};
export const INITIAL_REPORT = getInitialReport();
