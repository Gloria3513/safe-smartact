# PWA → Play Store 등록 가이드

> 멈춤연습을 안드로이드 앱으로 출시하기 위한 단계별 매뉴얼.
> 이 문서대로 따라하면 1~2시간 안에 Play Console에 업로드까지 가능합니다.

---

## 0. 사전 준비 (이미 끝남)

- ✅ HTTPS 도메인 (stopcall.kr)
- ✅ Google Play Console 개발자 등록비 $25 결제
- ✅ 사이트가 모바일 친화적 (반응형 + 큰 폰트)

## 1. 아이콘 생성 (5분)

브라우저에서 아이콘 생성기를 열고 다운로드.

```
https://stopcall.kr/assets/generate_icons.html
```

또는 로컬에서:
```bash
open ~/safe-smartact/assets/generate_icons.html
```

**"3개 PNG 다운로드"** 클릭 → 다운로드 폴더에서 3개 파일을 `safe-smartact/assets/`로 이동:

```
icon-192.png
icon-512.png
icon-512-maskable.png
```

이후 git에 추가:
```bash
cd ~/safe-smartact
git add assets/icon-*.png
git commit -m "아이콘 PNG 추가"
git push
```

## 2. PWA 작동 확인 (5분)

배포 1~2분 후 안드로이드 크롬에서 https://stopcall.kr 열기:

- 주소창 우측에 **"앱 설치"** 또는 **"홈 화면에 추가"** 메뉴가 떠야 함
- 떠 있다면 PWA 통과 ✅
- 안 뜨면 chrome://inspect 에서 manifest 검증

## 3. TWA로 래핑 — PWABuilder.com (가장 쉬움)

브라우저에서:

```
https://www.pwabuilder.com
```

1. `https://stopcall.kr` 입력
2. **Score 확인** (90점 이상 권장)
3. **"Package for Stores"** → **Android** 선택
4. 옵션 입력:
   - Package ID: `kr.stopcall.app`
   - App name: `멈춤연습`
   - Launcher name: `멈춤연습`
   - Theme color: `#1a1a1a`
   - Background color: `#f7f4ee`
   - Display mode: `standalone`
   - Signing key: **"Create new"** 선택 (PWABuilder가 자동 생성)
5. **"Generate"** → ZIP 다운로드

ZIP 안에 들어 있는 것:
- `app-release-bundle.aab` ← Play Console에 올릴 파일
- `signing.keystore` + `signing-key-info.txt` ← **반드시 보관!** (분실 시 앱 업데이트 불가)
- `assetlinks.json` ← `.well-known/`에 호스팅할 파일

## 4. assetlinks.json 교체 (10분)

PWABuilder가 준 `assetlinks.json`을 열어보면 SHA-256 fingerprint가 들어 있습니다. 그 내용을 `.well-known/assetlinks.json`에 **그대로 덮어쓰기**:

```bash
cp ~/Downloads/멈춤연습-PWABuilder/assetlinks.json \
   ~/safe-smartact/.well-known/assetlinks.json
cd ~/safe-smartact && git add .well-known/assetlinks.json
git commit -m "Play 앱 SHA256 fingerprint 등록"
git push
```

배포 후 확인:
```bash
curl -s https://stopcall.kr/.well-known/assetlinks.json | head
```

## 5. Play Console 업로드

1. https://play.google.com/console 접속
2. **"앱 만들기"** → 이름 `멈춤연습`, 한국어 기본
3. 좌측 메뉴 **"프로덕션"** → **"새 버전 만들기"**
4. `app-release-bundle.aab` 업로드
5. **출시 노트** 작성 (한국어):
   ```
   1.0.0
   - 멈춤 5초 학습
   - 사기 시뮬레이터 (전화·문자·카톡)
   - 활동북 9장 수록
   ```

## 6. 스토어 등록 정보 (Play Console)

### 앱 이름·설명
- **앱 이름**: `멈춤연습 - 시니어 사이버안전`
- **간단한 설명** (80자):
  ```
  5초가 평생을 지킵니다. 보이스피싱·딥페이크 대비 시니어 사이버안전 교육앱.
  ```
