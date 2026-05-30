// Vercel Serverless Function
// 사용자 브라우저에서 직접 Anthropic API를 호출하지 않고,
// 이 함수가 중간에서 안전하게 처리합니다.
// API 키는 Vercel 환경변수에 보관되어 사용자에게 노출되지 않습니다.

export default async function handler(req, res) {
  // CORS 설정 (같은 도메인에서만 호출 허용)
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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    // 사용자가 보낸 요청을 그대로 Anthropic으로 전달
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { ... },
      body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: systemPrompt,
      messages: [...]
    })
});

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API 오류:', errText);
      return res.status(response.status).json({ error: `Anthropic API 오류: ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('서버 오류:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}
