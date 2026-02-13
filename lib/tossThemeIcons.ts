/**
 * 토스증권 테마 아이콘 매핑
 * - 섹터/테마명을 입력하면 해당하는 토스 3D 아이콘 URL을 반환
 * - 원본: https://static.toss.im/ml-product/[key].png
 * - 투명 배경 PNG, 고해상도
 */

export interface TossThemeIcon {
  name: string;
  url: string;
  key: string;
}

// 전체 테마 아이콘 매핑 데이터 (182개)
export const TOSS_THEME_ICONS: TossThemeIcon[] = [
  { name: "증권", url: "https://static.toss.im/ml-product/security-area.png", key: "security-area" },
  { name: "저축은행", url: "https://static.toss.im/ml-product/savings-bank-area.png", key: "savings-bank-area" },
  { name: "의료서비스", url: "https://static.toss.im/ml-product/medical-care-area.png", key: "medical-care-area" },
  { name: "금융", url: "https://static.toss.im/ml-product/coin-financial-area.png", key: "coin-financial-area" },
  { name: "금융그룹", url: "https://static.toss.im/ml-product/financial-group-area.png", key: "financial-group-area" },
  { name: "우주항공", url: "https://static.toss.im/ml-product/space-airline-area.png", key: "space-airline-area" },
  { name: "신용평가", url: "https://static.toss.im/ml-product/credit-rating-graph-area.png", key: "credit-rating-graph-area" },
  { name: "백화점", url: "https://static.toss.im/ml-product/department-store-area.png", key: "department-store-area" },
  { name: "호텔과 리조트", url: "https://static.toss.im/ml-product/hotel-resort-area.png", key: "hotel-resort-area" },
  { name: "화력발전", url: "https://static.toss.im/ml-product/fire-power-plant-area.png", key: "fire-power-plant-area" },
  { name: "보험", url: "https://static.toss.im/ml-product/insurance-shield-blue-area.png", key: "insurance-shield-blue-area" },
  { name: "주거용 리츠", url: "https://static.toss.im/ml-product/residential-reits-area.png", key: "residential-reits-area" },
  { name: "원자력발전", url: "https://static.toss.im/ml-product/power-plant-red-area.png", key: "power-plant-red-area" },
  { name: "가스판매", url: "https://static.toss.im/ml-product/gas-sale-red-area.png", key: "gas-sale-red-area" },
  { name: "골판지", url: "https://static.toss.im/ml-product/corrugated-cardboard-area.png", key: "corrugated-cardboard-area" },
  { name: "편의점", url: "https://static.toss.im/ml-product/convenience-store-area.png", key: "convenience-store-area" },
  { name: "가스에너지", url: "https://static.toss.im/ml-product/power-plant-yellow-area.png", key: "power-plant-yellow-area" },
  { name: "인프라 리츠", url: "https://static.toss.im/ml-product/infrastructure-reits-area.png", key: "infrastructure-reits-area" },
  { name: "윤활유", url: "https://static.toss.im/ml-product/lubricant-area.png", key: "lubricant-area" },
  { name: "렌터카", url: "https://static.toss.im/ml-product/rental-car-area.png", key: "rental-car-area" },
  { name: "리츠", url: "https://static.toss.im/ml-product/reits-area.png", key: "reits-area" },
  { name: "부동산임대개발", url: "https://static.toss.im/ml-product/property-trust-development-area.png", key: "property-trust-development-area" },
  { name: "지주사", url: "https://static.toss.im/ml-product/holding-company-area.png", key: "holding-company-area" },
  { name: "오피스 리츠", url: "https://static.toss.im/ml-product/office-reits-area.png", key: "office-reits-area" },
  { name: "비료와 농약", url: "https://static.toss.im/ml-product/fertilizer-pesticide-area.png", key: "fertilizer-pesticide-area" },
  { name: "상업용 리츠", url: "https://static.toss.im/ml-product/commercial-reits-area.png", key: "commercial-reits-area" },
  { name: "돼지고기", url: "https://static.toss.im/ml-product/pork-area.png", key: "pork-area" },
  { name: "여행", url: "https://static.toss.im/ml-product/travel-carrier-area.png", key: "travel-carrier-area" },
  { name: "골프", url: "https://static.toss.im/ml-product/golf-area.png", key: "golf-area" },
  { name: "닭고기", url: "https://static.toss.im/ml-product/chicken-area.png", key: "chicken-area" },
  { name: "여가생활", url: "https://static.toss.im/ml-product/skate-shoes-area.png", key: "skate-shoes-area" },
  { name: "백판지", url: "https://static.toss.im/ml-product/white-cardboard-area.png", key: "white-cardboard-area" },
  { name: "알루미늄", url: "https://static.toss.im/ml-product/aluminium-area.png", key: "aluminium-area" },
  { name: "종이", url: "https://static.toss.im/ml-product/paper-area.png", key: "paper-area" },
  { name: "조선사", url: "https://static.toss.im/ml-product/shipbuilding-area.png", key: "shipbuilding-area" },
  { name: "전문점", url: "https://static.toss.im/ml-product/bag-gold-area.png", key: "bag-gold-area" },
  { name: "여행플랫폼", url: "https://static.toss.im/ml-product/travel-platform-area.png", key: "travel-platform-area" },
  { name: "결제서비스", url: "https://static.toss.im/ml-product/pos-payment-service-area.png", key: "pos-payment-service-area" },
  { name: "출판", url: "https://static.toss.im/ml-product/publication-area.png", key: "publication-area" },
  { name: "과자", url: "https://static.toss.im/ml-product/cookie-area.png", key: "cookie-area" },
  { name: "조선기자재", url: "https://static.toss.im/ml-product/shipbuilding-equipment-area.png", key: "shipbuilding-equipment-area" },
  { name: "조선", url: "https://static.toss.im/ml-product/shipbuilding-area.png", key: "shipbuilding-area" },
  { name: "전기설비", url: "https://static.toss.im/ml-product/electrical-equipment-area.png", key: "electrical-equipment-area" },
  { name: "항공사", url: "https://static.toss.im/ml-product/aviation-area.png", key: "aviation-area" },
  { name: "벤처캐피탈", url: "https://static.toss.im/ml-product/venture-capital-area.png", key: "venture-capital-area" },
  { name: "유통", url: "https://static.toss.im/ml-product/warehouse-circulation-area.png", key: "warehouse-circulation-area" },
  { name: "은행", url: "https://static.toss.im/ml-product/bank-area.png", key: "bank-area" },
  { name: "수산물", url: "https://static.toss.im/ml-product/seafood-area.png", key: "seafood-area" },
  { name: "경영지원", url: "https://static.toss.im/ml-product/office-desk-chair-area.png", key: "office-desk-chair-area" },
  { name: "전력에너지", url: "https://static.toss.im/ml-product/electrical-energy-area.png", key: "electrical-energy-area" },
  { name: "간편식", url: "https://static.toss.im/ml-product/ready-made-food-dumpling-area.png", key: "ready-made-food-dumpling-area" },
  { name: "무역", url: "https://static.toss.im/ml-product/trade-area.png", key: "trade-area" },
  { name: "생활가전", url: "https://static.toss.im/ml-product/washing-machine-area.png", key: "washing-machine-area" },
  { name: "카드", url: "https://static.toss.im/ml-product/credit-card-area.png", key: "credit-card-area" },
  { name: "원유", url: "https://static.toss.im/ml-product/crude-oil-area.png", key: "crude-oil-area" },
  { name: "금융기기", url: "https://static.toss.im/ml-product/atm-area.png", key: "atm-area" },
  { name: "건설사", url: "https://static.toss.im/ml-product/construction-company-area.png", key: "construction-company-area" },
  { name: "술", url: "https://static.toss.im/ml-product/alcoholic-drink-area.png", key: "alcoholic-drink-area" },
  { name: "사료", url: "https://static.toss.im/ml-product/fodder-area.png", key: "fodder-area" },
  { name: "농업용 기계", url: "https://static.toss.im/ml-product/tractor-soil-area.png", key: "tractor-soil-area" },
  { name: "운송", url: "https://static.toss.im/ml-product/transportation-truck-box-area.png", key: "transportation-truck-box-area" },
  { name: "아연", url: "https://static.toss.im/ml-product/zinc-area.png", key: "zinc-area" },
  { name: "가전부품", url: "https://static.toss.im/ml-product/electronic-component-area.png", key: "electronic-component-area" },
  { name: "농업", url: "https://static.toss.im/ml-product/tractor-soil-area.png", key: "tractor-soil-area" },
  { name: "건설", url: "https://static.toss.im/ml-product/construction-company-area.png", key: "construction-company-area" },
  { name: "가전제품", url: "https://static.toss.im/ml-product/home-appliance-area.png", key: "home-appliance-area" },
  { name: "산업용 가스", url: "https://static.toss.im/ml-product/industrial-gas-area.png", key: "industrial-gas-area" },
  { name: "주유소", url: "https://static.toss.im/ml-product/gas-station-area.png", key: "gas-station-area" },
  { name: "금속", url: "https://static.toss.im/ml-product/metal-area.png", key: "metal-area" },
  { name: "교육출판", url: "https://static.toss.im/ml-product/book-stacking-area.png", key: "book-stacking-area" },
  { name: "철강", url: "https://static.toss.im/ml-product/steel-bolt-area.png", key: "steel-bolt-area" },
  { name: "화학제품", url: "https://static.toss.im/ml-product/chemical-product-area.png", key: "chemical-product-area" },
  { name: "건설장비", url: "https://static.toss.im/ml-product/construction-equipment-area.png", key: "construction-equipment-area" },
  { name: "화학", url: "https://static.toss.im/ml-product/chemical-beaker-area.png", key: "chemical-beaker-area" },
  { name: "면세점", url: "https://static.toss.im/ml-product/duty-free-shop-area.png", key: "duty-free-shop-area" },
  { name: "방위산업물자", url: "https://static.toss.im/ml-product/defense-bomb-area.png", key: "defense-bomb-area" },
  { name: "건설자재", url: "https://static.toss.im/ml-product/construction-materials-area.png", key: "construction-materials-area" },
  { name: "음료", url: "https://static.toss.im/ml-product/beverage-area.png", key: "beverage-area" },
  { name: "음식료", url: "https://static.toss.im/ml-product/hamburger-combo-area.png", key: "hamburger-combo-area" },
  { name: "의류브랜드", url: "https://static.toss.im/ml-product/clothing-brand-area.png", key: "clothing-brand-area" },
  { name: "자전거", url: "https://static.toss.im/ml-product/bicycle-area.png", key: "bicycle-area" },
  { name: "제약", url: "https://static.toss.im/ml-product/pharmaceutic-area.png", key: "pharmaceutic-area" },
  { name: "식자재유통", url: "https://static.toss.im/ml-product/food-distribution-area.png", key: "food-distribution-area" },
  { name: "음식점브랜드", url: "https://static.toss.im/ml-product/food-brand-area.png", key: "food-brand-area" },
  { name: "배터리부품", url: "https://static.toss.im/ml-product/battery-parts-area.png", key: "battery-parts-area" },
  { name: "해상운송", url: "https://static.toss.im/ml-product/sea-shipment-area.png", key: "sea-shipment-area" },
  { name: "카지노", url: "https://static.toss.im/ml-product/casino-area.png", key: "casino-area" },
  { name: "웹툰", url: "https://static.toss.im/ml-product/webtoon-area.png", key: "webtoon-area" },
  { name: "전기차", url: "https://static.toss.im/ml-product/electric-car-area.png", key: "electric-car-area" },
  { name: "산업용 기계", url: "https://static.toss.im/ml-product/machine-mint-area.png", key: "machine-mint-area" },
  { name: "밀가루", url: "https://static.toss.im/ml-product/flour-area.png", key: "flour-area" },
  { name: "원유정제", url: "https://static.toss.im/ml-product/crude-oil-refined-area.png", key: "crude-oil-refined-area" },
  { name: "의료", url: "https://static.toss.im/ml-product/medical-care-area.png", key: "medical-care-area" },
  { name: "폐기물처리", url: "https://static.toss.im/ml-product/waste-disposal-area.png", key: "waste-disposal-area" },
  { name: "반도체부품소재", url: "https://static.toss.im/ml-product/semiconductor-parts-mint-area.png", key: "semiconductor-parts-mint-area" },
  { name: "홈쇼핑", url: "https://static.toss.im/ml-product/home-shopping-area.png", key: "home-shopping-area" },
  { name: "이동통신사", url: "https://static.toss.im/ml-product/phone-communication-area.png", key: "phone-communication-area" },
  { name: "물류", url: "https://static.toss.im/ml-product/delivery-service-area.png", key: "delivery-service-area" },
  { name: "클라우드", url: "https://static.toss.im/ml-product/laptop-cloud-area.png", key: "laptop-cloud-area" },
  { name: "바이오서비스", url: "https://static.toss.im/ml-product/bio-service-area.png", key: "bio-service-area" },
  { name: "식품포장재", url: "https://static.toss.im/ml-product/food-wrapper-area.png", key: "food-wrapper-area" },
  { name: "의류", url: "https://static.toss.im/ml-product/clothing-area.png", key: "clothing-area" },
  { name: "콩", url: "https://static.toss.im/ml-product/bean-area.png", key: "bean-area" },
  { name: "게임플랫폼", url: "https://static.toss.im/ml-product/game-area.png", key: "game-area" },
  { name: "보안", url: "https://static.toss.im/ml-product/security-shield-area.png", key: "security-shield-area" },
  { name: "의료기기", url: "https://static.toss.im/ml-product/stethoscope-area.png", key: "stethoscope-area" },
  { name: "음원", url: "https://static.toss.im/ml-product/cd-sound-source-area.png", key: "cd-sound-source-area" },
  { name: "컴퓨터와 주변기기", url: "https://static.toss.im/ml-product/computer-speaker-monitor-area.png", key: "computer-speaker-monitor-area" },
  { name: "식품첨가물", url: "https://static.toss.im/ml-product/food-additive-area.png", key: "food-additive-area" },
  { name: "신재생에너지", url: "https://static.toss.im/ml-product/renewable-energy-area.png", key: "renewable-energy-area" },
  { name: "설탕", url: "https://static.toss.im/ml-product/sugar-area.png", key: "sugar-area" },
  { name: "자동차유통", url: "https://static.toss.im/ml-product/car-distribution-area.png", key: "car-distribution-area" },
  { name: "기계", url: "https://static.toss.im/ml-product/machine-blue-area.png", key: "machine-blue-area" },
  { name: "탄소저감", url: "https://static.toss.im/ml-product/sprout-hand-area.png", key: "sprout-hand-area" },
  { name: "의류제조", url: "https://static.toss.im/ml-product/clothing-brand-area.png", key: "clothing-brand-area" },
  { name: "섬유", url: "https://static.toss.im/ml-product/fiber-area.png", key: "fiber-area" },
  { name: "전자부품", url: "https://static.toss.im/ml-product/electronic-component-area.png", key: "electronic-component-area" },
  { name: "구리", url: "https://static.toss.im/ml-product/copper-area.png", key: "copper-area" },
  { name: "연예기획사", url: "https://static.toss.im/ml-product/entertainment-agency-area.png", key: "entertainment-agency-area" },
  { name: "화장품제조", url: "https://static.toss.im/ml-product/cosmetic-purple-area.png", key: "cosmetic-purple-area" },
  { name: "자동차브랜드", url: "https://static.toss.im/ml-product/car-brand-area.png", key: "car-brand-area" },
  { name: "통신", url: "https://static.toss.im/ml-product/phone-communication-area.png", key: "phone-communication-area" },
  { name: "통신장비", url: "https://static.toss.im/ml-product/home-route-area.png", key: "home-route-area" },
  { name: "생활용품", url: "https://static.toss.im/ml-product/household-item-area.png", key: "household-item-area" },
  { name: "소프트웨어", url: "https://static.toss.im/ml-product/laptop-it-solution-area.png", key: "laptop-it-solution-area" },
  { name: "교육서비스", url: "https://static.toss.im/ml-product/highlight-pen-area.png", key: "highlight-pen-area" },
  { name: "게임", url: "https://static.toss.im/ml-product/game-area.png", key: "game-area" },
  { name: "IT", url: "https://static.toss.im/ml-product/it-area.png", key: "it-area" },
  { name: "철도", url: "https://static.toss.im/ml-product/railway-area.png", key: "railway-area" },
  { name: "화장품", url: "https://static.toss.im/ml-product/cosmetic-pink-area.png", key: "cosmetic-pink-area" },
  { name: "교육", url: "https://static.toss.im/ml-product/academy-blue-area.png", key: "academy-blue-area" },
  { name: "자동차부품", url: "https://static.toss.im/ml-product/car-parts-area.png", key: "car-parts-area" },
  { name: "자동차", url: "https://static.toss.im/ml-product/car-area.png", key: "car-area" },
  { name: "대형마트", url: "https://static.toss.im/ml-product/supermarket-shopping-cart-area.png", key: "supermarket-shopping-cart-area" },
  { name: "디스플레이장비", url: "https://static.toss.im/ml-product/display-equipment-area.png", key: "display-equipment-area" },
  { name: "바이오", url: "https://static.toss.im/ml-product/microscope-area.png", key: "microscope-area" },
  { name: "온라인쇼핑", url: "https://static.toss.im/ml-product/online-shopping-mall-area.png", key: "online-shopping-mall-area" },
  { name: "게임개발", url: "https://static.toss.im/ml-product/game-area.png", key: "game-area" },
  { name: "바이오시밀러", url: "https://static.toss.im/ml-product/biosimilar-area.png", key: "biosimilar-area" },
  { name: "반도체장비", url: "https://static.toss.im/ml-product/semiconductor-equipment-area.png", key: "semiconductor-equipment-area" },
  { name: "반도체", url: "https://static.toss.im/ml-product/semiconductor-area.png", key: "semiconductor-area" },
  { name: "IT솔루션구축", url: "https://static.toss.im/ml-product/laptop-it-solution-area.png", key: "laptop-it-solution-area" },
  { name: "광고", url: "https://static.toss.im/ml-product/advertisement-area.png", key: "advertisement-area" },
  { name: "엔터테인먼트", url: "https://static.toss.im/ml-product/entertainment-area.png", key: "entertainment-area" },
  { name: "바이오신약", url: "https://static.toss.im/ml-product/bio-new-drug-area.png", key: "bio-new-drug-area" },
  { name: "교육장비", url: "https://static.toss.im/ml-product/calculator-area.png", key: "calculator-area" },
  { name: "담배", url: "https://static.toss.im/ml-product/cigarette-area.png", key: "cigarette-area" },
  { name: "디스플레이", url: "https://static.toss.im/ml-product/display-area.png", key: "display-area" },
  { name: "LED", url: "https://static.toss.im/ml-product/led-area.png", key: "led-area" },
  { name: "방송", url: "https://static.toss.im/ml-product/broadcast-live-area.png", key: "broadcast-live-area" },
  { name: "캐릭터", url: "https://static.toss.im/ml-product/character-catch-area.png", key: "character-catch-area" },
  { name: "금융상품거래소", url: "https://static.toss.im/ml-product/financial-goods-exchange-area.png", key: "financial-goods-exchange-area" },
  { name: "암호화폐", url: "https://static.toss.im/ml-product/coin-cryptocurrency-area.png", key: "coin-cryptocurrency-area" },
  { name: "광산개발", url: "https://static.toss.im/ml-product/tractor-soil-area.png", key: "tractor-soil-area" },
  { name: "테마파크", url: "https://static.toss.im/ml-product/theme-park-area.png", key: "theme-park-area" },
  { name: "인공지능", url: "https://static.toss.im/ml-product/artificial-intelligence-area.png", key: "artificial-intelligence-area" },
  { name: "드론", url: "https://static.toss.im/ml-product/drone-area.png", key: "drone-area" },
  { name: "농산물종자", url: "https://static.toss.im/ml-product/tractors-agriculture-area.png", key: "tractors-agriculture-area" },
  { name: "로봇", url: "https://static.toss.im/ml-product/robot-area.png", key: "robot-area" },
  { name: "배터리소재", url: "https://static.toss.im/ml-product/battery-components-area.png", key: "battery-components-area" },
  { name: "원유개발", url: "https://static.toss.im/ml-product/crude-oil-development-area.png", key: "crude-oil-development-area" },
  { name: "오토바이", url: "https://static.toss.im/ml-product/motorcycle-area.png", key: "motorcycle-area" },
  { name: "지역난방", url: "https://static.toss.im/ml-product/power-plant-orange-area.png", key: "power-plant-orange-area" },
  { name: "화학원료", url: "https://static.toss.im/ml-product/chemical-raw-material-area.png", key: "chemical-raw-material-area" },
  { name: "동영상플랫폼", url: "https://static.toss.im/ml-product/video-platform-area.png", key: "video-platform-area" },
  { name: "반도체팹리스", url: "https://static.toss.im/ml-product/semiconductor-factory-purple-area.png", key: "semiconductor-factory-purple-area" },
  { name: "화장품브랜드", url: "https://static.toss.im/ml-product/cosmetic-orange-area.png", key: "cosmetic-orange-area" },
  { name: "대마초", url: "https://static.toss.im/ml-product/cannabis-area.png", key: "cannabis-area" },
  { name: "천연가스개발", url: "https://static.toss.im/ml-product/power-plant-green-area.png", key: "power-plant-green-area" },
  { name: "전기차부품", url: "https://static.toss.im/ml-product/electric-car-part-area.png", key: "electric-car-part-area" },
  { name: "수자원", url: "https://static.toss.im/ml-product/water-bottle-area.png", key: "water-bottle-area" },
  { name: "스마트폰제조", url: "https://static.toss.im/ml-product/smartphone-area.png", key: "smartphone-area" },
  { name: "영화", url: "https://static.toss.im/ml-product/movie-film-area.png", key: "movie-film-area" },
  { name: "인터넷", url: "https://static.toss.im/ml-product/internet-area.png", key: "internet-area" },
  { name: "디스플레이부품소재", url: "https://static.toss.im/ml-product/display-parts-area.png", key: "display-parts-area" },
  { name: "종합반도체", url: "https://static.toss.im/ml-product/semiconductor-factory-blue-area.png", key: "semiconductor-factory-blue-area" },
  { name: "디스플레이패널", url: "https://static.toss.im/ml-product/display-panel-area.png", key: "display-panel-area" },
  { name: "스마트폰부품", url: "https://static.toss.im/ml-product/smartphone-parts-area.png", key: "smartphone-parts-area" },
  { name: "반도체파운드리", url: "https://static.toss.im/ml-product/semiconductor-factory-mint-area.png", key: "semiconductor-factory-mint-area" },
  { name: "아이스크림", url: "https://static.toss.im/ml-product/ice-cream-area.png", key: "ice-cream-area" },
  { name: "배터리", url: "https://static.toss.im/ml-product/battery-area.png", key: "battery-area" },
  { name: "구인구직", url: "https://static.toss.im/ml-product/man-workwear-area.png", key: "man-workwear-area" },
  { name: "양자컴퓨터", url: "https://static.toss.im/ml-product/quantum-computer-area.png", key: "quantum-computer-area" },
  { name: "방위산업", url: "https://static.toss.im/ml-product/defense-bomb-area.png", key: "defense-bomb-area" },
  { name: "엔터", url: "https://static.toss.im/ml-product/entertainment-area.png", key: "entertainment-area" },
];

