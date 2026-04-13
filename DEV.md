# 개발 환경 설정 가이드

## 사전 요구사항

- Ruby (>= 3.0)
- Bundler
- Netlify CLI (선택)

## 로컬 개발 서버 실행

```bash
bundle install
bundle exec jekyll serve
```

브라우저에서 `http://localhost:4000` 접속.

## 디렉토리 구조

```
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
├── docs/
│   ├── specs/          # 설계 문서
│   └── plans/          # 구현 계획
└── _site/              # 빌드 결과물 (gitignored)
```

## 빌드

```bash
bundle exec jekyll build
```

빌드 결과물은 `_site/`에 생성된다.

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

## Medium Draft 게시

마크다운 파일을 Medium에 draft 상태로 게시한다. 게시 후 Medium에서 직접 확인하고 publish 한다.

```bash
# Medium integration token 설정
export MEDIUM_TOKEN="your-token-here"

# draft 게시
python tools/publish_to_medium.py content/essays/memoir_devsisters.md --tags "career,retrospective"

# 미리보기 (API 호출 없이)
python tools/publish_to_medium.py content/essays/memoir_devsisters.md --dry-run
```

토큰 발급: Medium Settings > Security and apps > Integration tokens
