// 토스페이먼츠 결제 검증 API
// 결제 성공 후 클라이언트가 이 함수에 paymentKey, orderId, amount를 보내면
// 토스 시크릿 키로 검증하여 정상 결제인지 확인합니다.
//
// 보안 핵심:
// - 시크릿 키는 환경변수에서만 사용 (클라이언트에 노출 금지)
// - 클라이언트가 보낸 amount와 실제 결제된 amount 비교
// - 검증 성공 시에만 콘텐츠 접근 권한 부여

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다' });
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    console.error('TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다');
    return res.status(500).json({ error: '결제 시스템 설정 오류' });
  }

  try {
    const { paymentKey, orderId, amount } = req.body;

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({ error: '필수 결제 정보가 누락되었습니다' });
    }

    // 토스페이먼츠 결제 승인 API 호출
    // 시크릿 키를 Base64로 인코딩한 Basic 인증 사용
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount)
      })
    });

    const data = await response.json();

    // 토스 API 오류 응답 처리
    if (!response.ok) {
      console.error('토스 결제 승인 실패:', data);
      return res.status(response.status).json({
        error: data.message || '결제 승인 실패',
        code: data.code
      });
    }

    // 결제 금액 재검증 (보안 핵심)
    // 클라이언트가 보낸 amount와 토스에서 확인된 실제 결제 금액이 일치하는지 확인
    if (data.totalAmount !== Number(amount)) {
      console.error('결제 금액 불일치:', { 
        expected: amount, 
        actual: data.totalAmount 
      });
      return res.status(400).json({ error: '결제 금액이 일치하지 않습니다' });
    }

    // 결제 상태 확인
    if (data.status !== 'DONE') {
      return res.status(400).json({ 
        error: '결제가 완료되지 않았습니다',
        status: data.status 
      });
    }

    // 검증 성공 - 결제 정보 반환
    return res.status(200).json({
      success: true,
      orderId: data.orderId,
      paymentKey: data.paymentKey,
      amount: data.totalAmount,
      method: data.method,
      approvedAt: data.approvedAt
    });

  } catch (err) {
    console.error('결제 검증 오류:', err);
    return res.status(500).json({ error: '결제 검증 중 오류가 발생했습니다' });
  }
}
