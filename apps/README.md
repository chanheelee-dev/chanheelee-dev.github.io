# apps/

GitHub Pages에서 서빙되는 작은 정적 웹앱들을 모아두는 디렉토리.

## Jekyll 동작

`_config.yml`의 `defaults`에서 `apps` scope가 `layout: null`로 설정되어 있다.
- `apps/` 이하의 모든 파일은 Jekyll 기본 레이아웃(primer 테마의 `markdown-body`
  컨테이너, `_includes/nav.html` 등)에 **감싸이지 않는다**.
- 각 앱은 자기 `<!doctype html>`부터 끝까지 직접 작성한다. 블로그 공통 헤더/푸터가
  필요하다면 앱 내부에 직접 써 넣는다.
- `.html` 파일은 원본 그대로 서빙되고, `.md` 파일(이 README 포함)은 변환되지만
  레이아웃 없이 본문만 렌더된다.

## 새 앱 추가 절차

1. `apps/<slug>/` 디렉토리를 만든다.
2. `apps/<slug>/index.html`에 스탠드얼론 HTML을 작성한다 (외부 의존성은 가능하면
   `apps/<slug>/vendor/`에 커밋해 오프라인 완결을 유지).
3. `apps/index.html` 목록에 새 앱 링크를 추가한다.
4. 상단 네비게이션의 `/apps/` 링크는 `_includes/nav.html`에 이미 노출되어 있으므로
   별도 변경 불필요.

## 현재 앱

- [`sql-practice/`](sql-practice/) — 브라우저 내 SQLite(WASM)로 CSV를 테이블화해
  SQL 쿼리를 연습하는 앱. 자세한 내용은 해당 디렉토리의 README 참고.
