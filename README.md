# 밤편지 — 꿈이 보낸 편지

한국 전통 해몽과 심리학적 분석을 결합한 AI 꿈 해몽 서비스.

## 🎁 베타 모드

현재 베타 기간으로 모든 해석이 무료로 제공됩니다.

### 정식 출시 시 결제 모드 전환 방법

`index.html` 상단의 다음 한 줄만 변경:

```javascript
const BETA_MODE = true;   // → false 로 변경
```

자동으로 적용되는 변경사항:
- 헤더의 "🎁 BETA — 모든 해석 무료" 배지 자동 숨김
- 페이월 버튼: "🎁 무료로 잠금해제" → "🌙 ₩1,990 — 전체 해몽 보기"
- 푸터의 "💌 베타 의견 보내기" 링크 자동 숨김
- onPayClick() 동작: 즉시 모달 → 결제 위젯 호출 (구현 시점에 추가)

## 구조

```
bamletter/
├── index.html              사용자 화면
├── package.json            의존성 (redis)
├── api/
│   ├── interpret.js        Anthropic API 호출
│   └── share/
│       ├── create.js       공유 링크 생성
│       └── get.js          공유 링크 조회
├── robots.txt
└── README.md
```

## 환경변수

| 변수명 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API 호출 |
| `REDIS_URL` | 공유 데이터 저장 (Vercel Storage 자동 설정) |

## 라우팅

- `https://bamletter.kr/` — 메인
- `https://bamletter.kr/?share=xxxxxxxx` — 공유받은 해몽
- `https://bamletter.kr/#admin` — 관리자 대시보드

## 베타 사용자 피드백

푸터의 "💌 베타 의견 보내기" 클릭 시 `qkrwoals92@naver.com` 으로 mailto.

## 비용

- Vercel: 무료
- Anthropic API: 1회 해몽 약 ₩70
- Redis: 무료 (30MB)
- 도메인: bamletter.kr (가비아)
