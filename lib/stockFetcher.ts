/**
 * 네이버 증권 API를 통한 미국 주식 데이터 조회
 * - 로컬(Vite dev): /api/naver-stock/ 프록시 사용
 * - Vercel(배포): /api/proxy?url= 범용 프록시 사용
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
 * 종목명(한글/영문/티커)으로 주가 데이터 조회
 * @param query 사용자 입력 (예: "엔비디아", "NVDA", "nvidia", "마이크론")
 * @returns StockPrice | null
 */
export async function fetchStockPrice(query: string): Promise<StockPrice | null> {
  // 1. 매핑 사전에서 종목 찾기
  const stockInfo = findStock(query);
  if (!stockInfo) {
    console.warn(`[StockFetcher] 종목을 찾을 수 없습니다: "${query}"`);
    return null;
  }

  try {
    const url = buildApiUrl(stockInfo.reuters);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[StockFetcher] API 오류: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // API 응답에서 데이터 추출
    const closePrice = parseFloat(data.closePrice);
    const changeRatio = parseFloat(data.fluctuationsRatio);
    const basePrice = parseFloat(
      data.stockItemTotalInfos?.find((i: any) => i.code === 'basePrice')?.value?.replace(/,/g, '') || '0'
    );

    // 가격 포맷: $XXX.XX
    const formattedPrice = `$${closePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 등락률 포맷: +X.XX% 또는 -X.XX%
    const sign = changeRatio >= 0 ? '+' : '';
    const formattedChange = `${sign}${changeRatio.toFixed(2)}%`;

    return {
      name: stockInfo.nameEng,
      nameKr: stockInfo.nameKr,
      ticker: stockInfo.ticker,
      price: formattedPrice,
      change: formattedChange,
      closePrice,
      changeRatio,
      basePrice,
      marketStatus: data.marketStatus || 'CLOSE',
    };
  } catch (error) {
    console.error(`[StockFetcher] 네트워크 오류:`, error);
    return null;
  }
}
