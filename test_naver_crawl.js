import https from 'https';

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'finance.naver.com',
      path,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    }).on('error', reject);
  });
}

async function main() {
  for (const code of ['KOSPI', 'KOSDAQ']) {
    console.log(`\n=== ${code} ===`);
    const html = await fetchPage(`/sise/sise_index.naver?code=${code}`);
    
    // 현재가
    const nowM = html.match(/id="now_value">([^<]+)/);
    console.log('현재가:', nowM ? nowM[1].trim() : 'N/A');
    
    // 등락폭
    const spanM = html.match(/change_value_and_rate[\s\S]*?<span>([^<]+)<\/span>/);
    console.log('등락폭:', spanM ? spanM[1] : 'N/A');
    
    // 등락률
    const rateM = html.match(/change_value_and_rate[\s\S]*?<\/span>\s*([^<]+)/);
    console.log('등락률:', rateM ? rateM[1].trim() : 'N/A');
    
    // 방향
    const upM = html.match(/class="quotient\s+(\w+)"/);
    console.log('방향:', upM ? upM[1] : 'N/A');
    
    // 투자자별 매매동향 from page text
    const fullText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    
    // 개인, 외국인, 기관 순매수 추출
    const invMatch = fullText.match(/개인\s*([\-+]?[\d,]+)\s*억?\s*외국인\s*([\-+]?[\d,]+)\s*억?\s*기관\s*([\-+]?[\d,]+)/);
    if (invMatch) {
      console.log('개인:', invMatch[1], '외국인:', invMatch[2], '기관:', invMatch[3]);
    } else {
      // Alternative extraction
      const segments = fullText.match(/투자자별[\s\S]{0,200}/);
      console.log('투자자별 주변 텍스트:', segments ? segments[0] : 'NOT FOUND');
      
      // Try individual extraction
      const personalM = fullText.match(/개인\s*([\-+]?[\d,]+)/);
      const foreignM = fullText.match(/외국인\s*([\-+]?[\d,]+)/);
      const instM = fullText.match(/기관\s*([\-+]?[\d,]+)/);
      console.log('개인:', personalM && personalM[1], '외국인:', foreignM && foreignM[1], '기관:', instM && instM[1]);
    }
  }
}

main().catch(console.error);
