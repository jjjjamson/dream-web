// 공유 링크 생성 API
// 사용자의 해몽 결과 중 결제 전 공개 부분만 저장하고 짧은 ID를 반환합니다.
// 심층 해석(detail)과 위로(comfort), 행운 아이템(lucky)은 저장하지 않습니다.

import { createClient } from 'redis';

// 짧은 ID 생성 (8자리)
function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다' });
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('REDIS_URL 환경변수가 설정되지 않았습니다');
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  let client;
  try {
    const { dream, result, emotion, lifeContext } = req.body;

    if (!dream || !result) {
      return res.status(400).json({ error: '필수 데이터가 누락되었습니다' });
    }

    // 결제 전 공개 부분만 저장 (심층 해석/위로/행운 제외)
    const shareData = {
      dream: dream.slice(0, 800), // 입력 제한
      emotion: emotion || '',
      lifeContext: lifeContext || '',
      gilhyung: result.gilhyung,
      matched_symbols: result.matched_symbols || [],
      symbols: result.symbols || [],
      summary: result.summary || '',
      created_at: new Date().toISOString()
    };

    // 짧은 ID 생성 (충돌 시 재시도)
    let id = generateShortId();
    let attempts = 0;

    client = createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis 오류:', err));
    await client.connect();

    // 중복 ID 체크 (드물지만 안전 장치)
    while (attempts < 5) {
      const exists = await client.exists(`share:${id}`);
      if (!exists) break;
      id = generateShortId();
      attempts++;
    }

    // 90일 만료로 저장 (TTL: 90 * 24 * 60 * 60 초)
    await client.setEx(`share:${id}`, 7776000, JSON.stringify(shareData));

    return res.status(200).json({ id });

  } catch (err) {
    console.error('공유 링크 생성 오류:', err);
    return res.status(500).json({ error: '공유 링크 생성에 실패했습니다' });
  } finally {
    if (client) {
      try { await client.quit(); } catch {}
    }
  }
}
