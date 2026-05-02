# 개발 환경 설정 가이드

## 사전 요구사항

-   Ruby (>= 3.0)
-   Bundler
-   pre-commit (`brew install pre-commit` 또는 `uv tool install pre-commit`)
-   Netlify CLI (선택)

## 로컬 개발 서버 실행

```bash
bundle install
bundle exec jekyll serve
```

브라우저에서 `http://localhost:4000` 접속.

## 디렉토리 구조

```bash
.
├── _config.yml         # Jekyll 설정
├── Gemfile             # Ruby 의존성
├── netlify.toml        # Netlify 빌드 설정
├── .github/workflows/  # GitHub Actions 배포
├── README.md           # 방문자용 소개
├── DEV.md              # 이 파일
├── content/
│   ├── essays/         # 에세이 → URL: /essays/:name
│   └── projects/       # 프로젝트 → URL: /projects/:name
└── _site/              # 빌드 결과물 (gitignored)
```

## 빌드

```bash
bundle exec jekyll build
```

빌드 결과물은 `_site/`에 생성된다.

## Markdown 린팅

마크다운 파일은 [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)로 검사한다.
pre-commit hook이 commit 시점에 자동 실행한다 (격리된 Node 환경에서 동작).

### 최초 셋업 (clone 후 1회)

```bash
pre-commit install
```

### 수동 실행

```bash
# 전체 마크다운 린팅
pre-commit run --all-files

# 변경된 파일만 (commit 직전 자동 실행되는 것과 동일)
pre-commit run markdownlint-cli2
```

자동 수정(`--fix`)을 쓰려면 markdownlint-cli2 자체도 설치해야 한다 (선택):

```bash
brew install markdownlint-cli2
markdownlint-cli2 --fix "**/*.md"
```

### 룰 설정

`.markdownlint-cli2.jsonc`에서 관리한다. 들여쓰기는 [Google docguide 스타일](https://google.github.io/styleguide/docguide/style.html) 적용
(unordered list `-` 뒤 3칸, ordered list `1.` 뒤 2칸, nested 4칸).

주요 비활성/완화 항목:

-   `MD013` (line-length): 200자로 완화. 코드 블록·테이블은 검사 제외
-   `MD025` (single-h1): frontmatter title + 본문 H1 사용을 위해 OFF
-   `MD060` (table-column-style): 한글 폭 계산 부정확으로 OFF

룰 추가/조정은 [markdownlint 룰 문서](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) 참고.

## 브랜치 Preview (Netlify)

메인 사이트는 GitHub Pages(`https://chanheelee-dev.github.io`)가 담당하고,
Netlify는 `preview/*` 브랜치 전용 preview URL 생성에만 사용한다.

```bash
# 현재 브랜치를 preview 브랜치로 push
git push origin <현재브랜치>:preview/<이름>

# 예시
git push origin feat/new-post:preview/new-post
```

push 후 약 1~2분 내 Netlify가 빌드하여 고유 URL 생성. URL은 Netlify 대시보드에서 확인.

> `preview/` prefix가 없는 브랜치는 Netlify에 배포되지 않는다.

### Netlify CLI로 빌드 로그 확인

```bash
# 설치 (최초 1회)
npm install -g netlify-cli

# 인증 및 레포 연결 (최초 1회, repo root에서 실행)
netlify login
netlify link

# 빌드 로그 스트리밍
netlify logs:deploy
```

### Fallback: 로컬 터널 (Netlify 미작동 시)

```bash
bundle exec jekyll serve
ngrok http 4000
```

ngrok URL로 모바일 등 외부 네트워크에서 접근 가능. 단, 노트북이 켜져 있어야 한다.

## 수식 렌더링

MathJax를 사용한다. `_config.yml`에 설정되어 있으며, 마크다운에서 `$$...$$` 문법으로 수식을 작성한다.
