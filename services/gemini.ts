
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

// Vercel 배포 시 프록시 사용, 로컬에서는 Vite 프록시 사용
const IS_VERCEL = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

const naverUrl = (path: string) => {
  if (IS_VERCEL) {
    return `/api/proxy?url=${encodeURIComponent(`https://finance.naver.com${path}`)}`;
  }
  return `/api/naver-finance${path}`;
};

const perplexityUrl = (path: string) => {
  if (IS_VERCEL) {
    return `/api/proxy?url=${encodeURIComponent(`https://api.perplexity.ai${path}`)}`;
  }
  return `/api/perplexity${path}`;
};

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Generates a stock market report using Gemini.
 * Strictly follows 'Rising' service persona, BLUF style, and A4 1-page layout constraints.
 */
export const generateReportFromAI = async (prompt: string): Promise<ReportData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the CEO and Lead Analyst of 'Rising', a premium investment advisory service. 
      Generate a comprehensive South Korean stock market report in JSON format based on: ${prompt}.

      [STRICT PERSONA & STYLE]
      1. STYLE: Use BLUF (Bottom Line Up Front). Eliminate all introductory remarks, pleasantries, or legal disclaimers.
      2. PERSOAN: Authoritative, high-conviction professional intelligence. Focus on actionable insights for high-net-worth investors.
      3. LAYOUT: Must fit precisely on one A4 page. Keep all descriptions concise.

      [STRICT MODE LOGIC]
      - IF PRE-MARKET ('장전'):
          * Title: [장전 REPORT] RISING STOCK 마켓 데일리 리포트
          * Indicators: Focus on S&P 500, NASDAQ, SOX (Semiconductor), USD/KRW.
          * Core View: 'MORNING CORE VIEW' - Focus on US market finish impact on KR opening.
          * Table Title: 'TODAY'S HOT THEME'
          * Table Structure: [Issue Keyword] | [Related KR Stocks] | [Investment Point].
          * Insight Title: 'CEO 모닝 브리핑'
          * Insight Strategy: BLUF strategy for opening bell, focus on index bands and risk management.
          * Sector Section: '글로벌 마켓 트렌드'
          * Schedule Section: '금일 주요 일정'
      - IF POST-MARKET ('마감'):
          * Title: [마감 REPORT] RISING STOCK 마켓 데일리 리포트
          * Indicators: Focus on KOSPI, KOSDAQ, Foreign Net Buying, Institutional Net Buying.
          * Core View: 'MARKET CORE VIEW' - Factor breakdown of why KR market moved today.
          * Table Title: 'DAILY FEATURED STOCKS'
          * Table Structure: [Stock Name] | [Change %] | [Reason for Movement/Analysis].
          * Insight Title: '수석 애널리스트 인사이트'
          * Insight Strategy: BLUF closing summary, after-hours check points, and strategy for tomorrow.
          * Sector Section: '주요 섹터 트렌드'
          * Schedule Section: '내일 주요 일정'

      Today's date is ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            reportType: { type: Type.STRING, enum: ['장전', '마감'] },
            summaryTitle: { type: Type.STRING },
            currentMarketView: { type: Type.STRING },
            summaryItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  subText: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] }
                },
                required: ['label', 'value', 'subText', 'trend']
              }
            },
            expertAnalysis: { type: Type.STRING },
            expertAnalysisTitle: { type: Type.STRING },
            expertInterestedStocks: { type: Type.STRING },
            featuredStocksTitle: { type: Type.STRING },
            sectorsTitle: { type: Type.STRING },
            scheduleTitle: { type: Type.STRING },
            coreViewTitle: { type: Type.STRING },
            expertAnalysisSubtitle: { type: Type.STRING },
            marketSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  event: { type: Type.STRING }
                },
                required: ['time', 'event']
              }
            },
            featuredStocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  change: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['name', 'change', 'reason']
              }
            },
            sectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  name: { type: Type.STRING },
                  sentiment: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  stocks: { type: Type.STRING },
                  perspective: { type: Type.STRING },
                  color: { type: Type.STRING }
                },
                required: ['id', 'name', 'sentiment', 'issue', 'stocks', 'perspective', 'color']
              }
            }
          },
          required: [
            'title', 'date', 'reportType', 'summaryTitle', 'currentMarketView', 
            'summaryItems', 'expertAnalysis', 'expertAnalysisTitle', 
            'expertInterestedStocks', 'marketSchedule', 'featuredStocks', 'sectors',
            'featuredStocksTitle', 'sectorsTitle', 'scheduleTitle', 'coreViewTitle', 'expertAnalysisSubtitle'
          ]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return null;
  }
};

