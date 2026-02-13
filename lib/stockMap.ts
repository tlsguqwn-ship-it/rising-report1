// 미국 인기 종목 매핑 사전
// key: 한글명/영문명/티커(대문자) → value: { reuters: 로이터코드, nameKr: 한글명, ticker: 티커 }

export interface StockInfo {
  reuters: string;   // e.g. "NVDA.O"
  nameKr: string;    // e.g. "엔비디아"
  nameEng: string;   // e.g. "NVIDIA"
  ticker: string;    // e.g. "NVDA"
  exchange: string;  // "O" (NASDAQ), "N" (NYSE), "AS" (AMEX)
}

const STOCK_LIST: StockInfo[] = [
  // === AI & 반도체 ===
  { reuters: "NVDA.O", nameKr: "엔비디아", nameEng: "NVIDIA", ticker: "NVDA", exchange: "O" },
  { reuters: "AMD.O", nameKr: "AMD", nameEng: "AMD", ticker: "AMD", exchange: "O" },
  { reuters: "INTC.O", nameKr: "인텔", nameEng: "Intel", ticker: "INTC", exchange: "O" },
  { reuters: "MU.O", nameKr: "마이크론", nameEng: "Micron", ticker: "MU", exchange: "O" },
  { reuters: "AVGO.O", nameKr: "브로드컴", nameEng: "Broadcom", ticker: "AVGO", exchange: "O" },
  { reuters: "QCOM.O", nameKr: "퀄컴", nameEng: "Qualcomm", ticker: "QCOM", exchange: "O" },
  { reuters: "TSM.N", nameKr: "TSMC", nameEng: "TSMC", ticker: "TSM", exchange: "N" },
  { reuters: "ARM.O", nameKr: "ARM", nameEng: "ARM Holdings", ticker: "ARM", exchange: "O" },
  { reuters: "MRVL.O", nameKr: "마벨", nameEng: "Marvell", ticker: "MRVL", exchange: "O" },
  { reuters: "ASML.O", nameKr: "ASML", nameEng: "ASML", ticker: "ASML", exchange: "O" },
  { reuters: "LRCX.O", nameKr: "램리서치", nameEng: "Lam Research", ticker: "LRCX", exchange: "O" },
  { reuters: "KLAC.O", nameKr: "KLA", nameEng: "KLA Corp", ticker: "KLAC", exchange: "O" },
  { reuters: "AMAT.O", nameKr: "어플라이드 머티리얼즈", nameEng: "Applied Materials", ticker: "AMAT", exchange: "O" },
  { reuters: "SNPS.O", nameKr: "시놉시스", nameEng: "Synopsys", ticker: "SNPS", exchange: "O" },
  { reuters: "CDNS.O", nameKr: "케이던스", nameEng: "Cadence", ticker: "CDNS", exchange: "O" },
  { reuters: "ON.O", nameKr: "온세미", nameEng: "ON Semiconductor", ticker: "ON", exchange: "O" },
  { reuters: "SMCI.O", nameKr: "슈퍼마이크로", nameEng: "Super Micro Computer", ticker: "SMCI", exchange: "O" },

  // === 빅테크 (FAANG+) ===
  { reuters: "AAPL.O", nameKr: "애플", nameEng: "Apple", ticker: "AAPL", exchange: "O" },
  { reuters: "MSFT.O", nameKr: "마이크로소프트", nameEng: "Microsoft", ticker: "MSFT", exchange: "O" },
  { reuters: "GOOGL.O", nameKr: "구글", nameEng: "Alphabet", ticker: "GOOGL", exchange: "O" },
  { reuters: "GOOG.O", nameKr: "구글C", nameEng: "Alphabet Class C", ticker: "GOOG", exchange: "O" },
  { reuters: "AMZN.O", nameKr: "아마존", nameEng: "Amazon", ticker: "AMZN", exchange: "O" },
  { reuters: "META.O", nameKr: "메타", nameEng: "Meta Platforms", ticker: "META", exchange: "O" },
  { reuters: "NFLX.O", nameKr: "넷플릭스", nameEng: "Netflix", ticker: "NFLX", exchange: "O" },
  { reuters: "TSLA.O", nameKr: "테슬라", nameEng: "Tesla", ticker: "TSLA", exchange: "O" },

  // === AI 소프트웨어 ===
  { reuters: "CRM.N", nameKr: "세일즈포스", nameEng: "Salesforce", ticker: "CRM", exchange: "N" },
  { reuters: "PLTR.O", nameKr: "팔란티어", nameEng: "Palantir", ticker: "PLTR", exchange: "O" },
  { reuters: "SNOW.N", nameKr: "스노우플레이크", nameEng: "Snowflake", ticker: "SNOW", exchange: "N" },
  { reuters: "AI.N", nameKr: "C3.ai", nameEng: "C3.ai", ticker: "AI", exchange: "N" },
  { reuters: "PATH.N", nameKr: "유아이패스", nameEng: "UiPath", ticker: "PATH", exchange: "N" },
  { reuters: "DDOG.O", nameKr: "데이터독", nameEng: "Datadog", ticker: "DDOG", exchange: "O" },
  { reuters: "MDB.O", nameKr: "몽고DB", nameEng: "MongoDB", ticker: "MDB", exchange: "O" },
  { reuters: "NET.N", nameKr: "클라우드플레어", nameEng: "Cloudflare", ticker: "NET", exchange: "N" },
  { reuters: "CRWD.O", nameKr: "크라우드스트라이크", nameEng: "CrowdStrike", ticker: "CRWD", exchange: "O" },

  // === 우주/방산 ===
  { reuters: "LMT.N", nameKr: "록히드마틴", nameEng: "Lockheed Martin", ticker: "LMT", exchange: "N" },
  { reuters: "RTX.N", nameKr: "RTX", nameEng: "RTX Corp", ticker: "RTX", exchange: "N" },
  { reuters: "NOC.N", nameKr: "노스롭그루먼", nameEng: "Northrop Grumman", ticker: "NOC", exchange: "N" },
  { reuters: "GD.N", nameKr: "제너럴다이나믹스", nameEng: "General Dynamics", ticker: "GD", exchange: "N" },
  { reuters: "BA.N", nameKr: "보잉", nameEng: "Boeing", ticker: "BA", exchange: "N" },
  { reuters: "LHX.N", nameKr: "L3해리스", nameEng: "L3Harris", ticker: "LHX", exchange: "N" },
  { reuters: "RKLB.O", nameKr: "로켓랩", nameEng: "Rocket Lab", ticker: "RKLB", exchange: "O" },
  { reuters: "LUNR.O", nameKr: "인튜이티브머신즈", nameEng: "Intuitive Machines", ticker: "LUNR", exchange: "O" },
  { reuters: "RDW.N", nameKr: "레드와이어", nameEng: "Redwire", ticker: "RDW", exchange: "N" },
  { reuters: "LDOS.N", nameKr: "레이도스", nameEng: "Leidos", ticker: "LDOS", exchange: "N" },
  { reuters: "KTOS.O", nameKr: "크라토스", nameEng: "Kratos Defense", ticker: "KTOS", exchange: "O" },

  // === 전기차/자율주행 ===
  { reuters: "RIVN.O", nameKr: "리비안", nameEng: "Rivian", ticker: "RIVN", exchange: "O" },
  { reuters: "LCID.O", nameKr: "루시드", nameEng: "Lucid", ticker: "LCID", exchange: "O" },
  { reuters: "NIO.N", nameKr: "니오", nameEng: "NIO", ticker: "NIO", exchange: "N" },
  { reuters: "XPEV.N", nameKr: "샤오펑", nameEng: "XPeng", ticker: "XPEV", exchange: "N" },
  { reuters: "LI.O", nameKr: "리오토", nameEng: "Li Auto", ticker: "LI", exchange: "O" },
  { reuters: "GM.N", nameKr: "GM", nameEng: "General Motors", ticker: "GM", exchange: "N" },
  { reuters: "F.N", nameKr: "포드", nameEng: "Ford", ticker: "F", exchange: "N" },

  // === 바이오/제약 ===
  { reuters: "LLY.N", nameKr: "일라이릴리", nameEng: "Eli Lilly", ticker: "LLY", exchange: "N" },
  { reuters: "NVO.N", nameKr: "노보노디스크", nameEng: "Novo Nordisk", ticker: "NVO", exchange: "N" },
  { reuters: "UNH.N", nameKr: "유나이티드헬스", nameEng: "UnitedHealth", ticker: "UNH", exchange: "N" },
  { reuters: "JNJ.N", nameKr: "존슨앤존슨", nameEng: "Johnson & Johnson", ticker: "JNJ", exchange: "N" },
  { reuters: "ABBV.N", nameKr: "애브비", nameEng: "AbbVie", ticker: "ABBV", exchange: "N" },
  { reuters: "PFE.N", nameKr: "화이자", nameEng: "Pfizer", ticker: "PFE", exchange: "N" },
  { reuters: "MRK.N", nameKr: "머크", nameEng: "Merck", ticker: "MRK", exchange: "N" },
  { reuters: "MRNA.O", nameKr: "모더나", nameEng: "Moderna", ticker: "MRNA", exchange: "O" },
  { reuters: "AMGN.O", nameKr: "암젠", nameEng: "Amgen", ticker: "AMGN", exchange: "O" },
  { reuters: "GILD.O", nameKr: "길리어드", nameEng: "Gilead", ticker: "GILD", exchange: "O" },
  { reuters: "BIIB.O", nameKr: "바이오젠", nameEng: "Biogen", ticker: "BIIB", exchange: "O" },
  { reuters: "REGN.O", nameKr: "리제네론", nameEng: "Regeneron", ticker: "REGN", exchange: "O" },
  { reuters: "VRTX.O", nameKr: "버텍스", nameEng: "Vertex", ticker: "VRTX", exchange: "O" },
  { reuters: "BMY.N", nameKr: "브리스톨마이어스", nameEng: "Bristol-Myers Squibb", ticker: "BMY", exchange: "N" },
  { reuters: "TMO.N", nameKr: "써모피셔", nameEng: "Thermo Fisher", ticker: "TMO", exchange: "N" },
  { reuters: "ISRG.O", nameKr: "인튜이티브서지컬", nameEng: "Intuitive Surgical", ticker: "ISRG", exchange: "O" },

  // === 에너지 ===
  { reuters: "XOM.N", nameKr: "엑슨모빌", nameEng: "Exxon Mobil", ticker: "XOM", exchange: "N" },
  { reuters: "CVX.N", nameKr: "셰브론", nameEng: "Chevron", ticker: "CVX", exchange: "N" },
  { reuters: "COP.N", nameKr: "코노코필립스", nameEng: "ConocoPhillips", ticker: "COP", exchange: "N" },
  { reuters: "OXY.N", nameKr: "옥시덴탈", nameEng: "Occidental", ticker: "OXY", exchange: "N" },
  { reuters: "SLB.N", nameKr: "슐럼버거", nameEng: "Schlumberger", ticker: "SLB", exchange: "N" },

  // === 금융 ===
  { reuters: "JPM.N", nameKr: "JP모건", nameEng: "JPMorgan Chase", ticker: "JPM", exchange: "N" },
  { reuters: "BAC.N", nameKr: "뱅크오브아메리카", nameEng: "Bank of America", ticker: "BAC", exchange: "N" },
  { reuters: "GS.N", nameKr: "골드만삭스", nameEng: "Goldman Sachs", ticker: "GS", exchange: "N" },
  { reuters: "MS.N", nameKr: "모건스탠리", nameEng: "Morgan Stanley", ticker: "MS", exchange: "N" },
  { reuters: "V.N", nameKr: "비자", nameEng: "Visa", ticker: "V", exchange: "N" },
  { reuters: "MA.N", nameKr: "마스터카드", nameEng: "Mastercard", ticker: "MA", exchange: "N" },
  { reuters: "BRKb.N", nameKr: "버크셔해서웨이", nameEng: "Berkshire Hathaway", ticker: "BRK.B", exchange: "N" },
  { reuters: "WFC.N", nameKr: "웰스파고", nameEng: "Wells Fargo", ticker: "WFC", exchange: "N" },
  { reuters: "C.N", nameKr: "씨티그룹", nameEng: "Citigroup", ticker: "C", exchange: "N" },
  { reuters: "AXP.N", nameKr: "아메리칸익스프레스", nameEng: "American Express", ticker: "AXP", exchange: "N" },
  { reuters: "BLK.N", nameKr: "블랙록", nameEng: "BlackRock", ticker: "BLK", exchange: "N" },

  // === 소비재/리테일 ===
  { reuters: "WMT.N", nameKr: "월마트", nameEng: "Walmart", ticker: "WMT", exchange: "N" },
  { reuters: "COST.O", nameKr: "코스트코", nameEng: "Costco", ticker: "COST", exchange: "O" },
  { reuters: "HD.N", nameKr: "홈디포", nameEng: "Home Depot", ticker: "HD", exchange: "N" },
  { reuters: "NKE.N", nameKr: "나이키", nameEng: "Nike", ticker: "NKE", exchange: "N" },
  { reuters: "SBUX.O", nameKr: "스타벅스", nameEng: "Starbucks", ticker: "SBUX", exchange: "O" },
  { reuters: "MCD.N", nameKr: "맥도날드", nameEng: "McDonald's", ticker: "MCD", exchange: "N" },
  { reuters: "KO.N", nameKr: "코카콜라", nameEng: "Coca-Cola", ticker: "KO", exchange: "N" },
  { reuters: "PEP.O", nameKr: "펩시", nameEng: "PepsiCo", ticker: "PEP", exchange: "O" },
  { reuters: "PG.N", nameKr: "P&G", nameEng: "Procter & Gamble", ticker: "PG", exchange: "N" },
  { reuters: "DIS.N", nameKr: "디즈니", nameEng: "Walt Disney", ticker: "DIS", exchange: "N" },

  // === 게임/엔터 ===
  { reuters: "U.N", nameKr: "유니티", nameEng: "Unity", ticker: "U", exchange: "N" },
  { reuters: "RBLX.N", nameKr: "로블록스", nameEng: "Roblox", ticker: "RBLX", exchange: "N" },
  { reuters: "TTWO.O", nameKr: "테이크투", nameEng: "Take-Two", ticker: "TTWO", exchange: "O" },
  { reuters: "EA.O", nameKr: "EA", nameEng: "Electronic Arts", ticker: "EA", exchange: "O" },

  // === 통신/미디어 ===
  { reuters: "T.N", nameKr: "AT&T", nameEng: "AT&T", ticker: "T", exchange: "N" },
  { reuters: "VZ.N", nameKr: "버라이즌", nameEng: "Verizon", ticker: "VZ", exchange: "N" },
  { reuters: "TMUS.O", nameKr: "T-모바일", nameEng: "T-Mobile", ticker: "TMUS", exchange: "O" },
  { reuters: "CMCSA.O", nameKr: "컴캐스트", nameEng: "Comcast", ticker: "CMCSA", exchange: "O" },
  { reuters: "SPOT.N", nameKr: "스포티파이", nameEng: "Spotify", ticker: "SPOT", exchange: "N" },

  // === SaaS/클라우드 ===
  { reuters: "ORCL.N", nameKr: "오라클", nameEng: "Oracle", ticker: "ORCL", exchange: "N" },
  { reuters: "IBM.N", nameKr: "IBM", nameEng: "IBM", ticker: "IBM", exchange: "N" },
  { reuters: "NOW.N", nameKr: "서비스나우", nameEng: "ServiceNow", ticker: "NOW", exchange: "N" },
  { reuters: "PANW.O", nameKr: "팔로알토", nameEng: "Palo Alto Networks", ticker: "PANW", exchange: "O" },
  { reuters: "FTNT.O", nameKr: "포티넷", nameEng: "Fortinet", ticker: "FTNT", exchange: "O" },
  { reuters: "ZS.O", nameKr: "지스케일러", nameEng: "Zscaler", ticker: "ZS", exchange: "O" },
  { reuters: "OKTA.O", nameKr: "옥타", nameEng: "Okta", ticker: "OKTA", exchange: "O" },
  { reuters: "SHOP.N", nameKr: "쇼피파이", nameEng: "Shopify", ticker: "SHOP", exchange: "N" },
  { reuters: "SQ.N", nameKr: "블록", nameEng: "Block", ticker: "SQ", exchange: "N" },
  { reuters: "PYPL.O", nameKr: "페이팔", nameEng: "PayPal", ticker: "PYPL", exchange: "O" },
  { reuters: "COIN.O", nameKr: "코인베이스", nameEng: "Coinbase", ticker: "COIN", exchange: "O" },

  // === 산업재 ===
  { reuters: "CAT.N", nameKr: "캐터필러", nameEng: "Caterpillar", ticker: "CAT", exchange: "N" },
  { reuters: "DE.N", nameKr: "디어", nameEng: "Deere", ticker: "DE", exchange: "N" },
  { reuters: "HON.O", nameKr: "하니웰", nameEng: "Honeywell", ticker: "HON", exchange: "O" },
  { reuters: "GE.N", nameKr: "GE에어로스페이스", nameEng: "GE Aerospace", ticker: "GE", exchange: "N" },
  { reuters: "UPS.N", nameKr: "UPS", nameEng: "UPS", ticker: "UPS", exchange: "N" },
  { reuters: "FDX.N", nameKr: "페덱스", nameEng: "FedEx", ticker: "FDX", exchange: "N" },
  { reuters: "MMM.N", nameKr: "3M", nameEng: "3M", ticker: "MMM", exchange: "N" },

  // === 리츠/유틸리티 ===
  { reuters: "O.N", nameKr: "리얼티인컴", nameEng: "Realty Income", ticker: "O", exchange: "N" },
  { reuters: "AMT.N", nameKr: "아메리칸타워", nameEng: "American Tower", ticker: "AMT", exchange: "N" },
  { reuters: "SPG.N", nameKr: "사이먼프로퍼티", nameEng: "Simon Property", ticker: "SPG", exchange: "N" },
  { reuters: "NEE.N", nameKr: "넥스트에라", nameEng: "NextEra Energy", ticker: "NEE", exchange: "N" },
  { reuters: "DUK.N", nameKr: "듀크에너지", nameEng: "Duke Energy", ticker: "DUK", exchange: "N" },
  { reuters: "VST.N", nameKr: "비스트라", nameEng: "Vistra", ticker: "VST", exchange: "N" },

  // === 원자재/금 ===
  { reuters: "NEM.N", nameKr: "뉴몬트", nameEng: "Newmont", ticker: "NEM", exchange: "N" },
  { reuters: "GOLD.N", nameKr: "바릭골드", nameEng: "Barrick Gold", ticker: "GOLD", exchange: "N" },
  { reuters: "FCX.N", nameKr: "프리포트맥모란", nameEng: "Freeport-McMoRan", ticker: "FCX", exchange: "N" },
  { reuters: "AA.N", nameKr: "알코아", nameEng: "Alcoa", ticker: "AA", exchange: "N" },
  { reuters: "CLF.N", nameKr: "클리블랜드클리프스", nameEng: "Cleveland-Cliffs", ticker: "CLF", exchange: "N" },
  { reuters: "NUE.N", nameKr: "뉴코어", nameEng: "Nucor", ticker: "NUE", exchange: "N" },

  // === 중국 ADR ===
  { reuters: "BABA.N", nameKr: "알리바바", nameEng: "Alibaba", ticker: "BABA", exchange: "N" },
  { reuters: "JD.O", nameKr: "징둥", nameEng: "JD.com", ticker: "JD", exchange: "O" },
  { reuters: "PDD.O", nameKr: "핀둬둬", nameEng: "PDD Holdings", ticker: "PDD", exchange: "O" },
  { reuters: "BIDU.O", nameKr: "바이두", nameEng: "Baidu", ticker: "BIDU", exchange: "O" },

  // === ETF (주요) ===
  { reuters: "SPY.P", nameKr: "SPY", nameEng: "SPDR S&P 500", ticker: "SPY", exchange: "P" },
  { reuters: "QQQ.O", nameKr: "QQQ", nameEng: "Invesco QQQ", ticker: "QQQ", exchange: "O" },
  { reuters: "SOXX.O", nameKr: "SOXX", nameEng: "iShares Semiconductor", ticker: "SOXX", exchange: "O" },
  { reuters: "SOXL.P", nameKr: "SOXL", nameEng: "Direxion Semiconductor Bull 3X", ticker: "SOXL", exchange: "P" },
  { reuters: "TQQQ.O", nameKr: "TQQQ", nameEng: "ProShares UltraPro QQQ", ticker: "TQQQ", exchange: "O" },
  { reuters: "SQQQ.O", nameKr: "SQQQ", nameEng: "ProShares UltraPro Short QQQ", ticker: "SQQQ", exchange: "O" },
  { reuters: "ARKK.P", nameKr: "ARKK", nameEng: "ARK Innovation", ticker: "ARKK", exchange: "P" },
  { reuters: "IWM.P", nameKr: "IWM", nameEng: "iShares Russell 2000", ticker: "IWM", exchange: "P" },
  { reuters: "XLF.P", nameKr: "XLF", nameEng: "Financial Select Sector SPDR", ticker: "XLF", exchange: "P" },
  { reuters: "XLE.P", nameKr: "XLE", nameEng: "Energy Select Sector SPDR", ticker: "XLE", exchange: "P" },

  // === 양자컴퓨터 ===
  { reuters: "IONQ.N", nameKr: "아이온큐", nameEng: "IonQ", ticker: "IONQ", exchange: "N" },
  { reuters: "RGTI.O", nameKr: "리게티", nameEng: "Rigetti", ticker: "RGTI", exchange: "O" },
  { reuters: "QBTS.N", nameKr: "디웨이브", nameEng: "D-Wave Quantum", ticker: "QBTS", exchange: "N" },

  // === 핀테크/크립토 ===
  { reuters: "MSTR.O", nameKr: "마이크로스트래티지", nameEng: "MicroStrategy", ticker: "MSTR", exchange: "O" },
  { reuters: "HOOD.O", nameKr: "로빈후드", nameEng: "Robinhood", ticker: "HOOD", exchange: "O" },
  { reuters: "AFRM.O", nameKr: "어펌", nameEng: "Affirm", ticker: "AFRM", exchange: "O" },
  { reuters: "SOFI.O", nameKr: "소파이", nameEng: "SoFi", ticker: "SOFI", exchange: "O" },

  // === 로봇/자동화 ===
  { reuters: "IRBT.O", nameKr: "아이로봇", nameEng: "iRobot", ticker: "IRBT", exchange: "O" },

  // === 식품/농업 ===
  { reuters: "ADM.N", nameKr: "ADM", nameEng: "Archer-Daniels-Midland", ticker: "ADM", exchange: "N" },

  // === 신재생에너지 ===
  { reuters: "ENPH.O", nameKr: "엔페이즈", nameEng: "Enphase Energy", ticker: "ENPH", exchange: "O" },
  { reuters: "SEDG.O", nameKr: "솔라엣지", nameEng: "SolarEdge", ticker: "SEDG", exchange: "O" },
  { reuters: "FSLR.O", nameKr: "퍼스트솔라", nameEng: "First Solar", ticker: "FSLR", exchange: "O" },
  { reuters: "PLUG.O", nameKr: "플러그파워", nameEng: "Plug Power", ticker: "PLUG", exchange: "O" },
];

