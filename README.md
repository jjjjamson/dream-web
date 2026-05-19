# 밤편지 — 꿈이 보낸 편지

한국 전통 해몽과 심리학적 분석을 결합한 AI 꿈 해몽 서비스.

## 구조

```
bamletter/
├── index.html              사용자 화면
├── package.json            의존성 (redis)
├── api/
│   ├── interpret.js        Anthropic API 호출
│   └── share/
│       ├── create.js       공유 링크 생성 (POST)
│       └── get.js          공유 링크 조회 (GET)
├── robots.txt
└── README.md
```

## 환경변수

| 변수명 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API 호출 |
| `REDIS_URL` | 공유 데이터 저장 (Vercel Storage가 자동 설정) |

## 공유 시스템

- 짧은 8자리 ID로 URL 생성: `https://bamletter.com/?share=abc12345`
- Redis에 90일 만료로 저장
- 결제 전 공개 부분만 저장 (심층 해석/위로/행운 제외)

## 라우팅

- `/` — 메인 (내 꿈 해몽)
- `/?share=xxxxx` — 공유받은 해몽
- `/#admin` — 관리자 대시보드

## 자리표시자

GitHub에서 `index.html` 일괄 찾기/바꾸기:
- `[(주)○○○○]`, `[대표자명]`, `[000-00-00000]`
- `[제0000-○○-0000호]`, `[주소]`, `[00-0000-0000]`
- `[contact@example.com]` (3곳)
- `[보호책임자명]`, `[직책]`, `[관할 법원]`

## 비용

- Vercel: 무료
- Anthropic API: 1회 해몽 약 ₩70
- Redis: 무료 (30MB)