/**
 * 네이버 금융 해외지수 페이지에서 가격/등락률 파싱
 */
const fetchNaverWorldIndex = async (symbol: string, label: string): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  try {
    const res = await fetch(naverUrl(`/world/sise.naver?symbol=${symbol}`));
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 현재가 - span 태그 조합으로 추출 후 소수점 제거
    const priceEmMatch = html.match(/no_today[\s\S]*?<em[^>]*>([\s\S]*?)<\/em>/);
    let value = 'N/A';
    if (priceEmMatch) {
      const raw = parseNaverSpanNumber(priceEmMatch[1]);
      // 나스닥/다우존스는 소수점 제거
      const dotIdx = raw.indexOf('.');
      value = dotIdx !== -1 ? raw.substring(0, dotIdx) : raw;
    }

    // 등락 정보: 두 번째 em 태그에서 등락률
    const exdayMatch = html.match(/no_exday[\s\S]*?<em[^>]*>[\s\S]*?<\/em>\s*<em[^>]*>([\s\S]*?)<\/em>/);
    let changePct = '0';
    if (exdayMatch) {
      const rawPct = parseNaverSpanNumber(exdayMatch[1]);
      changePct = rawPct.replace(/[^0-9.]/g, '');
    }

    // 상승/하락
    const isDown = /no_today[\s\S]*?class="no_down"/.test(html);
    const sign = isDown ? '-' : '+';
    const trend = isDown ? 'down' : 'up';

    console.log(`Naver [${label}]: ${value} ${sign}${changePct}%`);
    return { label, value, subText: `${sign}${changePct}%`, trend };
  } catch (e) {
    console.error(`Naver fetch failed [${label}]:`, e);
    return { label, value: 'N/A', subText: 'N/A', trend: 'neutral' };
  }
};

/**
 * 네이버 금융 환율 페이지에서 USD/KRW 파싱
 */
const fetchNaverExchangeRate = async (): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  try {
    const res = await fetch(naverUrl('/marketindex/exchangeDetail.naver?marketindexCd=FX_USDKRW'));
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 현재가
    const priceEl = doc.querySelector('.no_today');
    let value = priceEl?.textContent?.trim() || 'N/A';
    // "1,462.20원" -> "1,462.20"
    value = value.replace(/[^\d,.]/g, '').trim();

    // 등락 정보
    const changeEl = doc.querySelector('.no_exday');
    const changeText = changeEl?.textContent?.trim() || '';
    const nums = changeText.match(/[\d,.]+/g) || [];
    const changePct = nums[1] || '0';

    const isDown = !!doc.querySelector('.no_exday .no_down') || 
                   !!doc.querySelector('.head_info .down') ||
                   changeText.includes('하락');
    const sign = isDown ? '-' : '+';
    const trend: 'up' | 'down' | 'neutral' = isDown ? 'down' : 'up';

    console.log(`Naver [USD/KRW]: ${value} ${sign}${changePct}%`);
    return { label: 'USD/KRW', value, subText: `${sign}${changePct}%`, trend };
  } catch (e) {
    console.error('Naver exchange rate fetch failed:', e);
    return { label: 'USD/KRW', value: 'N/A', subText: 'N/A', trend: 'neutral' };
  }
};

/**
 * Investing.com에서 야간선물(KOSPI 200 Futures) 가격 스크래핑
 * HTML을 프록시 경유로 가져온 뒤 정규식으로 가격/등락률 추출
 */
