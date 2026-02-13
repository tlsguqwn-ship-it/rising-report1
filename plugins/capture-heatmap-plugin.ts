/**
 * Vite 서버 미들웨어 플러그인: 한경 마켓맵 히트맵 자동 캡쳐
 * 
 * GET /api/capture-heatmap?market=kospi  → KOSPI 히트맵 PNG base64
 * GET /api/capture-heatmap?market=kosdaq → KOSDAQ 히트맵 PNG base64
 */
import type { Plugin } from 'vite';

export function captureHeatmapPlugin(): Plugin {
  return {
    name: 'capture-heatmap',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);

        if (url.pathname !== '/api/capture-heatmap') {
          return next();
        }

        const market = url.searchParams.get('market');
        if (market !== 'kospi' && market !== 'kosdaq') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'market 파라미터는 kospi 또는 kosdaq 이어야 합니다.' }));
          return;
        }

        const targetUrl = `https://markets.hankyung.com/marketmap/${market}`;

        try {
          // 동적 import (ESM 호환)
          const puppeteer = await import('puppeteer');
          const browser = await puppeteer.default.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
            defaultViewport: { width: 1440, height: 900 },
          });

          const page = await browser.newPage();

          // 불필요한 리소스 차단 (속도 향상)
          await page.setRequestInterception(true);
          page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['font', 'media'].includes(resourceType)) {
              request.abort();
            } else {
              request.continue();
            }
          });

          console.log(`[capture-heatmap] ${market.toUpperCase()} 히트맵 캡쳐 시작...`);

          await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

          // AnyChart 렌더링 완료 대기
          await page.waitForSelector('#map_area svg', { timeout: 15000 });
          // 애니메이션 완료 대기
          await new Promise(resolve => setTimeout(resolve, 3000));

          // #map_area 요소 스크린샷
          const element = await page.$('#map_area');
          if (!element) {
            await browser.close();
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: '#map_area 요소를 찾을 수 없습니다.' }));
            return;
          }

          const screenshotBuffer = await element.screenshot({ type: 'png' });
          await browser.close();

          const base64 = Buffer.from(screenshotBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64}`;

          console.log(`[capture-heatmap] ${market.toUpperCase()} 캡쳐 완료 (${(base64.length / 1024).toFixed(0)}KB)`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify({ 
            success: true, 
            market,
            dataUrl,
            capturedAt: new Date().toISOString(),
          }));

        } catch (error: any) {
          console.error(`[capture-heatmap] 에러:`, error.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: `캡쳐 실패: ${error.message}`,
          }));
        }
      });
    },
  };
}