// --- 검색 인덱스 구축 ---
const searchIndex = new Map<string, StockInfo>();

for (const stock of STOCK_LIST) {
  // 한글명 (정규화: 공백 제거, 소문자)
  searchIndex.set(stock.nameKr.replace(/\s+/g, '').toLowerCase(), stock);
  // 영문명 (소문자)
  searchIndex.set(stock.nameEng.replace(/\s+/g, '').toLowerCase(), stock);
  // 티커 (대문자 → 소문자로 저장)
  searchIndex.set(stock.ticker.toLowerCase(), stock);
  // 로이터코드 (소문자)
  searchIndex.set(stock.reuters.toLowerCase(), stock);
}

// 별칭 추가
const ALIASES: Record<string, string> = {
  '엔비디아': 'nvda',
  '마이크론테크놀로지': 'mu',
  '테슬라모터스': 'tsla',
  '알파벳': 'googl',
  '페이스북': 'meta',
  '아마존닷컴': 'amzn',
  '마소': 'msft',
  '브컴': 'avgo',
  '일릴리': 'lly',
  '노보': 'nvo',
  '존앤존': 'jnj',
  'jp모건': 'jpm',
  '골만삭스': 'gs',
  '모건스탠리': 'ms',
  '뱅오아': 'bac',
  '버크셔': 'brk.b',
  '맥도날드': 'mcd',
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
 * @param query 사용자 입력 (예: "엔비디아", "NVDA", "nvidia", "Micron")
 * @returns StockInfo | null
 */
export function findStock(query: string): StockInfo | null {
  const normalized = query.replace(/\s+/g, '').toLowerCase().trim();
  if (!normalized) return null;

  // 1. 정확히 매칭
  const exact = searchIndex.get(normalized);
  if (exact) return exact;

  // 2. 부분 매칭 (한글명/영문명에 포함)
  for (const stock of STOCK_LIST) {
    if (stock.nameKr.replace(/\s+/g, '').toLowerCase().includes(normalized)) return stock;
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