const fetchNightFuturesInvesting = async (): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
} | null> => {
  try {
    const targetUrl = 'https://kr.investing.com/indices/korea-200-futures';
    const proxyUrl = IS_VERCEL
      ? `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;

    const res = await fetch(proxyUrl, { method: 'GET' });
    if (!res.ok) throw new Error(`Investing.com HTTP ${res.status}`);

    const html = await res.text();
    console.log('Investing.com [야간선물] HTML length:', html.length);

    // Investing.com SSR HTML에서 가격 파싱
    // 패턴1: data-test="instrument-price-last" 속성
    let value = 'N/A';
    let subText = 'N/A';
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    // 가격 추출: "last-price" 또는 instrument 관련 속성에서
    const priceMatch = html.match(/data-test="instrument-price-last"[^>]*>([0-9.,]+)</) ||
                        html.match(/"last":\s*"?([0-9.,]+)"?/) ||
                        html.match(/class="[^"]*last-price[^"]*"[^>]*>([0-9.,]+)</) ||
                        html.match(/pid-\d+-last[^>]*>([0-9.,]+)</);
    if (priceMatch) {
      value = priceMatch[1].replace(/,/g, '');
    }

    // 등락률 추출 - HTML 코멘트(<!-- -->)가 포함된 형태 처리
    const pctEl = html.match(/data-test="instrument-price-change-percent"[^>]*>([\s\S]*?)<\/span>/);
    if (pctEl) {
      // HTML 코멘트 및 태그 제거 후 순수 텍스트 추출
      const pctText = pctEl[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').replace(/[()]/g, '').trim();
      const pctNum = parseFloat(pctText.replace('%', ''));
      if (!isNaN(pctNum)) {
        subText = `${pctNum >= 0 ? '+' : ''}${pctNum}%`;
        trend = pctNum > 0 ? 'up' : pctNum < 0 ? 'down' : 'neutral';
      }
    }

    // 가격은 있는데 등락률이 없으면 변동 금액에서 추론
    if (value !== 'N/A' && subText === 'N/A') {
      const changeMatch = html.match(/data-test="instrument-price-change"[^>]*>([+-]?[0-9.,]+)</) ||
                           html.match(/"change":\s*"?([+-]?[0-9.,]+)"?/);
      if (changeMatch) {
        const changeStr = changeMatch[1].replace(/,/g, '');
        const changeNum = parseFloat(changeStr);
        if (!isNaN(changeNum)) {
          trend = changeNum > 0 ? 'up' : changeNum < 0 ? 'down' : 'neutral';
          subText = `${changeNum >= 0 ? '+' : ''}${changeNum}`;
        }
      }
    }

    if (value === 'N/A') {
      console.log('Investing.com [야간선물] parsing failed, no price found');
      return null;
    }

    console.log(`Investing.com [야간선물] parsed: ${value} | ${subText} | ${trend}`);
    return { label: '야간선물', value, subText, trend };
  } catch (e) {
    console.error('Investing.com night futures fetch failed:', e);
    return null;
  }
};

/**
 * 야간선물 데이터 조회 (Investing.com only)
 * Investing.com 실패 시 N/A 반환
 */
const fetchNightFutures = async (): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  const investingResult = await fetchNightFuturesInvesting();
  if (investingResult) return investingResult;
  return { label: '야간선물', value: 'N/A', subText: 'N/A', trend: 'neutral' };
};

/**
 * Investing.com에서 VIX 지수 스크래핑
 * 야간선물과 동일한 HTML 파싱 패턴 사용
 */
const fetchVIX = async (): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  try {
    const targetUrl = 'https://kr.investing.com/indices/volatility-s-p-500';
    const proxyUrl = IS_VERCEL
      ? `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;

    const res = await fetch(proxyUrl, { method: 'GET' });
    if (!res.ok) throw new Error(`Investing.com VIX HTTP ${res.status}`);

    const html = await res.text();
    console.log('Investing.com [VIX] HTML length:', html.length);

    let value = 'N/A';
    let subText = 'N/A';
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    // 가격 추출
    const priceMatch = html.match(/data-test="instrument-price-last"[^>]*>([0-9.,]+)</) ||
                        html.match(/"last":\s*"?([0-9.,]+)"?/) ||
                        html.match(/class="[^"]*last-price[^"]*"[^>]*>([0-9.,]+)</) ||
                        html.match(/pid-\d+-last[^>]*>([0-9.,]+)</);
    if (priceMatch) {
      value = priceMatch[1];
    }

    // 등락률 추출
    const pctEl = html.match(/data-test="instrument-price-change-percent"[^>]*>([\s\S]*?)<\/span>/);
    if (pctEl) {
      const pctText = pctEl[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').replace(/[()]/g, '').trim();
      const pctNum = parseFloat(pctText.replace('%', ''));
      if (!isNaN(pctNum)) {
        subText = `${pctNum >= 0 ? '+' : ''}${pctNum}%`;
        // VIX는 반대: VIX 상승 = 시장 불안 = down(파란색), VIX 하락 = 안정 = up(빨간색) → 일반 표시로 유지
        trend = pctNum > 0 ? 'up' : pctNum < 0 ? 'down' : 'neutral';
      }
    }

    if (value === 'N/A') {
      console.log('Investing.com [VIX] parsing failed');
      return { label: 'VIX', value: 'N/A', subText: 'N/A', trend: 'neutral' };
    }

    console.log(`Investing.com [VIX] parsed: ${value} | ${subText} | ${trend}`);
    return { label: 'VIX', value, subText, trend };
  } catch (e) {
    console.error('VIX fetch failed:', e);
    return { label: 'VIX', value: 'N/A', subText: 'N/A', trend: 'neutral' };
  }
};

/**
 * 네이버 금융 원자재 HTML에서 span 태그 기반 숫자 조합
 * <span class="no5">5</span><span class="shim">,</span> → "5,"
 * class: noX→숫자, shim→쉼표, jum→소수점, per→%, ico minus→-
 */
const parseNaverSpanNumber = (html: string): string => {
  const spans = [...html.matchAll(/<span\s+class="([^"]+)"[^>]*>([^<]*)<\/span>/g)];
  let result = '';
  for (const s of spans) {
    const cls = s[1];
    const txt = s[2];
    if (cls.startsWith('no')) {
      // noX → digit X
      const digit = cls.replace('no', '');
      if (/^\d$/.test(digit)) result += digit;
    } else if (cls === 'shim') {
      result += ',';
    } else if (cls === 'jum') {
      result += '.';
    } else if (cls === 'per') {
      result += '%';
    } else if (cls.includes('minus')) {
      result += '-';
    } else if (cls === 'blind' || cls.includes('ico') || cls.includes('parenthesis')) {
      // skip blind labels, icons, parentheses
    } else {
      result += txt;
    }
  }
  return result;
};

/**
 * 네이버 금융 원자재 상세 페이지에서 가격/등락률 파싱
 * 원유(OIL_CL), 국제금(CMDT_GC) 등에 사용
 * 각 숫자가 개별 span 태그에 들어있는 구조를 span class명으로 조합
 */
const fetchNaverCommodity = async (code: string, label: string): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  try {
    const url = code.startsWith('OIL_')
      ? naverUrl(`/marketindex/worldOilDetail.naver?marketindexCd=${code}&fdtc=2`)
      : naverUrl(`/marketindex/worldGoldDetail.naver?marketindexCd=${code}&fdtc=2`);
    const res = await fetch(url);
    const html = await res.text();

    let value = 'N/A';
    let changePct = '0';

    // no_today 영역에서 첫 번째 em 태그 내 span들을 조합하여 가격 추출
    const priceEmMatch = html.match(/no_today[\s\S]*?<em[^>]*>([\s\S]*?)<\/em>/);
    if (priceEmMatch) {
      const raw = parseNaverSpanNumber(priceEmMatch[1]);
      // 소수점 2자리까지만 유지
      const dotIdx = raw.indexOf('.');
      value = dotIdx !== -1 ? raw.substring(0, dotIdx + 3) : raw;
    }

    // no_exday 영역에서 두 번째 em 태그 = 등락률 (예: -0.95%)
    const exdayMatch = html.match(/no_exday[\s\S]*?<em[^>]*>[\s\S]*?<\/em>\s*<em[^>]*>([\s\S]*?)<\/em>/);
    if (exdayMatch) {
      const rawPct = parseNaverSpanNumber(exdayMatch[1]);
      // 숫자와 소수점만 추출
      changePct = rawPct.replace(/[^0-9.]/g, '');
    }

    // 상승/하락 판별: em class에 no_down이 있으면 하락
    const isDown = /no_today[\s\S]*?class="no_down"/.test(html);
    const sign = isDown ? '-' : '+';
    const trend: 'up' | 'down' | 'neutral' = isDown ? 'down' : 'up';

    console.log(`Naver [${label}]: ${value} ${sign}${changePct}%`);
    return { label, value, subText: `${sign}${changePct}%`, trend };
  } catch (e) {
    console.error(`Naver commodity [${label}] failed:`, e);
    return { label, value: 'N/A', subText: 'N/A', trend: 'neutral' };
  }
};

