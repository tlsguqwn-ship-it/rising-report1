/**
 * 장전리포트 전용 상수 및 템플릿
 * - 기존 constants.tsx를 import하지 않고 독립적 정의
 * - 기존 types.ts 타입만 읽기 전용으로 import
 */
import { ReportData, Sector, ThemeGroup, MarketSchedule } from '../types';

let _idCounter = Date.now();
const genId = () => `morning-${_idCounter++}`;

// 팩토리 함수
export const createEmptySector = (): Sector => ({
  id: genId(), name: '새 섹터', sentiment: '중립', issue: '', stocks: '', perspective: '',
});

export const createEmptyStock = (): ThemeGroup => ({
  id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }],
});

export const createEmptySchedule = (): MarketSchedule => ({
  id: genId(), time: '', event: '',
});

export const MAX_SECTORS = 5;
export const MAX_STOCKS = 10;
export const MAX_SCHEDULE = 5;

// 장전 리포트 기본 템플릿
export const MORNING_TEMPLATE: ReportData = {
  title: "RISING STOCK 장전 시황",
  date: "",
  reportType: "장전",
  summaryTitle: "미국 증시 및 글로벌 지표",
  currentMarketView: "",
  summaryItems: [
    { label: "NASDAQ", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "다우존스", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "VIX", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "야간선물", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "원달러환율", value: "0.00", subText: "0.00%", trend: "neutral" },
  ],
  subIndicators: [
    { label: "WTI/USD", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "금/USD", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "BTC", value: "0.00", subText: "0.00%", trend: "neutral" },
  ],
  marketSchedule: [
    { id: genId(), time: "09:00", event: "국내 증시 시초가 형성" },
    { id: genId(), time: "11:00", event: "한국은행 금통위 기준금리 결정" },
    { id: genId(), time: "22:30", event: "미국 CPI 발표" },
  ],
  featuredStocks: [
    {
      id: genId(), keyword: 'AI & HBM 반도체',
      stocks: [
        { name: 'Micron', price: '$108.20', change: '+9.94%' },
        { name: 'NVIDIA', price: '$875.30', change: '+2.10%' },
      ],
    },
    {
      id: genId(), keyword: '에너지 & 원자재',
      stocks: [
        { name: 'Exxon Mobil', price: '$112.50', change: '+1.80%' },
        { name: 'Newmont', price: '$42.30', change: '+2.30%' },
      ],
    },
    {
      id: genId(), keyword: 'AI 소프트웨어', sentiment: '약세',
      stocks: [
        { name: 'Unity', price: '$18.20', change: '-26.00%' },
        { name: 'Snowflake', price: '$165.40', change: '-3.20%' },
      ],
    },
    {
      id: genId(), keyword: '부동산 & REITs', sentiment: '약세',
      stocks: [
        { name: 'Realty Income', price: '$52.80', change: '-2.10%' },
        { name: 'American Tower', price: '$195.60', change: '-1.50%' },
      ],
    },
  ],
  sectors: [
    { id: genId(), name: "AI & HBM 반도체", sentiment: "긍정", issue: "마이크론 9.94% 급등, HBM 경쟁력 확인", stocks: "HPSP, 주성엔지니어링, 한미반도체", perspective: "" },
    { id: genId(), name: "에너지 & 안전자산", sentiment: "긍정", issue: "중동 2차 항모 배치로 유가 1% 상승", stocks: "S-Oil, GS, 한국가스공사", perspective: "" },
    { id: genId(), name: "AI 소프트웨어", sentiment: "부정", issue: "유니티 26% 하락 등 AI산업 재편", stocks: "유니티, 스노우플레이크", perspective: "" },
  ],
  expertAnalysis: "",
  expertAnalysisTitle: "RISING STOCK 모닝 브리핑",
  expertInterestedStocks: "한미반도체, HPSP, 레인보우로보틱스, 두산에너빌리티",
  featuredStocksTitle: "오늘의 주요 핵심 테마",
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
  usSectors: [
    { id: genId(), name: "반도체 & HBM", sentiment: "긍정", issue: "마이크론 9.94% 급등, HBM 경쟁력 확인", stocks: "마이크론, 엔비디아, TSMC", perspective: "", column: 0 },
    { id: genId(), name: "에너지 & 원자재", sentiment: "긍정", issue: "중동 2차 항모 배치로 유가 1% 상승", stocks: "엑손모빌, 셰브론, 뉴몬트", perspective: "", column: 1 },
    { id: genId(), name: "AI 소프트웨어", sentiment: "부정", issue: "유니티 26% 하락 등 소프트웨어주 약세", stocks: "유니티, 앱러빈, 스노우플레이크", perspective: "", column: 0 },
    { id: genId(), name: "부동산 & REITs", sentiment: "부정", issue: "고용 호조로 금리 인하 기대 후퇴", stocks: "리얼티인컴, 아메리칸타워", perspective: "", column: 1 },
  ],
  usSectorsTitle: "전일 미증시 섹터 트렌드",
};

// 빈 장전 리포트 (초기화용)
export const EMPTY_MORNING_TEMPLATE: ReportData = {
  ...MORNING_TEMPLATE,
  summaryItems: MORNING_TEMPLATE.summaryItems.map(i => ({ ...i, value: "0", subText: "0%" })),
  subIndicators: (MORNING_TEMPLATE.subIndicators || []).map(i => ({ ...i, value: "0", subText: "0%" })),
  marketSchedule: [createEmptySchedule(), createEmptySchedule(), createEmptySchedule()],
  featuredStocks: [createEmptyStock(), createEmptyStock(), createEmptyStock(), createEmptyStock()],
  sectors: [createEmptySector(), createEmptySector(), createEmptySector()],
  usSectors: [
    { ...createEmptySector(), column: 0 }, { ...createEmptySector(), column: 1 },
    { ...createEmptySector(), column: 0 }, { ...createEmptySector(), column: 1 },
  ],
  expertAnalysis: "",
  expertInterestedStocks: "",
  usMarketAnalysis: "",
  domesticAnalysis: "",
  todayStrategy: "",
  dailyComment: "",
};

// localStorage 키
export const STORAGE_KEY = 'morning_report_data';

// 저장/로드 유틸
export function saveMorningData(data: ReportData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function loadMorningData(): ReportData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as ReportData;
  } catch {}
  return JSON.parse(JSON.stringify(MORNING_TEMPLATE));
}
