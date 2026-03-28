# Netlify Branch Preview 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `preview/*` 브랜치를 push하면 Netlify가 자동으로 Jekyll을 빌드하고 외부 접근 가능한 preview URL을 생성한다.

**Architecture:** 메인 사이트는 GitHub Pages가 계속 담당하고, Netlify는 `preview/*` 브랜치 전용 preview 호스팅으로만 사용한다. `netlify.toml`로 빌드 설정을 코드화하고, 브랜치 필터링은 Netlify UI에서 설정한다.

**Tech Stack:** Jekyll 4.3, Netlify (branch deploys), GitHub

---

## 파일 구조

| 파일 | 작업 | 설명 |
|------|------|------|
| `netlify.toml` | 신규 생성 (repo root) | Netlify 빌드 설정 코드화 |
| `README.md` | 수정 | Preview 워크플로우 및 fallback 문서 추가 |

---

### Task 1: `netlify.toml` 생성

**Files:**
- Create: `netlify.toml` (repo root, 즉 `.worktrees/setup-dev-env/netlify.toml`)

- [ ] **Step 1: `netlify.toml` 파일 생성**

  파일 내용:

  ```toml
  [build]
    base    = "docs"
    command = "jekyll build"
    publish = "docs/_site"
  ```

  - `base`: Netlify가 이 디렉토리 기준으로 빌드 실행
  - `command`: Jekyll 빌드 명령
  - `publish`: 빌드 결과물 경로 (repo root 기준)

- [ ] **Step 2: 로컬에서 빌드 확인**

  ```bash
  cd .worktrees/setup-dev-env/docs
  bundle exec jekyll build
  ```

  Expected: `docs/_site/` 디렉토리가 생성되고 HTML 파일들이 들어있음

  ```
  Configuration file: .../docs/_config.yml
                  Source: .../docs
             Destination: .../docs/_site
    Incremental build: disabled. Enable with --incremental
         Generating...
                          done in X.XXX seconds.
  ```

- [ ] **Step 3: `_site` gitignore 확인**

  ```bash
  cat .worktrees/setup-dev-env/docs/.gitignore 2>/dev/null || echo "(없음)"
  ```

  `_site/`가 없으면 `docs/.gitignore`에 추가:

  ```
  _site/
  .jekyll-cache/
  ```

  이미 `docs/_site/`는 루트 `.gitignore`에 있으므로 없어도 무방. 확인만 할 것.

- [ ] **Step 4: 커밋**

  ```bash
  cd .worktrees/setup-dev-env
  git add netlify.toml
  git commit -m "chore: Netlify 빌드 설정 추가 (netlify.toml)"
  ```

---

### Task 2: Netlify UI 설정 (수동)

**Files:** 없음 (웹 UI 작업)

Netlify 대시보드에서 순서대로 진행한다.

