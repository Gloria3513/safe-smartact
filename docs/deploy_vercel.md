# Vercel 배포 + 두 도메인 연결 가이드

**목표:**
- 메인: `https://stopcall.kr`
- 보조(리다이렉트): `https://www.stopcall.kr`, `https://safe.smartact.kr` → 모두 stopcall.kr로

**전제:** 두 도메인 모두 Cloudflare에서 DNS 관리. Vercel 계정 보유. Git/GitHub CLI 설치됨.

---

## 0단계. 사전 확인 (1분)

```bash
# 네임서버 확인 — 두 줄 모두 cloudflare.com 나와야 함
dig smartact.kr NS +short
dig stopcall.kr NS +short
```

`stopcall.kr`이 아직 Cloudflare에 등록 안 됐다면:
1. Cloudflare 대시보드 → `Add a Site` → `stopcall.kr`
2. Free 플랜 → Continue
3. 안내받은 네임서버 2개를 도메인 구입처(가비아 등)에서 교체
4. "Active" 될 때까지 30분~몇 시간 대기

---

## 1단계. Git 초기화 + GitHub 푸시 (2분)

```bash
cd ~/safe-smartact
git init
git add .
git commit -m "Initial MVP1: 멈춤연습 홈+검찰사칭 시나리오"

# gh CLI 사용 시 (가장 빠름)
gh repo create safe-smartact --public --source=. --push

# 또는 수동
# github.com에서 빈 리포 safe-smartact 생성 후
git remote add origin https://github.com/<계정>/safe-smartact.git
git branch -M main
git push -u origin main
```

> 이름은 `safe-smartact`로 유지(스마택트 우산 내부 이름). 대외 브랜드는 별개로 `stopcall.kr`.

---

## 2단계. Vercel에 배포 (2분)

1. https://vercel.com/new 접속
2. `Import Git Repository` → `safe-smartact` 선택
3. 설정:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build Command:** *비워둠*
   - **Output Directory:** *비워둠*
4. **Deploy** 클릭
5. 10초 뒤 `safe-smartact.vercel.app` 생성 → 접속 확인

---

## 3단계. 세 도메인 모두 추가 (3분)

Vercel 프로젝트 → **Settings** → **Domains**.

### 3-1. stopcall.kr (메인)
1. 입력칸에 `stopcall.kr` → Add
2. 추가 후 오른쪽 메뉴에서 **"Set as Primary"** 선택
3. Vercel이 DNS 레코드 안내 표시:
   ```
   A    @    76.76.21.21
   ```

### 3-2. www.stopcall.kr
1. 입력칸에 `www.stopcall.kr` → Add
2. Vercel이 자동으로 "Redirect to stopcall.kr"로 설정 제안 → 승인
3. DNS 레코드 안내:
   ```
   CNAME    www    cname.vercel-dns.com
   ```

### 3-3. safe.smartact.kr (보조, 리다이렉트)
1. 입력칸에 `safe.smartact.kr` → Add
2. **"Redirect to"** 선택 → `stopcall.kr` 지정 (301)
3. DNS 레코드 안내:
   ```
   CNAME    safe    cname.vercel-dns.com
   ```

---

## 4단계. Cloudflare DNS에 레코드 입력 (3분)

### 4-1. stopcall.kr 사이트의 DNS 탭
```
유형: A       이름: @       값: 76.76.21.21              프록시: DNS only ⚠️
유형: CNAME   이름: www     값: cname.vercel-dns.com     프록시: DNS only ⚠️
```

### 4-2. smartact.kr 사이트의 DNS 탭
```
유형: CNAME   이름: safe    값: cname.vercel-dns.com     프록시: DNS only ⚠️
```

> ⚠️ **"DNS only" (회색 구름) 필수.** 주황 구름(Proxied)으로 두면 Vercel HTTPS 인증서 발급이 꼬입니다. Vercel이 자체 HTTPS(Let's Encrypt)를 발급하므로 Cloudflare 프록시는 꺼두세요.

---

## 5단계. 확인 (3–10분 대기)

```bash
dig stopcall.kr +short
# → 76.76.21.21

dig www.stopcall.kr +short
# → cname.vercel-dns.com.

dig safe.smartact.kr +short
# → cname.vercel-dns.com.
```

Vercel 대시보드 Domains 탭에서 세 도메인 모두 **초록색 체크** 확인.

브라우저 테스트:
- `https://stopcall.kr` → 멈춤연습 홈 (정상)
- `https://www.stopcall.kr` → stopcall.kr로 자동 리다이렉트
- `https://safe.smartact.kr` → stopcall.kr로 자동 리다이렉트

---

## 6단계. 이후 수정 플로우

```bash
# 수정 후
git add .
git commit -m "2장 스미싱 시나리오 추가"
git push

# Vercel이 30초 뒤 자동 재배포
# stopcall.kr에 즉시 반영
```

PR을 만들면 **프리뷰 URL**(`safe-smartact-git-feat-xxx.vercel.app`)이 자동 생성되어 메인에 머지하기 전에 기관·지인에게 시연할 수 있습니다.

---

## 자주 막히는 지점

| 증상 | 원인 | 해결 |
|---|---|---|
| "Invalid Configuration" on Domains | DNS 미전파 | 5–10분 더 대기 |
| HTTPS 에러 (ERR_SSL) | Cloudflare 주황 구름 켜짐 | DNS only로 전환 |
| `www`가 안 뜸 | CNAME 누락 | 4-1 확인 |
| `safe.smartact.kr`이 엉뚱한 곳으로 | 이전 레코드 잔존 | Cloudflare DNS에서 기존 `safe` 레코드 삭제 후 재생성 |
| Vercel에서 "domain taken" | 다른 Vercel 프로젝트에 연결됨 | 그 프로젝트에서 먼저 해제 |

---

## 배포 완료 후 할 일

- [ ] QR코드 생성 (`https://stopcall.kr`)
- [ ] 활동북·제안서에 QR 삽입
- [ ] 시연 영상 1분 녹화 (⌘+Shift+5)
- [ ] 공공기관 2–3곳에 제안 이메일 발송
- [ ] 메모리콕 하단에 "시니어 사이버안전 연습하기 → stopcall.kr" 작은 링크 하나 (약한 고리)
