/**
 * 네이버 증권 API를 통한 미국 주식 데이터 조회
 * - 로컬(Vite dev): /api/naver-stock/ 프록시 사용
 * - Vercel(배포): /api/proxy?url= 범용 프록시 사용
 * 
 * 검색 흐름:
 * 1. allStocks.json 기반 전종목 매핑(6,854개)에서 reutersCode 직접 조회
 * 2. 매핑에 없으면 → 네이버 자동완성 API(ac.stock.naver.com)로 검색
 * 3. 검색 결과의 reutersCode로 주가 데이터 조회
 */
import { findStock, type StockInfo } from './stockMap';

export interface StockPrice {
  name: string;         // 종목명 (영문)
  nameKr: string;       // 종목명 (한글)
  ticker: string;       // 티커
  price: string;        // 현재가 (포맷: "$188.68")
  change: string;       // 등락률 (포맷: "+1.26%" 또는 "-0.72%")
  closePrice: number;   // 종가 (숫자)
  changeRatio: number;  // 등락률 (숫자: -0.72)
  basePrice: number;    // 전일 종가 (숫자)
  marketStatus: string; // 'OPEN' | 'CLOSE' | 'PRE' | 'AFTER'
}

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

/**
 * 네이버 증권 API URL 생성
 */
function buildApiUrl(reutersCode: string): string {
  const naverApiUrl = `https://api.stock.naver.com/stock/${reutersCode}/basic`;

  if (isDev) {
    // 로컬 개발: Vite 프록시 사용
    return `/api/naver-stock/${reutersCode}/basic`;
  } else {
    // Vercel 배포: 범용 프록시 사용
    return `/api/proxy?url=${encodeURIComponent(naverApiUrl)}`;
  }
}

/**
 * API 응답 파싱 헬퍼
 */
function parseApiResponse(data: any, info: { nameEng: string; nameKr: string; ticker: string }): StockPrice | null {
  try {
    const closePrice = parseFloat(data.closePrice);
    if (isNaN(closePrice)) return null;

    const changeRatio = parseFloat(data.fluctuationsRatio) || 0;
    const basePrice = parseFloat(
      data.stockItemTotalInfos?.find((i: any) => i.code === 'basePrice')?.value?.replace(/,/g, '') || '0'
    );

    const formattedPrice = `$${closePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const sign = changeRatio >= 0 ? '+' : '';
    const formattedChange = `${sign}${changeRatio.toFixed(2)}%`;

    return {
      name: info.nameEng,
      nameKr: info.nameKr,
      ticker: info.ticker,
      price: formattedPrice,
      change: formattedChange,
      closePrice,
      changeRatio,
      basePrice,
      marketStatus: data.marketStatus || 'CLOSE',
    };
  } catch {
    return null;
  }
}

/**
 * 네이버 증권 자동완성 API로 한글/영문 종목명 → reutersCode 검색
 * 엔드포인트: ac.stock.naver.com/ac?q=검색어&target=stock
 */
function buildSearchUrl(query: string): string {
  const naverSearchUrl = `https://ac.stock.naver.com/ac?q=${encodeURIComponent(query)}&target=stock`;

  if (isDev) {
    return `/api/naver-search/ac?q=${encodeURIComponent(query)}&target=stock`;
  } else {
    return `/api/proxy?url=${encodeURIComponent(naverSearchUrl)}`;
  }
}

async function fetchBySearch(query: string): Promise<StockPrice | null> {
  try {
    const searchUrl = buildSearchUrl(query);
    console.log(`[StockFetcher] 검색 API 호출: "${query}"`);
    const response = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      console.warn(`[StockFetcher] 검색 API 응답 오류: ${response.status}`);
      return null;
    }

    const searchData = await response.json();

    // ac.stock.naver.com 응답: { query: "...", items: [...] }
    const items = searchData?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`[StockFetcher] 검색 결과 없음: "${query}"`);
      return null;
    }

    // 해외(미국) 종목 필터
    for (const item of items) {
      const reutersCode = item.reutersCode;
      const nationCode = item.nationCode || '';
      const category = item.category || '';

      // 미국 주식만 필터
      if (!reutersCode || (nationCode !== 'USA' && category !== 'stock')) continue;

      try {
        const url = buildApiUrl(reutersCode);
        const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) continue;

        const data = await resp.json();
        const ticker = item.code || reutersCode.split('.')[0];
        const result = parseApiResponse(data, {
          nameEng: data.stockNameEng || item.name || ticker,
          nameKr: data.stockName || item.name || query,
          ticker: ticker,
        });
        if (result) {
          console.log(`[StockFetcher] 검색 API 조회 성공: "${query}" → ${reutersCode} (${item.name})`);
          return result;
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error(`[StockFetcher] 검색 API 오류:`, error);
  }
  return null;
}

/**
 * 한글이 포함되어 있는지 확인
 */
function containsKorean(text: string): boolean {
  return /[가-힣]/.test(text);
}

/**
 * 종목명(한글/영문/티커)으로 주가 데이터 조회
 * 
 * 검색 우선순위:
 * 1. 전종목 매핑(6,854개)에서 정확한 reutersCode로 직접 조회
 * 2. 매핑에 없으면 → 네이버 자동완성 API로 reutersCode 검색 후 조회
 */
export async function fetchStockPrice(query: string): Promise<StockPrice | null> {
  // 1. 전종목 매핑에서 종목 찾기
  const stockInfo = findStock(query);

  if (stockInfo) {
    // 매핑에서 찾은 경우 → reutersCode로 바로 조회
    try {
      const url = buildApiUrl(stockInfo.reuters);
      console.log(`[StockFetcher] 매핑 조회: "${query}" → ${stockInfo.reuters} (${stockInfo.exchange})`);
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

      if (!response.ok) {
        console.error(`[StockFetcher] API 오류: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return parseApiResponse(data, stockInfo);
    } catch (error) {
      console.error(`[StockFetcher] 네트워크 오류:`, error);
      return null;
    }
  }

  // 2. 한글 입력인데 매핑에 없으면 → 부분 매칭 방지를 위해 바로 null 반환
  //    (6,854개 전종목 매핑이 있으므로 한글 정확 매칭만 허용)
  if (containsKorean(query)) {
    console.warn(`[StockFetcher] 한글 종목을 찾을 수 없습니다: "${query}"`);
    return null;
  }

  // 3. 영문 입력인데 매핑에 없으면 → 네이버 자동완성 검색 API로 폴백
  console.log(`[StockFetcher] 매핑에 없음, 검색 API 폴백: "${query}"`);
  const searchResult = await fetchBySearch(query);
  if (searchResult) return searchResult;

  console.warn(`[StockFetcher] 종목을 찾을 수 없습니다: "${query}"`);
  return null;
}
