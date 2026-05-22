# 밤편지 — 꿈이 보낸 편지

한국 전통 해몽과 심리학적 분석을 결합한 AI 꿈 해몽 서비스.

## 🎁 베타 모드

현재 베타 기간으로 모든 해석이 무료로 제공됩니다.

### 정식 출시 시 결제 모드 전환

`index.html` 상단의 `const BETA_MODE = true;` → `false` 로 변경

자동 변경: BETA 배지 숨김, 페이월 카피, 피드백 링크 숨김

## 구조

```
bamletter/
├── index.html              메인 화면
├── package.json            의존성
├── manifest.json           PWA 매니페스트
├── og-image.png            카톡/SNS 미리보기 (1200x630)
├── favicon.svg/.png        브라우저 + 모바일 아이콘
├── apple-touch-icon.png    iOS 홈화면 아이콘
├── robots.txt
├── api/
│   ├── interpret.js
│   └── share/
│       ├── create.js
│       └── get.js
└── README.md
```

## 환경변수

- `ANTHROPIC_API_KEY` : Anthropic API
- `REDIS_URL` : Vercel Storage 자동 설정

## SEO & 공유

- Open Graph 태그 → 카톡, 페북, 라인 미리보기
- Twitter Card → X 미리보기
- Favicon → 브라우저/모바일
- PWA Manifest → 홈 화면 추가

**카톡 미리보기 캐시 우회**: 첫 공유 시 URL 뒤에 `?v=1` 추가

## 라우팅

- `/` 메인
- `/?share=xxx` 공유받은 해몽
- `/#admin` 관리자

## 피드백

푸터 "💌 베타 의견 보내기" → 구글 폼
