
import { ReportData, Sector, FeaturedStock, MarketSchedule } from './types';

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

export const createEmptyStock = (): FeaturedStock => ({
  id: genId(),
  name: '',
  change: '',
  reason: '',
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
  date: "2026년 2월 10일 (월) 15:40 발행",
  reportType: "마감",
  summaryTitle: "국내 증시 및 수급 현황",
  currentMarketView: "코스피 2,540선 하회. 외국인 반도체 집중 매도로 지수 하방 압력 심화. 제약/바이오 섹터 순환매 유입은 긍정적.",
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
    { id: genId(), time: "장마감", event: "국내 소비자물가지수(CPI) 2.8% 발표 - 금리 인하 기대감 소폭 후퇴" },
    { id: genId(), time: "16:00", event: "시간외 단일가 - 반도체 소부장 일부 종목 기술적 반등 흐름 포착" },
    { id: genId(), time: "익일예정", event: "美 비농업 고용지수 발표 - 차주 국내 증시 방향성 결정할 핵심 변수" }
  ],
  featuredStocks: [
    { id: genId(), name: "삼성전자", change: "-2.45%", reason: "엔비디아 발 AI 과열 우려 및 외인 대규모 매도세 집중 출회" },
    { id: genId(), name: "알테오젠", change: "+4.12%", reason: "독점 라이선스 계약 변경 및 로열티 수익성 개선 모멘텀 지속 반영" },
    { id: genId(), name: "HLB", change: "+3.21%", reason: "FDA 신약 허가 기대감 재부각되며 제약/바이오 수급 흡수" }
  ],
  sectors: [
    {
      id: genId(),
      name: "바이오 & CDMO",
      sentiment: "긍정",
      issue: "미국 생물보안법 수혜 및 금리 인하 기대감에 따른 성장주 중심 수급 개선세 뚜렷.",
      stocks: "삼성바이오로직스, 셀트리온, 유한양행",
      perspective: "섹터 대장주 위주 홀딩 전략 유효.",
    },
    {
      id: genId(),
      name: "반도체 소부장",
      sentiment: "부정",
      issue: "글로벌 빅테크 차익실현 매물 출회 및 삼성전자 수급 이탈 여파로 업항 우려 확산.",
      stocks: "한미반도체, 이오테크닉스, 리노공업",
      perspective: "추세 전환 확인 전까지 보수적 접근.",
    },
    {
      id: genId(),
      name: "방위산업",
      sentiment: "중립",
      issue: "지정학적 리스크 지속되나 단기 급등에 따른 피로감 누적으로 숨고르기 장세 진입.",
      stocks: "현대로템, LIG넥스원",
      perspective: "눌림목 매수 관점 유지.",
    }
  ],
  expertAnalysis: "지수는 무겁지만 개별 종목 장세는 활발합니다. 특히 '숫자'가 확인되는 바이오와 방산 섹터로의 압축이 필요합니다. 매크로 불확실성(환율)이 해소되기 전까지는 대형주보다는 정책 수혜가 예상되는 중소형주 위주의 탄력적인 대응을 권고합니다. 차주 고용지표 발표 전까지 현금 비중 30% 유지 전략이 유리합니다.",
  expertAnalysisTitle: "RISING STOCK 마감 브리핑",
  expertInterestedStocks: "알테오젠, HLB, 현대중공업",
  featuredStocksTitle: "오늘의 주요 종목",
  sectorsTitle: "금일 마감 섹터 트렌드",
  scheduleTitle: "내일 주요 일정",
  coreViewTitle: "마감 시황 요약",
  expertAnalysisSubtitle: "장 마감 총평 및 전략",
  dailyComment: "오늘 시장의 피로감은 일시적입니다. 핵심 섹터의 실적 모멘텀이 살아있는 한 조정은 매수 기회입니다."
};

