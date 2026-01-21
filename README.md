# chanheelee-dev.github.io

[https://chanheelee-dev.github.io](https://chanheelee-dev.github.io)

개인 블로그 문서 레포지토리. 나 개인을 설명할 수 있는 글을 위주로 작성한다. Medium에도 블로그를 작성하고 있는데 그 글들은 링크와 제목 정도를 언급한다.

## 작성 방법

참고: [github pages 사이트 만들기](https://docs.github.com/ko/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## 로컬 개발 환경

GitHub Pages를 로컬에서 미리보기 위한 설정.

### 사전 요구사항

- Ruby 설치 필요 (macOS: `brew install ruby`)

### 설정 방법

1. 의존성 설치

   ```bash
   cd docs
   bundle install
   ```

   Bundler(Ruby의 패키지 관리자)를 통해 Gemfile에 정의된 의존성을 설치한다.

1. 로컬 서버 실행

   ```bash
   bundle exec jekyll serve
   ```

1. <http://localhost:4000> 에서 확인

### 주요 파일 설명

- `docs/Gemfile`: Jekyll 및 GitHub Pages 의존성 정의
- `docs/_config.yml`: Jekyll 설정 (마크다운 엔진, 수식 렌더링 등)
- `docs/_includes/head-custom.html`: MathJax 스크립트 (LaTeX 수식 렌더링용)

## 블로그 채널 전략

여기 github 블로그와 medium 블로그, 각각 어떤 글이 어울릴지 고민해본다.

- github: 나 개인을 설명하기 위한 기록들
  - 기술적인 프로젝트 포트폴리오
  - 실용적으로 참고 가능한 글
  - Builder 로서의 정체성
- medium: 많은 사람한테 읽힐 수 있는 흥미 위주의 글
  - 인사이트 위주의 글
  - 문제의식이나 새로운 아이디어
  - Thinker 로서의 정체성
  - 뷰어 관련 데이터를 보고 싶을 때
