
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
  stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }],
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
export const MAX_STOCKS = 10;
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
// 마감 리포트 템플릿 (전문가 콘텐츠 포함)
// ===========================
export const CLOSE_REPORT_TEMPLATE: ReportData = {
  title: "RISING STOCK 마감 시황",
  date: "",
  reportType: "마감",
  summaryTitle: "국내 증시 및 수급 현황",
  currentMarketView: "",
  summaryItems: [
    { label: "KOSPI", value: "2,620", subText: "+18.5 +0.71%", trend: "up" },
    { label: "KOSDAQ", value: "745", subText: "+5.2 +0.70%", trend: "up" },
    { label: "KOSPI 외인", value: "+2,850억", subText: "순매수", trend: "up" },
    { label: "KOSPI 기관", value: "+1,200억", subText: "순매수", trend: "up" },
    { label: "KOSDAQ 외인", value: "-320억", subText: "순매도", trend: "down" },
    { label: "KOSDAQ 기관", value: "+580억", subText: "순매수", trend: "up" },
    { label: "원달러환율", value: "1,452", subText: "-3.5 -0.24%", trend: "down" }
  ],
  marketSchedule: [
    { id: genId(), time: "장마감", event: "국내 소비자물가지수(CPI) 발표" },
    { id: genId(), time: "22:30", event: "미국 고용지표 발표" },
    { id: genId(), time: "", event: "" }
  ],
  featuredStocks: [
    {
      id: genId(),
      keyword: '반도체 장비',
      stocks: [
        { name: '삼성전자', price: '58,200', change: '+1.2%' },
        { name: 'SK하이닉스', price: '198,000', change: '+2.8%' },
      ],
    },
    {
      id: genId(),
      keyword: '휴머노이드 로봇',
      stocks: [
        { name: 'LG전자', price: '112,000', change: '+4.5%' },
        { name: '현대차', price: '245,000', change: '+2.1%' },
      ],
    },
    {
      id: genId(),
      keyword: '원전 & 에너지',
      stocks: [
        { name: '두산에너빌리티', price: '22,500', change: '+3.8%' },
        { name: '한전기술', price: '85,000', change: '+2.5%' },
      ],
    },
    {
      id: genId(),
      keyword: '소비재 & 유통',
      stocks: [
        { name: '이마트', price: '78,000', change: '+5.2%' },
        { name: 'BGF리테일', price: '145,000', change: '+1.8%' },
      ],
    },
  ],
  sectors: [
    {
      id: genId(),
      name: "반도체 장비",
      sentiment: "긍정",
      issue: "마이크론 9.94% 급등에 따른 HBM 관련 장비주 강세",
      stocks: "삼성전자, SK하이닉스, 한미반도체",
      perspective: "",
    },
    {
      id: genId(),
      name: "휴머노이드 로봇",
      sentiment: "긍정",
      issue: "LG전자·현대차 로봇 강화 소식에 관련주 급등",
      stocks: "LG전자, 현대차, 레인보우로보틱스",
      perspective: "",
    },
    {
      id: genId(),
      name: "원전",
      sentiment: "긍정",
      issue: "대미 원전 협력 소식에 원전주 강세",
      stocks: "두산에너빌리티, 한전기술",
      perspective: "",
    },
  ],
  expertAnalysis: "",
  expertAnalysisTitle: "RISING STOCK 마감 브리핑",
  expertInterestedStocks: "삼성전자, SK하이닉스, LG전자",
  featuredStocksTitle: "오늘의 주요 종목",
  sectorsTitle: "금일 마감 섹터 트렌드",
  scheduleTitle: "내일 주요 일정",
  coreViewTitle: "마감 시황 요약",
  expertAnalysisSubtitle: "장 마감 총평 및 전략",
  dailyComment: "",
  usMarketAnalysis: "금리 인하 기대 소멸: 1월 고용 예상 7만건을 두 배나 앞지른 13만건 기록.\nAI산업 변화로 유니티 26% 하락 등 소프트웨어주 및 부동산주 하락한 반면\nAI 하드웨어 핵심인 반도체주 견조.\n\n반도체 섹터의 독주\n마이크론 9.94% 상승이 HBM 경쟁력 루머를 반박하며 엔비디아/TSMC 등 반도체주 강세 마감.\n\n에너지 안전자산 강세:\n중동 내 미국 2차 항모 배치 소식에 따른 유가 1% 상승하며 금, 에너지 관련주 상승 마감.",
  usMarketAnalysisTitle: "전일 미증시 마감 분석",
  domesticAnalysis: "1. 코스피 5,300선 돌파: 외인과 기관 강력한 동반 매수로 증시 하방경직성 확인 중.\n2. 피지컬 AI와 반도체의 독주: LG전자, 현대차 로봇 강화 소식에 23% 급등\n3. 대미 원전 협력에 원전주 강세\n4. 실적 및 주주환원 모멘텀, 새벽배송 모멘텀에 이마트 및 소비재 강세",
  domesticAnalysisTitle: "전일 국내증시 특징섹터 및 특징종목",
  todayStrategy: "마이크론 9% 상승에 국내장 반도체 강세 시작.\n코스피 갭상승 출발 유력 (역사상 신고가)\n신고가 이후 하방경직성 체크 후 매매 유효.\n반도체 > 휴머노이드로봇 > 전력설비 > 원전 > 우주항공 지속되는 테마순환매\n따라잡는 매매보다 길목에서 기다리는 매매 필수전략.",
  todayStrategyTitle: "금일 시장전략",
};

