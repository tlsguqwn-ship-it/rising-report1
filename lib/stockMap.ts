// 미국 전종목 매핑 사전
// allStocks.json (6,854개 종목)에서 자동 구축 + 수동 별칭(ALIASES) 보완
// key: 한글명/영문명/티커(소문자) → value: StockInfo

import allStocksData from './allStocks.json';

export interface StockInfo {
  reuters: string;   // e.g. "NVDA.O", "KO", "BMNR.K"
  nameKr: string;    // e.g. "엔비디아"
  nameEng: string;   // e.g. "NVIDIA Corp"
  ticker: string;    // e.g. "NVDA"
  exchange: string;  // "NASDAQ" | "NYSE" | "AMEX"
}

// --- allStocks.json에서 StockInfo 배열 생성 ---
const STOCK_LIST: StockInfo[] = (allStocksData.stocks as any[]).map((s) => ({
  reuters: s.reuters,
  nameKr: s.nameKr,
  nameEng: s.nameEng,
  ticker: s.ticker,
  exchange: s.exchange,
}));

// 한글 포함 여부 확인
function containsKorean(text: string): boolean {
  return /[가-힣]/.test(text);
}

// --- 검색 인덱스 구축 ---
const searchIndex = new Map<string, StockInfo>();

for (const stock of STOCK_LIST) {
  // 티커 (소문자)
  searchIndex.set(stock.ticker.toLowerCase(), stock);
  // 로이터코드 (소문자)
  searchIndex.set(stock.reuters.toLowerCase(), stock);
  // 영문명 (공백 제거, 소문자)
  searchIndex.set(stock.nameEng.replace(/\s+/g, '').toLowerCase(), stock);

  // 한글명 처리: 전체 이름만 인덱싱 (개별 단어 인덱싱 제거 - 부분 매칭 방지)
  const krFull = stock.nameKr.replace(/\s+/g, '').toLowerCase();
  searchIndex.set(krFull, stock);
}

// 사용자 편의 별칭 추가
const ALIASES: Record<string, string> = {
  // 주요 종목 약칭 (공백 포함 한글명의 통상적 약칭)
  '엔비디아': 'nvda',
  '마이크론': 'mu',
  '마이크론테크놀로지': 'mu',
  '테슬라모터스': 'tsla',
  '알파벳': 'googl',
  '구글': 'googl',
  '페이스북': 'meta',
  '메타': 'meta',
  '아마존': 'amzn',
  '아마존닷컴': 'amzn',
  '마소': 'msft',
  '마이크로소프트': 'msft',
  '브컴': 'avgo',
  '브로드컴': 'avgo',
  '일릴리': 'lly',
  '노보': 'nvo',
  '존앤존': 'jnj',
  'jp모건': 'jpm',
  '골만삭스': 'gs',
  '골드만삭스': 'gs',
  '모건스탠리': 'ms',
  '뱅오아': 'bac',
  '버크셔': 'brk.b',
  '맥도날드': 'mcd',
  '어도비': 'adbe',
  '넷플릭스': 'nflx',
  '인텔': 'intc',
  '퀄컴': 'qcom',
  '코스트코': 'cost',
  '스타벅스': 'sbux',
  '월마트': 'wmt',
  '사렙타': 'srpt',
  // ETF 별칭
  '나스닥3배': 'tqqq',
  '나스닥인버스3배': 'sqqq',
  '반도체etf': 'soxx',
  '반도체3배': 'soxl',
};

for (const [alias, ticker] of Object.entries(ALIASES)) {
  const stock = searchIndex.get(ticker);
  if (stock) {
    searchIndex.set(alias.toLowerCase(), stock);
  }
}

/**
 * 종목명(한글/영문/티커)으로 StockInfo 검색
 * 
 * 한글 검색 규칙:
 * - "마이크론테크놀로지" 같은 전체 한글명(공백 제거) → 검색 가능
 * - "마이크로", "코카" 같은 부분 문자열 → 검색 안됨
 * - "엔비디아", "마소" 같은 ALIASES에 등록된 별칭 → 검색 가능
 * 
 * 영문 검색 규칙:
 * - 티커(NVDA, SRPT 등)는 정확 매칭
 * - 영문명(Nvidia, Sarepta 등)은 부분 매칭 허용
 */
