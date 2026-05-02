# sql-practice

브라우저에서 돌아가는 SQL 연습 앱. CSV를 업로드해 인메모리 SQLite(WASM)에
테이블로 올리고 SQL 쿼리를 실행한다. **데이터는 서버로 전송되지 않는다** —
업로드한 CSV와 생성된 DB는 모두 브라우저 메모리에 머물며 새로고침 시 사라진다.

원본은 `github.com/chanheelee-dev/blog-with-code`의 Streamlit 앱이었고,
현 블로그 레포에 통합하기 위해 GitHub Pages 정적 호스팅이 가능한 클라이언트 사이드 앱으로 포팅했다.

## URL
- 배포: <https://chanheelee-dev.github.io/apps/sql-practice/>
- 앱 목록: <https://chanheelee-dev.github.io/apps/>

## 파일 구조

```
sql-practice/
  index.html        앱 셸 (vendor 스크립트 로드 + DOM 구조)
  style.css         라이트/다크 테마 스타일
  app.js            CSV 파싱 · 테이블 생성 · 쿼리 실행 · 결과 렌더 로직
  vendor/           오프라인 완결을 위해 커밋된 서드파티 라이브러리
    sql-wasm.js     sql.js 1.10.3 로더
    sql-wasm.wasm   sql.js 1.10.3 SQLite WASM 바이너리 (~640KB)
    papaparse.min.js PapaParse 5.4.1 (CSV 파서)
```

## 아키텍처 메모

- **엔진 부트스트랩**: `initSqlJs({ locateFile: () => 'vendor/sql-wasm.wasm' })`로
  상대 경로의 wasm을 로드한다. GitHub Pages 기본 도메인과 커스텀 도메인 모두에서
  동작하도록 절대 경로 대신 상대 경로를 사용한다.
- **DB 수명**: 단일 인메모리 `SQL.Database()` 인스턴스. 페이지 세션을 넘어가지
  않는다 — 탭을 닫거나 새로고침하면 모든 데이터가 사라진다. 파일/IndexedDB 등
  어디에도 저장하지 않는다.
- **타입 추론**: CSV 컬럼마다 값을 스캔해 정수→`INTEGER`, 실수→`REAL`, 그 외
  `TEXT`. 빈 값은 `NULL`로 삽입.
- **식별자 인용**: 헤더에 공백/특수문자가 있어도 `"..."`로 인용해 그대로 사용.
  중복 헤더는 `_1`, `_2` 접미사로 구분.
- **결과 표시 한도**: 쿼리 결과는 DOM 비용 때문에 최대 100행만 렌더한다.
  "결과 CSV 다운로드" 버튼은 **전체 행**을 내려받는다.
- **에러 처리**: 파싱/쿼리 실패 메시지는 각 섹션 하단 `.msg.error`에 표시.
  `INSERT`는 트랜잭션으로 묶고 실패 시 `ROLLBACK`.

## 로컬 확인

전체 블로그와 함께 띄우는 편이 가장 현실에 가깝다:

```sh
bundle exec jekyll serve
# → http://localhost:4000/apps/sql-practice/
```

간단한 수동 확인이라면 `apps/sql-practice/index.html`을 정적 서버로 서빙해도
동작한다 (단 `file://` 프로토콜에서는 WASM 로드가 막히므로 반드시 HTTP 서버):

```sh
python3 -m http.server --directory apps/sql-practice 8000
# → http://localhost:8000/
```

### 점검 체크리스트
- 상단 상태 배너가 "SQLite(WASM) 준비 완료"로 바뀐다.
- CSV 업로드 시 "CSV 파싱 완료: N행 · M열" 메시지 + 미리보기 10행.
- "테이블 생성" 클릭 후 테이블 목록에 행 수/스키마가 뜬다.
- 기본 자동 채움 쿼리(`SELECT * FROM "<table>" LIMIT 10;`) 실행 → 결과 표.
- "결과 CSV 다운로드" → 전체 행이 담긴 `query_result.csv` 저장.
- Devtools Network 탭에서 외부 호스트 요청이 없고 vendor 파일만 200으로 로드.
- 모바일 뷰포트에서 결과 테이블이 가로 스크롤된다.

## vendor 라이브러리 갱신

npm 레지스트리에서 탈볼을 받아 필요한 파일만 추출한다 (cdnjs/jsdelivr이 막힌
환경에서도 동작).

```sh
cd apps/sql-practice/vendor

# sql.js
curl -sSL -o sql.js.tgz https://registry.npmjs.org/sql.js/-/sql.js-<version>.tgz
tar -xzf sql.js.tgz --strip-components=2 package/dist/sql-wasm.js package/dist/sql-wasm.wasm
rm sql.js.tgz

# PapaParse
curl -sSL -o papaparse.tgz https://registry.npmjs.org/papaparse/-/papaparse-<version>.tgz
tar -xzf papaparse.tgz --strip-components=1 package/papaparse.min.js
rm papaparse.tgz
```

갱신 후 이 README의 버전 주석, 그리고 `index.html` 주석이 있다면 맞춰 수정한다.

## 원본 Streamlit 앱과의 차이

| 항목 | Streamlit 원본 | 웹앱 포팅 |
| --- | --- | --- |
| 실행 환경 | Python 서버 필요 | 브라우저만 있으면 됨 |
| DB 저장 | `data/<db>.db` 파일 | 인메모리, 탭 닫으면 소멸 |
| 다중 DB | `db_name` 드롭다운 | 단일 DB (여러 테이블 허용) |
| 타입 추론 | pandas `to_sql` | 간단한 정규식 스캔 |
| 결과 다운로드 | `st.download_button` | Blob + `<a download>` |

## 관련
- 이슈: [#5](https://github.com/chanheelee-dev/chanheelee-dev.github.io/issues/5)
- 선행 설정 PR: [#8](https://github.com/chanheelee-dev/chanheelee-dev.github.io/pull/8)
  (`apps` scope에 `layout: null` 지정)
- 상위 디렉토리 규칙: [`../README.md`](../README.md)
