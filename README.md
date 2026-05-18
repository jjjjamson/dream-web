# 밤편지 — 꿈이 보낸 편지

한국 전통 해몽과 심리학적 분석을 결합한 AI 꿈 해몽 서비스.

## 구조

```
bamletter/
├── index.html         사용자 화면 (홈, 샘플, 관리자, 정책 4개 페이지)
├── api/
│   └── interpret.js   Anthropic API 호출 백엔드 함수
├── robots.txt         검색엔진 색인 정책
└── README.md
```

## 환경변수 (Vercel Settings → Environment Variables)

- `ANTHROPIC_API_KEY` : Anthropic Console에서 발급받은 키 (sk-ant-로 시작)

(v8 Part 2 추가 예정)
- `TOSS_CLIENT_KEY` : 토스페이먼츠 결제위젯 클라이언트 키
- `TOSS_SECRET_KEY` : 토스페이먼츠 시크릿 키 (서버 측에서만 사용)
- `KV_REST_API_URL` : Vercel KV URL (공유 링크 데이터 저장)
- `KV_REST_API_TOKEN` : Vercel KV 토큰

## 정책 페이지 회사 정보 입력 위치

배포 후 GitHub에서 `index.html` 열고 다음을 일괄 찾기/바꾸기:

| 찾을 텍스트 | 변경할 내용 |
|---|---|
| `[(주)○○○○]` | 회사 정식 상호 |
| `[대표자명]` | 대표자 이름 |
| `[000-00-00000]` | 사업자등록번호 |
| `[제0000-○○-0000호]` | 통신판매업 신고번호 |
| `[주소]` | 사업장 주소 |
| `[00-0000-0000]` | 대표 전화번호 |
| `[contact@example.com]` | 대표 이메일 (3곳에 모두 변경) |
| `[보호책임자명]` | 개인정보 보호책임자 이름 |
| `[직책]` | 보호책임자 직책 |
| `[관할 법원]` | 분쟁 시 관할 법원 (예: 서울중앙지방법원) |

## 페이지 라우팅

- `/` — 메인 (내 꿈 해몽)
- `/#admin` — 관리자 대시보드
- 정책 4개는 SPA 내 페이지 전환으로 동작 (별도 URL 없음)

## 비용

- Vercel: 무료 (Hobby 플랜)
- Anthropic API: 1회 해몽 약 ₩70
- 도메인: 별도 (예: 가비아 연 ₩15,000~)

## 향후 작업 (v8 Part 2)

- 공유 링크 시스템 (Vercel KV 연동)
- 이미지 저장 개선
- 토스페이먼츠 테스트 결제 연동
