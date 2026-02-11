const res = await fetch('https://m.stock.naver.com/crypto/UPBIT/BTC');
const html = await res.text();

// Find all change-related fields
const patterns = [
  /"fluctuationsRatio"\s*:\s*"?(-?[\d.]+)"?/g,
  /"changeRate"\s*:\s*"?(-?[\d.]+)"?/g,
  /"changePrice"\s*:\s*"?(-?[\d.]+)"?/g,
  /"signedChangeRate"\s*:\s*"?(-?[\d.]+)"?/g,
  /"signedChangePrice"\s*:\s*"?(-?[\d.]+)"?/g,
  /"compareToPreviousClosePrice"\s*:\s*"?(-?[\d.]+)"?/g,
];

for (const p of patterns) {
  const ms = [...html.matchAll(p)];
  if (ms.length > 0) {
    console.log(`${p.source}:`);
    ms.slice(0, 3).forEach(m => console.log(`  -> ${m[0]}`));
  }
}

// Also check closePrice
const cp = html.match(/"closePrice"\s*:\s*"?(\d+)"?/);
console.log('\nclosePrice:', cp ? cp[0] : 'NOT FOUND');
