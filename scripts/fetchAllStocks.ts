/**
 * 네이버 증권 API에서 미국 전종목(NASDAQ/NYSE/AMEX) 데이터를 수집하여
 * lib/allStocks.json 파일로 저장하는 스크립트
 * 
 * 실행: npx tsx scripts/fetchAllStocks.ts
 */

const EXCHANGES = ['NASDAQ', 'NYSE', 'AMEX'] as const;
const PAGE_SIZE = 100;
const API_BASE = 'https://api.stock.naver.com/stock/exchange';

interface NaverStockItem {
  symbolCode: string;
  reutersCode: string;
  stockName: string;
  stockNameEng: string;
  stockExchangeType: {
    code: string;
    name: string;
    nameKor: string;
  };
}

interface NaverApiResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  stocks: NaverStockItem[];
}

interface StockEntry {
  ticker: string;
  reuters: string;
  nameKr: string;
  nameEng: string;
  exchange: string;
}

async function fetchExchangeStocks(exchange: string): Promise<StockEntry[]> {
  const stocks: StockEntry[] = [];
  let page = 1;
  let totalCount = 0;

  console.log(`\n📊 ${exchange} 종목 수집 시작...`);

  do {
    const url = `${API_BASE}/${exchange}/marketValue?page=${page}&pageSize=${PAGE_SIZE}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://m.stock.naver.com/'
        }
      });

      if (!response.ok) {
        console.error(`  ❌ HTTP ${response.status} at page ${page}`);
        break;
      }

      const data: NaverApiResponse = await response.json();
      totalCount = data.totalCount;

      for (const item of data.stocks) {
        stocks.push({
          ticker: item.symbolCode,
          reuters: item.reutersCode,
          nameKr: item.stockName,
          nameEng: item.stockNameEng,
          exchange: exchange,
        });
      }

      const progress = Math.min(page * PAGE_SIZE, totalCount);
      process.stdout.write(`  📥 ${progress}/${totalCount} (page ${page})\r`);

      page++;

      // API 부담 줄이기: 100ms 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ❌ Error at page ${page}:`, error);
      break;
    }
  } while ((page - 1) * PAGE_SIZE < totalCount);

  console.log(`  ✅ ${exchange}: ${stocks.length}개 수집 완료`);
  return stocks;
}

async function main() {
  console.log('🚀 미국 전종목 수집 시작');
  console.log('=' .repeat(50));

  const allStocks: StockEntry[] = [];

  for (const exchange of EXCHANGES) {
    const stocks = await fetchExchangeStocks(exchange);
    allStocks.push(...stocks);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 총 ${allStocks.length}개 종목 수집 완료`);

  // JSON 파일로 저장
  const outputPath = new URL('../lib/allStocks.json', import.meta.url);
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const outputFile = fileURLToPath(outputPath);
  
  const output = {
    updatedAt: new Date().toISOString().split('T')[0],
    totalCount: allStocks.length,
    exchanges: {
      NASDAQ: allStocks.filter(s => s.exchange === 'NASDAQ').length,
      NYSE: allStocks.filter(s => s.exchange === 'NYSE').length,
      AMEX: allStocks.filter(s => s.exchange === 'AMEX').length,
    },
    stocks: allStocks,
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n💾 저장 완료: ${outputFile}`);
  console.log(`   NASDAQ: ${output.exchanges.NASDAQ}개`);
  console.log(`   NYSE:   ${output.exchanges.NYSE}개`);
  console.log(`   AMEX:   ${output.exchanges.AMEX}개`);
}

main().catch(console.error);