// ===========================
// 장전 리포트 템플릿 (전문가 콘텐츠 포함)
// ===========================
export const PRE_MARKET_REPORT_TEMPLATE: ReportData = {
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
    { label: "원달러환율", value: "0.00", subText: "0.00%", trend: "neutral" }
  ],
  subIndicators: [
    { label: "WTI/USD", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "금/USD", value: "0.00", subText: "0.00%", trend: "neutral" },
    { label: "BTC", value: "0.00", subText: "0.00%", trend: "neutral" }
  ],
  marketSchedule: [
    { id: genId(), time: "09:00", event: "국내 증시 시초가 형성" },
    { id: genId(), time: "11:00", event: "한국은행 금통위 기준금리 결정" },
    { id: genId(), time: "22:30", event: "미국 CPI 발표" }
  ],
  featuredStocks: [
    {
      id: genId(),
      keyword: 'AI & HBM 반도체',
      stocks: [
        { name: 'Micron', price: '$108.20', change: '+9.94%' },
        { name: 'NVIDIA', price: '$875.30', change: '+2.10%' },
      ],
    },
    {
      id: genId(),
      keyword: '에너지 & 원자재',
      stocks: [
        { name: 'Exxon Mobil', price: '$112.50', change: '+1.80%' },
        { name: 'Newmont', price: '$42.30', change: '+2.30%' },
      ],
    },
    {
      id: genId(),
      keyword: 'AI 소프트웨어',
      sentiment: '약세',
      stocks: [
        { name: 'Unity', price: '$18.20', change: '-26.00%' },
        { name: 'Snowflake', price: '$165.40', change: '-3.20%' },
      ],
    },
    {
      id: genId(),
      keyword: '부동산 & REITs',
      sentiment: '약세',
      stocks: [
        { name: 'Realty Income', price: '$52.80', change: '-2.10%' },
        { name: 'American Tower', price: '$195.60', change: '-1.50%' },
      ],
    },
  ],
  sectors: [
    {
      id: genId(),
      name: "AI & HBM 반도체",
      sentiment: "긍정",
      issue: "마이크론 9.94% 급등, HBM 경쟁력 확인. 반도체 소부장 테마 매수세 유입",
      stocks: "HPSP, 주성엔지니어링, 한미반도체",
      perspective: "",
    },
    {
      id: genId(),
      name: "에너지 & 안전자산",
      sentiment: "긍정",
      issue: "중동 2차 항모 배치로 유가 1% 상승, 금·에너지 관련주 강세",
      stocks: "S-Oil, GS, 한국가스공사",
      perspective: "",
    },
    {
      id: genId(),
      name: "AI 소프트웨어",
      sentiment: "부정",
      issue: "유니티 26% 하락 등 AI산업 재편에 따른 소프트웨어주 약세",
      stocks: "유니티, 스노우플레이크",
      perspective: "",
    },
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
  usMarketAnalysis: "금리 인하 기대 소멸: 1월 고용 예상 7만건을 두 배나 앞지른 13만건 기록.\nAI산업 변화로 유니티 26% 하락 등 소프트웨어주 및 부동산주 하락한 반면\nAI 하드웨어 핵심인 반도체주 견조.\n\n반도체 섹터의 독주\n마이크론 9.94% 상승이 HBM 경쟁력 루머를 반박하며 엔비디아/TSMC 등 반도체주 강세 마감.\n\n에너지 안전자산 강세:\n중동 내 미국 2차 항모 배치 소식에 따른 유가 1% 상승하며 금, 에너지 관련주 상승 마감.",
  usMarketAnalysisTitle: "전일 미증시 마감 분석",
  domesticAnalysis: "1. 코스피 5,300선 돌파: 외인과 기관 강력한 동반 매수로 증시 하방경직성 확인 중.\n2. 피지컬 AI와 반도체의 독주: LG전자, 현대차 로봇 강화 소식에 23% 급등\n3. 대미 원전 협력에 원전주 강세\n4. 실적 및 주주환원 모멘텀, 새벽배송 모멘텀에 이마트 및 소비재 강세",
  domesticAnalysisTitle: "전일 국내증시 특징섹터 및 특징종목",
  todayStrategy: "마이크론 9% 상승에 국내장 반도체 강세 시작.\n코스피 갭상승 출발 유력 (역사상 신고가)\n신고가 이후 하방경직성 체크 후 매매 유효.\n반도체 > 휴머노이드로봇 > 전력설비 > 원전 > 우주항공 지속되는 테마순환매\n따라잡는 매매보다 길목에서 기다리는 매매 필수전략.",
  todayStrategyTitle: "금일 시장전략",
  usSectors: [
    {
      id: genId(),
      name: "반도체 & HBM",
      sentiment: "긍정",
      issue: "마이크론 9.94% 급등, HBM 경쟁력 확인. 엔비디아·TSMC 견조",
      stocks: "마이크론, 엔비디아, TSMC",
      perspective: "",
      column: 0,
    },
    {
      id: genId(),
      name: "에너지 & 원자재",
      sentiment: "긍정",
      issue: "중동 2차 항모 배치 소식에 유가 1% 상승, 금 강세",
      stocks: "엑손모빌, 셰브론, 뉴몬트",
      perspective: "",
      column: 1,
    },
    {
      id: genId(),
      name: "AI 소프트웨어",
      sentiment: "부정",
      issue: "유니티 26% 하락 등 AI산업 재편 소프트웨어주 약세",
      stocks: "유니티, 앱러빈, 스노우플레이크",
      perspective: "",
      column: 0,
    },
    {
      id: genId(),
      name: "부동산 & REITs",
      sentiment: "부정",
      issue: "고용 호조로 금리 인하 기대 후퇴, 부동산주 하락",
      stocks: "리얼티인컴, 아메리칸타워",
      perspective: "",
      column: 1,
    },
  ],
  usSectorsTitle: "전일 미증시 섹터 트렌드",
};