// ===== 빠른 조회를 위한 맵 (정확 매칭) =====
const exactMap = new Map<string, string>();
TOSS_THEME_ICONS.forEach(icon => {
  exactMap.set(icon.name, icon.url);
});

/**
 * 섹터/테마명으로 토스 아이콘 URL을 가져옵니다.
 * 
 * 매칭 우선순위:
 * 1. 정확한 이름 매칭 ("반도체" → 반도체 아이콘)
 * 2. 포함 매칭 ("반도체장비" 입력 시 → 반도체장비 아이콘)
 * 3. 부분 매칭 ("반도" 입력 시 → 반도체 관련 첫 번째 아이콘)
 * 
 * @param sectorName 섹터/테마명 (예: "반도체", "인공지능", "로봇")
 * @param size 아이콘 크기 (px, 기본값 24)
 * @returns 아이콘 URL 또는 null
 */
export function getTossIconUrl(sectorName: string, size: number = 96): string | null {
  if (!sectorName) return null;
  
  const name = sectorName.trim();
  
  // 1. 정확 매칭
  if (exactMap.has(name)) {
    return exactMap.get(name)!;
  }
  
  // 2. 포함 매칭 (입력값이 테마명에 포함되거나, 테마명이 입력값에 포함)
  const containMatch = TOSS_THEME_ICONS.find(
    icon => icon.name.includes(name) || name.includes(icon.name)
  );
  if (containMatch) {
    return containMatch.url;
  }
  
  return null;
}

