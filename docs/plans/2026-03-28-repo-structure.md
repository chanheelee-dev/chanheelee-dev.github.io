# 레포지토리 구조 개선 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 콘텐츠 파일을 `content/essays/`, `content/projects/`로 분리하고, 개발 문서를 `docs/`로 이동하여 직관적인 레포 구조를 만든다.

**Architecture:** `git mv`로 파일 이동(히스토리 보존), `_config.yml` permalink defaults로 URL에서 `content/` prefix 제거, `DEV.md` 구조 섹션 업데이트.

**Tech Stack:** Jekyll 4.x, YAML, git

---

## 파일 구조

| 파일 | 작업 |
|------|------|
| `content/essays/memoir_devsisters.md` | 신규 위치 (이동) |
| `content/essays/memoir_devsisters_00.png` | 신규 위치 (이동) |
| `content/projects/ltv.md` | 신규 위치 (이동) |
| `content/projects/ltv_stg_1.md` | 신규 위치 (이동) |
| `content/projects/ltv_modeling_mcmc.md` | 신규 위치 (이동) |
| `content/projects/cookiewiki.md` | 신규 위치 (이동) |
| `content/projects/llm_translation.md` | 신규 위치 (이동) |
| `content/projects/llm_translation_stg_1.md` | 신규 위치 (이동) |
| `content/projects/llm_translation_stg_2.md` | 신규 위치 (이동) |
| `docs/specs/` | 신규 위치 (specs/ 이동) |
| `docs/plans/` | 신규 위치 (plans/ 이동) |
| `_config.yml` | permalink defaults 추가, exclude 업데이트 |
| `DEV.md` | 디렉토리 구조 섹션 업데이트 |

---

### Task 1: 콘텐츠 파일 이동

**Files:**
- Create dirs: `content/essays/`, `content/projects/`
- Move: 8개 `.md` 파일 + 1개 `.png` 파일

- [ ] **Step 1: 디렉토리 생성 및 essays 파일 이동**

```bash
cd /Users/coder/proj/chanheelee-dev.github.io/.worktrees/setup-dev-env
mkdir -p content/essays content/projects
git mv memoir_devsisters.md content/essays/memoir_devsisters.md
git mv memoir_devsisters_00.png content/essays/memoir_devsisters_00.png
```

- [ ] **Step 2: projects 파일 이동 (proj_ prefix 제거)**

```bash
git mv proj_ltv.md content/projects/ltv.md
git mv proj_ltv_stg_1.md content/projects/ltv_stg_1.md
git mv ltv_modeling_mcmc.md content/projects/ltv_modeling_mcmc.md
git mv proj_cookiewiki.md content/projects/cookiewiki.md
git mv proj_llm_translation.md content/projects/llm_translation.md
git mv proj_llm_translation_stg_1.md content/projects/llm_translation_stg_1.md
git mv proj_llm_translation_stg_2.md content/projects/llm_translation_stg_2.md
```

- [ ] **Step 3: 이동 결과 확인**

```bash
ls content/essays/
ls content/projects/
```

Expected:
```
content/essays/: memoir_devsisters.md  memoir_devsisters_00.png
content/projects/: ltv.md  ltv_stg_1.md  ltv_modeling_mcmc.md  cookiewiki.md  llm_translation.md  llm_translation_stg_1.md  llm_translation_stg_2.md
```

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: 콘텐츠 파일을 content/essays/, content/projects/로 이동"
```

---

### Task 2: specs/plans를 docs/로 이동

**Files:**
- Move: `specs/` → `docs/specs/` (기존 파일 병합)
- Move: `plans/` → `docs/plans/` (기존 파일 병합)

현재 상태:
- `specs/2026-03-28-netlify-preview-design.md` — root에 있는 이전 스펙
- `plans/2026-03-28-netlify-preview.md` — root에 있는 이전 플랜
- `docs/specs/2026-03-28-repo-structure-design.md` — 이미 이동된 새 스펙

- [ ] **Step 1: specs 파일 이동**

```bash
git mv specs/2026-03-28-netlify-preview-design.md docs/specs/2026-03-28-netlify-preview-design.md
```

- [ ] **Step 2: plans 파일 이동**

```bash
git mv plans/2026-03-28-netlify-preview.md docs/plans/2026-03-28-netlify-preview.md
```

- [ ] **Step 3: 빈 디렉토리 제거 확인**

```bash
ls specs/ 2>/dev/null || echo "specs/ 비어있음"
ls plans/ 2>/dev/null || echo "plans/ 비어있음"
```

Expected: 두 디렉토리 모두 비어있음

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: specs/plans를 docs/ 아래로 이동"
```