// ===========================
// 장전 리포트 템플릿
// ===========================
export const PRE_MARKET_REPORT_TEMPLATE: ReportData = {
  title: "RISING STOCK 마켓 데일리",
  date: "2026년 2월 10일 (월) 08:20 발행",
  reportType: "장전",
  summaryTitle: "미국 증시 및 글로벌 지표",
  currentMarketView: "나스닥 1.6% 하락, 빅테크 차익실현. 반도체 지수 2.4% 반등으로 국내 IT 하방 경직성 기대.",
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
    { id: genId(), time: "09:00", event: "국내 증시 시초가 형성 - 미국 반도체주 반등 영향으로 갭상승 출발" },
    { id: genId(), time: "10:30", event: "중국 장중 주요 경제지표 발표 - 중화권 증시 연동성 주의" },
    { id: genId(), time: "22:30", event: "美 고용보고서 발표 전 관망세 유입 가능성 상존" }
  ],
  featuredStocks: [
    { id: genId(), name: "엔비디아 AI 실적", change: "한미반도체, HPSP", reason: "미국 AI 칩 수요 폭증 및 마이크론 실적 호조에 따른 장비주 낙수효과" },
    { id: genId(), name: "생물보안법 통과", change: "삼성바이오, 바이넥스", reason: "미국 의회 생물보안법 추진 가속화로 인한 국내 CDMO 반사이익 기대" },
    { id: genId(), name: "체코 원전 수주", change: "두산에너빌, 우리기술", reason: "체코 원전 우선협상대상자 선정 후속 조치 및 정부의 정책적 지원 강화" }
  ],
  sectors: [
    {
      id: genId(),
      name: "AI & HBM 장비",
      sentiment: "긍정",
      issue: "미국 반도체 지수 강세로 국내 소부장 테마 전반에 시초가부터 강한 매수세 유입 가능성.",
      stocks: "HPSP, 주성엔지니어링, 이오테크닉스",
      perspective: "시초가 추격 매수보다는 눌림목 대응.",
    },
    {
      id: genId(),
      name: "전고체 배터리",
      sentiment: "중립",
      issue: "차세대 배터리 기술 개발 로드맵 공개에 따른 정책 모멘텀 부각.",
      stocks: "삼성SDI, 이수스페셜티케미컬",
      perspective: "단기 이슈 소멸 여부 확인 필요.",
    },
    {
      id: genId(),
      name: "원자력 발전",
      sentiment: "긍정",
      issue: "체코 원전 수주 기대감 및 정부의 K-원전 수출 지원 사격 지속.",
      stocks: "두산에너빌리티, 우리기술",
      perspective: "중장기 관점 저점 매수 유효.",
    }
  ],
  expertAnalysis: "나스닥 차익실현에도 반도체 지수의 반등은 국내 증시에 강력한 하방 경직성을 제공할 것입니다. 시초가 갭상승 이후 매물 소화 과정을 확인하며 핵심 주도주(반도체/바이오) 위주로 분할 매수 대응하십시오. 금일 코스피 예상 밴드는 2,520~2,560pt이며, 장중 외국인 선물 매수세 유입 시 탄력적인 상승 전환이 가능합니다.",
  expertAnalysisTitle: "RISING STOCK 모닝 브리핑",
  expertInterestedStocks: "SK하이닉스, 가온칩스, 에이디테크놀로지",
  featuredStocksTitle: "오늘의 핵심 테마",
  sectorsTitle: "전일 글로벌 마켓 트렌드",
  scheduleTitle: "금일 주요 일정",
  coreViewTitle: "모닝 핵심 시황",
  expertAnalysisSubtitle: "개장 전 투자 전략",
  dailyComment: "변동성이 큰 장세에서는 포지션 사이즈 조절이 핵심입니다. 핵심 주도주 위주로 분할 매수 전략을 유지하세요."
};

// KST 기준: 06:00~17:59 → 장전, 18:00~05:59 → 마감
const getInitialReport = (): ReportData => {
  const hour = new Date().getHours(); // 브라우저 로컬 시간 (KST)
  return hour >= 6 && hour < 18 ? PRE_MARKET_REPORT_TEMPLATE : CLOSE_REPORT_TEMPLATE;
};
export const INITIAL_REPORT = getInitialReport();
