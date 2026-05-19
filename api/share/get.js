// 공유 링크 조회 API
// 짧은 ID로 저장된 해몽 결과를 조회합니다.

import { createClient } from 'redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET 요청만 허용됩니다' });
  }

  const id = req.query.id;
  if (!id || typeof id !== 'string' || id.length !== 8) {
    return res.status(400).json({ error: '잘못된 공유 ID입니다' });
  }

  // ID 형식 검증 (영숫자만 허용)
  if (!/^[a-z0-9]{8}$/.test(id)) {
    return res.status(400).json({ error: '잘못된 공유 ID 형식입니다' });
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('REDIS_URL 환경변수가 설정되지 않았습니다');
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  let client;
  try {
    client = createClient({ url: redisUrl });
    client.on('error', (err) => console.error('Redis 오류:', err));
    await client.connect();

    const data = await client.get(`share:${id}`);
    if (!data) {
      return res.status(404).json({ error: '해당 공유 링크를 찾을 수 없거나 만료되었습니다' });
    }

    return res.status(200).json(JSON.parse(data));

  } catch (err) {
    console.error('공유 링크 조회 오류:', err);
    return res.status(500).json({ error: '공유 링크 조회에 실패했습니다' });
  } finally {
    if (client) {
      try { await client.quit(); } catch {}
    }
  }
}