/**
 * 섹터/테마명으로 토스 아이콘 정보 전체를 가져옵니다.
 * @param sectorName 섹터/테마명
 * @returns TossThemeIcon 또는 null
 */
export function getTossIcon(sectorName: string): TossThemeIcon | null {
  if (!sectorName) return null;
  
  const name = sectorName.trim();
  
  // 정확 매칭
  const exact = TOSS_THEME_ICONS.find(icon => icon.name === name);
  if (exact) return exact;
  
  // 포함 매칭
  const contain = TOSS_THEME_ICONS.find(
    icon => icon.name.includes(name) || name.includes(icon.name)
  );
  if (contain) return contain;
  
  return null;
}

/**
 * 검색어로 관련 테마 아이콘을 모두 찾습니다.
 * @param query 검색어
 * @returns 매칭되는 TossThemeIcon 배열
 */
export function searchTossIcons(query: string): TossThemeIcon[] {
  if (!query) return [];
  
  const q = query.trim();
  return TOSS_THEME_ICONS.filter(
    icon => icon.name.includes(q) || q.includes(icon.name)
  );
}

/**
 * 사용 가능한 모든 테마명 목록을 반환합니다.
 */
export function getAllThemeNames(): string[] {
  return TOSS_THEME_ICONS.map(icon => icon.name);
}