- [ ] **Step 1: GitHub 레포 연결**

  1. [app.netlify.com](https://app.netlify.com) 로그인
  2. "Add new site" → "Import an existing project"
  3. "Deploy with GitHub" 선택
  4. `chanheelee-dev/chanheelee-dev.github.io` 레포 선택

- [ ] **Step 2: 빌드 설정 확인**

  `netlify.toml`이 있으면 자동으로 감지된다. 화면에 표시된 값이 아래와 일치하는지 확인:

  | 항목 | 기대값 |
  |------|--------|
  | Base directory | `docs` |
  | Build command | `jekyll build` |
  | Publish directory | `docs/_site` |

  일치하면 "Deploy site" 클릭.

- [ ] **Step 3: Branch deploy 설정**

  Site overview → "Site configuration" → "Build & deploy" → "Continuous deployment" 이동.

  **"Branch deploys"** 섹션에서:
  - "Branch deploys" 드롭다운 → **"Custom branches and deploy previews"** 선택
  - "Allowed branches" 에 `preview/*` 입력 후 추가
  - 저장

  이 설정으로 `preview/`로 시작하는 브랜치만 배포된다.

- [ ] **Step 4: Production deploy 비활성화 (선택)**

  메인 사이트는 GitHub Pages를 사용하므로 Netlify production URL(`yoursite.netlify.app`)은 필요 없다.

  "Build & deploy" → "Continuous deployment" → **"Stop builds"** 버튼으로 production 빌드를 중단하거나, 그냥 두어도 무방 (URL이 존재하지만 링크가 없으므로 실질적으로 비공개).

---

### Task 3: Preview 브랜치 push 테스트

**Files:** 없음 (브랜치 작업)

- [ ] **Step 1: `setup/dev-env` 브랜치를 `preview/setup-dev-env`로 push**

  현재 `setup/dev-env` 브랜치를 그대로 `preview/` prefix 브랜치로 원격에 push:

  ```bash
  cd .worktrees/setup-dev-env
  git push origin setup/dev-env:preview/setup-dev-env
  ```

  또는 브랜치 자체를 rename하려면:

  ```bash
  git branch -m setup/dev-env preview/setup-dev-env
  git push origin preview/setup-dev-env
  ```

- [ ] **Step 2: Netlify 빌드 확인**

  Netlify 대시보드 → "Deploys" 탭에서 빌드가 시작됐는지 확인.

  약 1~2분 후 "Published" 상태가 되면 성공.

- [ ] **Step 3: Preview URL 접근 테스트**

  빌드 완료 후 Netlify 대시보드 → 해당 deploy 클릭 → URL 복사.

  URL 형태: `https://preview-setup-dev-env--yoursite.netlify.app` 또는 `https://deploy-preview-N--yoursite.netlify.app`

  - 데스크탑 브라우저에서 열어 사이트가 정상 렌더링되는지 확인
  - 모바일(별도 네트워크)에서 동일 URL 접근해 확인

- [ ] **Step 4: `preview/` prefix 없는 브랜치는 배포 안 되는지 확인**

  ```bash
  cd .worktrees/setup-dev-env
  git push origin setup/dev-env
  ```

  Netlify 대시보드에 해당 push에 대한 deploy가 생성되지 않아야 한다.

---

### Task 4: README 문서 업데이트

**Files:**
- Modify: `README.md` (repo root)

- [ ] **Step 1: README에 "브랜치 Preview" 섹션 추가**

  `## 로컬 개발 환경` 섹션 아래에 다음 섹션을 추가:

  ```markdown
  ## 브랜치 Preview (Netlify)

  개발 브랜치를 외부(모바일 등)에서 미리보기 위한 설정.

  ### 사용 방법

  1. 브랜치 이름을 `preview/` prefix로 push

     ```bash
     # 현재 브랜치를 preview 브랜치로 push
     git push origin <현재브랜치>:preview/<이름>

     # 예시
     git push origin feat/new-post:preview/new-post
     ```

  2. Netlify 대시보드에서 빌드 완료 확인 (약 1~2분)

  3. Netlify 대시보드 → 해당 deploy → URL로 접근

  > **규칙:** `preview/` prefix가 없는 브랜치는 Netlify에 배포되지 않는다.

  ### Fallback: 로컬 터널 (Netlify 미작동 시)

  ```bash
  # 1. 로컬 Jekyll 서버 실행
  cd docs && bundle exec jekyll serve

  # 2. ngrok으로 외부 접근 가능한 터널 생성
  ngrok http 4000
  ```

  ngrok이 출력하는 URL로 모바일 등 외부 네트워크에서 접근 가능하다.
  단, 노트북이 켜진 상태에서만 접근 가능하다는 제약이 있다.
  ```

- [ ] **Step 2: 커밋**

  ```bash
  cd .worktrees/setup-dev-env
  git add README.md
  git commit -m "docs: 브랜치 preview 워크플로우 및 fallback 문서 추가"
  ```
