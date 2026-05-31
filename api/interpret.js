javascript
import { buildSystemPrompt, buildUserMessage } from './_lib/prompts.js';

// 간단한 메모리 기반 Rate Limiting
// (Vercel Serverless는 인스턴스가 자주 새로 뜨므로 완벽하진 않지만, 기본 보호)
const requestLog = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;  // 1분
const RATE_LIMIT_MAX = 10;             // 분당 10회 (한 IP 기준)

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() 
      || req.headers['x-real-ip'] 
      || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const log = requestLog.get(ip) || [];
  const recentLog = log.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentLog.length >= RATE_LIMIT_MAX) {
    return false;  // 차단
  }
  
  recentLog.push(now);
  requestLog.set(ip, recentLog);
  return true;  // 허용
}

// 입력 검증
function validateInput(body) {
  const { dream, emotion, lifeContext } = body;
  
  if (!dream || typeof dream !== 'string') {
    return { valid: false, error: '꿈 내용이 필요합니다' };
  }
  
  if (dream.length < 5) {
    return { valid: false, error: '꿈 내용이 너무 짧습니다' };
  }
  
  if (dream.length > 2000) {
    return { valid: false, error: '꿈 내용이 너무 깁니다 (최대 2000자)' };
  }
  
  // emotion, lifeContext는 선택사항
  if (emotion && (typeof emotion !== 'string' || emotion.length > 500)) {
    return { valid: false, error: '감정 입력이 올바르지 않습니다' };
  }
  
  if (lifeContext && (typeof lifeContext !== 'string' || lifeContext.length > 1000)) {
    return { valid: false, error: '맥락 입력이 올바르지 않습니다' };
  }
  
  return { valid: true };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다' });
  }

  try {
    // 1. Rate Limiting
    const ip = getClientIP(req);
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ 
        error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' 
      });
    }

    // 2. 환경변수 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY 미설정');
      return res.status(500).json({ error: '서버 설정 오류' });
    }

    // 3. 입력 검증
    const validation = validateInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { dream, emotion, lifeContext } = req.body;

    // 4. 백엔드에서 프롬프트 구성 (클라이언트 무시)
    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage(dream, emotion, lifeContext);

    // 5. Anthropic API 호출 (모든 파라미터 백엔드 고정)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',    // 백엔드 고정
        max_tokens: 16000,              // 백엔드 고정
        system: systemPrompt,           // 백엔드 구성
        messages: [
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API 오류:', response.status, errText);
      return res.status(response.status).json({ 
        error: `AI 응답 생성 실패 (${response.status})` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('서버 오류:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}