---

### Task 3: `_config.yml` 업데이트

**Files:**
- Modify: `_config.yml`

현재 `_config.yml`:
```yaml
theme: jekyll-theme-primer
title: Chanhee's Dev Blog

defaults:
  - scope:
      path: ""
    values:
      layout: default

kramdown:
  math_engine: mathjax

exclude:
  - README.md
  - DEV.md
  - netlify.toml
  - specs/
  - plans/
  - .worktrees/
  - Gemfile
  - Gemfile.lock
```

- [ ] **Step 1: `_config.yml` 전체 교체**

```yaml
theme: jekyll-theme-primer
title: Chanhee's Dev Blog

defaults:
  - scope:
      path: ""
    values:
      layout: default
  - scope:
      path: "content/essays"
    values:
      permalink: /essays/:basename
  - scope:
      path: "content/projects"
    values:
      permalink: /projects/:basename

kramdown:
  math_engine: mathjax

exclude:
  - README.md
  - DEV.md
  - netlify.toml
  - docs/
  - .worktrees/
  - Gemfile
  - Gemfile.lock
```

- [ ] **Step 2: Jekyll 빌드로 검증**

```bash
cd /Users/coder/proj/chanheelee-dev.github.io/.worktrees/setup-dev-env
bundle exec jekyll build
```

Expected: 빌드 성공 및 `_site/` 생성

- [ ] **Step 3: URL 구조 확인**

```bash
ls _site/
ls _site/essays/ 2>/dev/null || echo "essays/ 없음"
ls _site/projects/ 2>/dev/null || echo "projects/ 없음"
```

Expected:
```
_site/essays/: memoir_devsisters.html
_site/projects/: ltv.html  ltv_stg_1.html  ...
```

- [ ] **Step 4: `docs/` 가 빌드에서 제외됐는지 확인**

```bash
ls _site/docs/ 2>/dev/null && echo "문제: docs/ 가 빌드됨" || echo "정상: docs/ 빌드 제외"
ls _site/specs/ 2>/dev/null && echo "문제: specs/ 가 빌드됨" || echo "정상: specs/ 빌드 제외"
```

Expected: 두 줄 모두 "정상" 출력

- [ ] **Step 5: 커밋**

```bash
git add _config.yml
git commit -m "feat: _config.yml permalink/exclude 업데이트"
```

---

### Task 4: `DEV.md` 업데이트

**Files:**
- Modify: `DEV.md`

- [ ] **Step 1: DEV.md 디렉토리 구조 섹션 교체**

현재 `## 디렉토리 구조` 섹션을 아래로 교체:

```markdown
## 디렉토리 구조

```
.
├── _config.yml         # Jekyll 설정
├── Gemfile             # Ruby 의존성
├── netlify.toml        # Netlify 빌드 설정
├── .github/workflows/  # GitHub Actions 배포
├── README.md           # 방문자용 소개
├── DEV.md              # 이 파일
├── index.md            # 블로그 홈
├── content/
│   ├── essays/         # 에세이 → URL: /essays/:name
│   └── projects/       # 프로젝트 → URL: /projects/:name
├── docs/
│   ├── specs/          # 설계 문서
│   └── plans/          # 구현 계획
└── _site/              # 빌드 결과물 (gitignored)
```
```

- [ ] **Step 2: 로컬 개발 서버 실행 커맨드 수정**

현재:
```bash
cd docs
bundle install
bundle exec jekyll serve
```

교체:
```bash
bundle install
bundle exec jekyll serve
```

빌드 섹션도 동일하게 `cd docs` 제거:

현재:
```bash
cd docs
bundle exec jekyll build
```

교체:
```bash
bundle exec jekyll build
```

빌드 결과물 설명도 수정:

현재: `빌드 결과물은 docs/_site/에 생성된다.`
교체: `빌드 결과물은 _site/에 생성된다.`

Fallback 섹션도 수정:

현재: `cd docs && bundle exec jekyll serve`
교체: `bundle exec jekyll serve`

- [ ] **Step 3: 커밋**

```bash
git add DEV.md
git commit -m "docs: DEV.md 구조 및 커맨드 업데이트"
```
