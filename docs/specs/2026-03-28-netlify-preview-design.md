# Netlify Branch Preview 설계

**날짜:** 2026-03-28
**상태:** 승인됨

## 목표

개발 브랜치 작업 중 공개 하이퍼링크 없이 접근 가능한 미리보기 URL을 제공한다.
모바일 등 별도 네트워크 환경에서도 접근 가능해야 한다.

## 아키텍처

메인 사이트와 preview는 별개의 호스팅 서비스가 담당한다.

```
main 브랜치      → GitHub Pages → chanheelee-dev.github.io  (기존 유지)
preview/* 브랜치 → Netlify      → deploy-preview-N--site.netlify.app
```

Netlify는 preview 전용으로만 사용하며, Netlify production URL은 사용하지 않는다.

## 브랜치 규칙

- `preview/` prefix가 있는 브랜치만 Netlify 배포 대상
- 예: `preview/setup-dev-env`, `preview/new-feature`
- 그 외 브랜치(feat/, fix/ 등)는 Netlify 배포 없음

## Netlify 빌드 설정

| 항목 | 값 |
|------|-----|
| Base directory | `docs/` |
| Build command | `jekyll build` |
| Publish directory | `docs/_site/` |
| Production branch | `main` (배포 비활성) |
| Branch deploys | `preview/*` 만 활성화 |

## 워크플로우

1. 개발 브랜치에서 작업
2. 미리보기가 필요할 때 `preview/` prefix 브랜치로 push (또는 rename)
3. Netlify 자동 빌드 (약 1~2분 소요)
4. Netlify 대시보드에서 preview URL 확인
5. 모바일 포함 어디서든 접근 가능

## Fallback

Netlify가 동작하지 않을 경우 로컬 터널 방식으로 대체한다.

```bash
# 1. 로컬 Jekyll 서버 실행
cd docs && bundle exec jekyll serve

# 2. ngrok으로 외부 접근 가능한 터널 생성
ngrok http 4000
```

ngrok이 출력하는 URL로 모바일 등 외부 네트워크에서 접근 가능하다.
단, 노트북이 켜진 상태에서만 접근 가능하다는 제약이 있다.