- **자세한 설명**:
  ```
  멈춤연습은 만 60세 이상 시니어를 위한 사이버안전 교육 서비스입니다.

  ◼ 멈춤 5초 루틴
  멈춰·의심·확인·끊고·알려 — 손가락 5개로 외우는 사기 대응법.

  ◼ 사기 시뮬레이터
  검찰 사칭 전화, 택배 스미싱, "엄마 나야" 카톡까지 안전한 환경에서 직접 체험.

  ◼ 활동북 9장
  보이스피싱 / 스미싱 / 메신저피싱 / 로맨스스캠 / AI 음성복제 /
  딥페이크 영상통화 / 코인 투자 사기 / 홈쇼핑 과장광고 / 가짜 정부지원금

  ◼ 가족과 함께
  본인확인 암호 만들기, 가족 알림 카드, 멈춤 일기로 일상 학습.

  복지관·경로당·평생교육원 강의에도 활용 가능합니다.
  스마택트 · 디지털포용법 기반 시니어 사이버안전 교육.
  ```

### 카테고리·연령 등급
- **카테고리**: 교육
- **연령 등급**: 전체이용가
- **광고**: 없음
- **앱 콘텐츠**: 교육

### 그래픽 자산 (Play Console 필수)
| 항목 | 사이즈 | 어디서? |
|---|---|---|
| 앱 아이콘 | 512×512 PNG | `assets/icon-512.png` |
| 피처 그래픽 | 1024×500 PNG | 별도 디자인 (Figma) |
| 스크린샷 | 1080×1920 (최소 2장) | 안드로이드에서 PWA 캡처 |

### 개인정보 처리방침
필수 — 한 페이지 호스팅:
```
https://stopcall.kr/privacy.html
```
(아직 없음 — 다음 작업으로 추가 가능)

## 7. 심사 → 출시

- 첫 심사: 1~3일
- 통과되면 자동으로 Play Store에 노출
- 검색: "멈춤연습", "보이스피싱 예방", "시니어 사이버안전"

## 8. 업데이트 정책 (가장 중요)

### 콘텐츠 업데이트 (앱 빌드 불필요)

활동북 추가, 카피 수정, 디자인 변경 등 — **그냥 git push**:

```bash
git push  # 사이트 배포 → 사용자가 다음 앱 실행 시 즉시 반영
```

Service worker가 새 콘텐츠를 자동으로 가져옵니다. Play Store 심사 ❌

### 앱 자체 업데이트 (Play 심사 필요)

다음의 경우만 새 .aab 빌드 + Play Console 업로드:
- 앱 이름·아이콘·테마컬러 변경
- 권한 추가 (카메라·위치·알림 등)
- 안드로이드 SDK 버전 업그레이드 (연 1회 정도)
- 패키지 ID 변경 (절대 권장 안 함)

새 빌드:
```bash
# PWABuilder.com 다시 가서 동일 패키지명으로 재생성
# 단, 이전 signing.keystore 파일을 반드시 사용 (분실 금지!)
```

## 9. 자주 발생하는 함정

### ⚠️ 1. signing.keystore 분실
- 분실하면 **앱 업데이트가 영원히 불가**
- → Google Drive·1Password·USB 등 3중 백업 필수

### ⚠️ 2. assetlinks.json 미적용
- 안 들어가 있으면 앱 상단에 브라우저 URL바가 뜸
- → PWABuilder가 준 fingerprint 그대로 호스팅 + 배포 확인

### ⚠️ 3. iOS는 별도
- Apple App Store는 TWA를 받지 않음
- iOS는 Safari "홈 화면에 추가"로 PWA 설치 (별도 작업 불필요)

### ⚠️ 4. 푸시 알림
- TWA에서 푸시 가능하나 Web Push 별도 구현 필요
- 1.0에서는 빼고, 1.1에서 도입 권장

---

## 체크리스트

- [ ] icon-192.png / icon-512.png / icon-512-maskable.png 업로드
- [ ] 안드로이드 크롬에서 "앱 설치" 메뉴 노출 확인
- [ ] PWABuilder에서 .aab 생성 + signing.keystore 백업
- [ ] assetlinks.json에 실제 SHA256 교체 + 배포
- [ ] Play Console 앱 생성 + .aab 업로드
- [ ] 앱 설명·아이콘·스크린샷·피처 그래픽 등록
- [ ] privacy.html 작성 + 등록
- [ ] 심사 제출 → 1~3일 대기 → 출시

---

ⓒ 스마택트 · stopcall.kr