// ===========================
// 빈 템플릿 (초기화용) - 장전
// ===========================
export const EMPTY_PRE_MARKET_TEMPLATE: ReportData = {
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
    { id: genId(), time: "", event: "" },
    { id: genId(), time: "", event: "" },
    { id: genId(), time: "", event: "" }
  ],
  featuredStocks: [
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
  ],
  sectors: [
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "" },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "" },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "" },
  ],
  expertAnalysis: "",
  expertAnalysisTitle: "RISING STOCK 모닝 브리핑",
  expertInterestedStocks: "",
  featuredStocksTitle: "오늘의 주요 핵심 테마",
  sectorsTitle: "전일 글로벌 마켓 트렌드",
  scheduleTitle: "금일 주요 일정",
  coreViewTitle: "모닝 핵심 시황",
  expertAnalysisSubtitle: "개장 전 투자 전략",
  dailyComment: "",
  usMarketAnalysis: "\n\n\n",
  usMarketAnalysisTitle: "전일 미증시 마감 분석",
  domesticAnalysis: "\n\n\n",
  domesticAnalysisTitle: "전일 국내증시 특징섹터 및 특징종목",
  todayStrategy: "\n\n\n",
  todayStrategyTitle: "금일 시장전략",
  usSectors: [
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "", column: 0 },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "", column: 1 },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "", column: 0 },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "", column: 1 },
  ],
  usSectorsTitle: "전일 미증시 섹터 트렌드",
};

// ===========================
// 빈 템플릿 (초기화용) - 마감
// ===========================
export const EMPTY_CLOSE_TEMPLATE: ReportData = {
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
    { id: genId(), time: "", event: "" },
    { id: genId(), time: "", event: "" },
    { id: genId(), time: "", event: "" }
  ],
  featuredStocks: [
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
    { id: genId(), keyword: '', stocks: [{ name: '', price: '', change: '' }, { name: '', price: '', change: '' }] },
  ],
  sectors: [
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "" },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "" },
    { id: genId(), name: "", sentiment: "중립", issue: "", stocks: "", perspective: "" },
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

// KST 기준: 06:00~17:59 → 장전, 18:00~05:59 → 마감
const getInitialReport = (): ReportData => {
  const hour = new Date().getHours(); // 브라우저 로컬 시간 (KST)
  return hour >= 6 && hour < 18 ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE;
};
export const INITIAL_REPORT = getInitialReport();