export function findStock(query: string): StockInfo | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 공백 제거 + 소문자 정규화
  const normalized = trimmed.replace(/\s+/g, '').toLowerCase();

  // 1. 정확히 매칭 (인덱스 조회)
  //    - 티커, 로이터코드, 전체 한글명, 전체 영문명
  //    - 한글명 개별 단어 (공백 구분 단어 각각)
  //    - 별칭 (마소→MSFT 등)
  const exact = searchIndex.get(normalized);
  if (exact) return exact;

  // 2. 한글 입력인 경우 → 인덱스 매칭만 허용 (부분 매칭 불가)
  //    인덱스에 없으면 null 반환
  if (containsKorean(trimmed)) {
    return null;
  }

  // 3. 영문 입력인 경우 → 영문명 부분 매칭
  for (const stock of STOCK_LIST) {
    if (stock.nameEng.replace(/\s+/g, '').toLowerCase().includes(normalized)) return stock;
  }

  return null;
}

/**
 * 모든 종목 목록 반환 (자동완성용)
 */
export function getAllStocks(): StockInfo[] {
  return STOCK_LIST;
}

/**
 * 종목 수 확인
 */
export function getStockCount(): { total: number; nasdaq: number; nyse: number; amex: number } {
  return {
    total: STOCK_LIST.length,
    nasdaq: STOCK_LIST.filter(s => s.exchange === 'NASDAQ').length,
    nyse: STOCK_LIST.filter(s => s.exchange === 'NYSE').length,
    amex: STOCK_LIST.filter(s => s.exchange === 'AMEX').length,
  };
}

/**
 * 자동완성용 종목 검색 — 부분 매칭으로 후보 목록 반환
 * 
 * 검색 로직:
 * - 한글 입력 → 한글명에 포함(includes)되는 모든 종목
 * - 영문 입력 → 티커 시작(startsWith) + 영문명 포함(includes) 매칭
 * - ALIASES 별칭도 검색 대상에 포함
 * - 정확히 일치하는 항목은 맨 앞으로 정렬
 * 
 * @param query 검색어
 * @param limit 최대 반환 개수 (기본 10)
 * @returns 매칭된 StockInfo 배열
 */
export function searchStocks(query: string, limit: number = 10): StockInfo[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) return [];

  const normalized = trimmed.replace(/\s+/g, '').toLowerCase();
  if (!normalized) return [];

  // 중복 방지용 Set (reuters 코드 기준)
  const seen = new Set<string>();
  const results: StockInfo[] = [];
  const exactMatches: StockInfo[] = [];

  // 1. 정확 매칭 체크 (인덱스)
  const exact = searchIndex.get(normalized);
  if (exact) {
    exactMatches.push(exact);
    seen.add(exact.reuters);
  }

  // 2. ALIASES에서 부분 매칭 체크
  for (const [alias, ticker] of Object.entries(ALIASES)) {
    if (alias.toLowerCase().includes(normalized)) {
      const stock = searchIndex.get(ticker);
      if (stock && !seen.has(stock.reuters)) {
        results.push(stock);
        seen.add(stock.reuters);
      }
    }
  }

  // 3. 전체 종목 리스트에서 부분 매칭
  const isKorean = containsKorean(trimmed);

  for (const stock of STOCK_LIST) {
    if (seen.has(stock.reuters)) continue;
    if (results.length + exactMatches.length >= limit) break;

    if (isKorean) {
      // 한글 입력 → 한글명에 포함
      const krName = stock.nameKr.replace(/\s+/g, '').toLowerCase();
      if (krName.includes(normalized)) {
        results.push(stock);
        seen.add(stock.reuters);
      }
    } else {
      // 영문 입력 → 티커 시작 매칭 또는 영문명 포함 매칭
      const ticker = stock.ticker.toLowerCase();
      const engName = stock.nameEng.replace(/\s+/g, '').toLowerCase();

      if (ticker.startsWith(normalized) || engName.includes(normalized)) {
        results.push(stock);
        seen.add(stock.reuters);
      }
    }
  }

  // 정확 매칭을 맨 앞에 배치
  return [...exactMatches, ...results].slice(0, limit);
}