/**
 * 네이버 크립토에서 비트코인(BTC) 가격 파싱
 * SSR JSON의 __NEXT_DATA__ 또는 인라인 JSON에서 정규식 추출
 */
const fetchNaverBitcoin = async (): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  try {
    const targetUrl = 'https://m.stock.naver.com/crypto/UPBIT/BTC';
    const proxyUrl = IS_VERCEL
      ? `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;
    const res = await fetch(proxyUrl);
    const html = await res.text();

    let value = 'N/A';
    let subText = 'N/A';
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    // SSR JSON에서 closePrice 또는 tradePrice 추출 (BTC 전용 패턴)
    // "closePrice":"102136000" 또는 "tradePrice":102136000 형태
    const priceMatch = html.match(/"closePrice"\s*:\s*"?(\d{6,})"?/) ||
                        html.match(/"tradePrice"\s*:\s*"?(\d{6,})"?/) ||
                        html.match(/"now"\s*:\s*"?(\d{6,})"?/);
    if (priceMatch) {
      const num = parseInt(priceMatch[1], 10);
      if (!isNaN(num)) {
        if (num >= 100000000) {
          const eok = Math.floor(num / 100000000);
          const man = Math.floor((num % 100000000) / 10000);
          value = `${eok}억${man > 0 ? man.toLocaleString() + '만' : ''}`;
        } else {
          value = num.toLocaleString();
        }
      }
    }

    // 등락률: "fluctuationsRatio" 필드 우선 (BTC 페이지에서 사용)
    // 0.0012 형태(소수) → *100 변환, 또는 이미 퍼센트일 수 있음
    const changeMatch = html.match(/"fluctuationsRatio"\s*:\s*"?(-?[\d.]+)"?/) ||
                         html.match(/"changeRate"\s*:\s*"?(-?0\.\d+)"?/);
    if (changeMatch) {
      const raw = parseFloat(changeMatch[1]);
      if (!isNaN(raw)) {
        // 0.xx 형태이면 *100, 이미 퍼센트면 그대로
        const pctValue = Math.abs(raw) < 1 ? raw * 100 : raw;
        subText = `${pctValue >= 0 ? '+' : ''}${pctValue.toFixed(1)}%`;
        trend = pctValue > 0 ? 'up' : pctValue < 0 ? 'down' : 'neutral';
      }
    }

    console.log(`Naver [BTC]: ${value} | ${subText}`);
    return { label: 'BTC', value, subText, trend };
  } catch (e) {
    console.error('Naver BTC fetch failed:', e);
    return { label: 'BTC', value: 'N/A', subText: 'N/A', trend: 'neutral' };
  }
};


/**
 * Perplexity API로 단일 지표 조회 (마감 시황용)
 */
const fetchOnePerplexity = async (apiKey: string, label: string, query: string): Promise<{
  label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral';
}> => {
  try {
    const res = await fetch(perplexityUrl('/chat/completions'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar',
        max_tokens: 50,
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'You are a financial data lookup tool. Reply ONLY with PRICE|CHANGE% format. Nothing else.' },
          { role: 'user', content: query }
        ]
      })
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    console.log(`Perplexity [${label}]:`, content);

    const parts = content.split('|');
    if (parts.length >= 2) {
      let value = parts[0].trim();
      let subText = parts[1].trim();
      // 콤마 추가
      const vNum = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(vNum) && !value.includes(',') && vNum >= 1000) {
        const [intP, decP] = value.split('.');
        const wc = parseInt(intP).toLocaleString('en-US');
        value = decP ? `${wc}.${decP}` : wc;
      }
      const changeNum = parseFloat(subText.replace(/[^0-9.\-+]/g, ''));
      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (subText.includes('-') || changeNum < 0) {
        trend = 'down';
        if (!subText.startsWith('-')) subText = `-${subText.replace(/[+-]/g, '')}`;
      } else if (changeNum > 0) {
        trend = 'up';
        if (!subText.startsWith('+')) subText = `+${subText.replace(/[+-]/g, '')}`;
      }
      if (!subText.includes('%') && !subText.includes('순매')) subText += '%';
      return { label, value, subText, trend };
    }
    return { label, value: content || 'N/A', subText: 'N/A', trend: 'neutral' };
  } catch (e) {
    console.error(`Perplexity [${label}] failed:`, e);
    return { label, value: 'N/A', subText: 'N/A', trend: 'neutral' };
  }
};

/**
 * 네이버 금융: 코스피/코스닥 sise_index 페이지에서 지수 + 투자자별 매매동향 통합 추출
 * EUC-KR 인코딩 처리 포함
 * HTML 구조:
 *   <div class="quotient up|dn" id="quotient">
 *     <em id="now_value">5,301.69</em>
 *     <span class="fluc" id="change_value_and_rate"><span>3.65</span> +0.07%<span class="blind">상승</span></span>
 *   </div>
 * 투자자별 매매동향: 개인 -8,780억 외국인 +1,474억 기관 +5,643억
 */
const fetchNaverDomesticAll = async (code: 'KOSPI' | 'KOSDAQ'): Promise<{
  index: { label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral'; changeAmount: string };
  foreign: { label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral' };
  institution: { label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral' };
}> => {
  const fallbackIndex = { label: code, value: 'N/A', subText: 'N/A', trend: 'neutral' as const, changeAmount: '0' };
  const fallbackForeign = { label: `${code} 외인`, value: 'N/A', subText: '-', trend: 'neutral' as const };
  const fallbackInst = { label: `${code} 기관`, value: 'N/A', subText: '-', trend: 'neutral' as const };

  try {
    const res = await fetch(naverUrl(`/sise/sise_index.naver?code=${code}`));
    // EUC-KR 디코딩
    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(buf);

    // === 지수 데이터 ===
    // 현재가
    const nowMatch = html.match(/id="now_value">([^<]+)/);
    const value = nowMatch ? nowMatch[1].trim() : 'N/A';

    // 등락폭: <span>3.65</span>
    const changeAmtMatch = html.match(/change_value_and_rate[\s\S]*?<span>([^<]+)<\/span>/);
    const changeAmount = changeAmtMatch ? changeAmtMatch[1].trim() : '0';

    // 등락률: </span> 뒤의 텍스트 (+0.07%)
    const changeRateMatch = html.match(/change_value_and_rate[\s\S]*?<\/span>\s*([^<]+)/);
    const changePct = changeRateMatch ? changeRateMatch[1].trim() : '0%';

    // 상승/하락 판단: quotient class
    const quotientMatch = html.match(/class="quotient\s+(\w+)"/);
    const direction = quotientMatch ? quotientMatch[1] : '';
    const isDown = direction === 'dn';
    const trend: 'up' | 'down' | 'neutral' = isDown ? 'down' : direction === 'up' ? 'up' : 'neutral';

    console.log(`Naver [${code}]: ${value} ${isDown ? '▼' : '▲'}${changeAmount} ${changePct}`);

    // === 투자자별 매매동향 ===
    // 페이지 전체 텍스트에서 개인/외국인/기관 순매수 추출
    const fullText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    const parseTrendValue = (val: string): { value: string; trend: 'up' | 'down' | 'neutral'; subText: string } => {
      const cleaned = val.replace(/,/g, '').replace(/억/g, '').trim();
      const num = parseInt(cleaned, 10);
      if (isNaN(num)) return { value: 'N/A', trend: 'neutral', subText: '-' };
      const isPositive = num > 0;
      const isNegative = num < 0;
      const absStr = Math.abs(num).toLocaleString('ko-KR');
      return {
        value: `${isNegative ? '-' : '+'}${absStr}억`,
        trend: isPositive ? 'up' : isNegative ? 'down' : 'neutral',
        subText: '',
      };
    };

    // 투자자별 매매동향 개인 +3,239억 외국인 -1,955억 기관 -808억
    type InvestorItem = { label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral' };
    let foreignData: InvestorItem = fallbackForeign;
    let instData: InvestorItem = fallbackInst;

    // 패턴: 개인 숫자억 외국인 숫자억 기관 숫자억
    const investorMatch = fullText.match(/개인\s*([\-+]?[\d,]+)\s*억?\s*외국인\s*([\-+]?[\d,]+)\s*억?\s*기관\s*([\-+]?[\d,]+)/);
    if (investorMatch) {
      const fData = parseTrendValue(investorMatch[2]);
      const iData = parseTrendValue(investorMatch[3]);
      foreignData = { label: `${code} 외인`, ...fData };
      instData = { label: `${code} 기관`, ...iData };
      console.log(`Naver [${code} 투자자] 외인: ${fData.value} (${fData.subText}) | 기관: ${iData.value} (${iData.subText})`);
    } else {
      console.warn(`Naver [${code}] 투자자별 매매동향 파싱 실패`);
    }

    return {
      index: { label: code, value, subText: changePct, trend, changeAmount },
      foreign: foreignData,
      institution: instData,
    };
  } catch (e) {
    console.error(`Naver domestic [${code}] failed:`, e);
    return { index: fallbackIndex, foreign: fallbackForeign, institution: fallbackInst };
  }
};

/**
 * Fetches real-time market indicators.
 * 장전: 네이버 금융(NASDAQ, 다우존스) + Investing.com(VIX, 야간선물) + 환율 + 보조(원유, 금, BTC)
 * 마감: 네이버 금융 직접 크롤링(KOSPI, KOSDAQ, 투자자별 매매동향, USD/KRW)
 */
export const fetchMarketIndicators = async (reportType: '장전' | '마감'): Promise<{
  items: Array<{ label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral' }>;
  subItems?: Array<{ label: string; value: string; subText: string; trend: 'up' | 'down' | 'neutral' }>;
} | null> => {
  try {
    const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;

    if (reportType === '장전') {
      // 메인 5개: NASDAQ, 다우존스, VIX, 야간선물, 환율
      // 보조 3개: WTI원유, 국제금, BTC
      const [mainResults, subResults] = await Promise.all([
        Promise.allSettled([
          fetchNaverWorldIndex('NAS@IXIC', 'NASDAQ'),
          fetchNaverWorldIndex('DJI@DJI', '다우존스'),
          fetchVIX(),
          fetchNightFutures(),
          fetchNaverExchangeRate(),
        ]),
        Promise.allSettled([
          fetchNaverCommodity('OIL_CL', 'WTI'),
          fetchNaverCommodity('CMDT_GC', '금'),
          fetchNaverBitcoin(),
        ]),
      ]);
      const fallback = { label: 'Error', value: 'N/A', subText: 'N/A', trend: 'neutral' as const };
      const items = mainResults.map(r => r.status === 'fulfilled' ? r.value : fallback);
      const subItems = subResults.map(r => r.status === 'fulfilled' ? r.value : fallback);
      return { items, subItems };
    } else {
      // 마감: 네이버 금융 직접 크롤링 (통합 함수로 지수+투자자 한번에 추출)
      const [kospiResult, kosdaqResult, fxResult] = await Promise.allSettled([
        fetchNaverDomesticAll('KOSPI'),
        fetchNaverDomesticAll('KOSDAQ'),
        fetchNaverExchangeRate(),
      ]);

      const defaultAll = (code: string) => ({
        index: { label: code, value: 'N/A', subText: 'N/A', trend: 'neutral' as const, changeAmount: '0' },
        foreign: { label: `${code} 외인`, value: 'N/A', subText: '-', trend: 'neutral' as const },
        institution: { label: `${code} 기관`, value: 'N/A', subText: '-', trend: 'neutral' as const },
      });

      const kospi = kospiResult.status === 'fulfilled' ? kospiResult.value : defaultAll('KOSPI');
      const kosdaq = kosdaqResult.status === 'fulfilled' ? kosdaqResult.value : defaultAll('KOSDAQ');
      const fx = fxResult.status === 'fulfilled' ? fxResult.value : { label: 'USD/KRW', value: 'N/A', subText: 'N/A', trend: 'neutral' as const };

      const items = [
        { label: kospi.index.label, value: kospi.index.value, subText: `${kospi.index.changeAmount}  ${kospi.index.subText}`, trend: kospi.index.trend },
        { label: kosdaq.index.label, value: kosdaq.index.value, subText: `${kosdaq.index.changeAmount}  ${kosdaq.index.subText}`, trend: kosdaq.index.trend },
        kospi.foreign,
        kospi.institution,
        kosdaq.foreign,
        kosdaq.institution,
        fx,
      ];
      return { items };
    }
  } catch (error) {
    console.error("Market data fetch failed:", error);
    return null;
  }
};

