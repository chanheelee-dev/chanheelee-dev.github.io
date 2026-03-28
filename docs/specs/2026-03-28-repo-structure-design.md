# 레포지토리 구조 개선 설계

**날짜:** 2026-03-28
**상태:** 승인됨

## 목표

설정 파일, 콘텐츠, 개발 문서가 repo root에 섞여 직관성이 떨어지는 문제를 해결한다.
카테고리가 URL에 반영되고, 폴더 구조가 바뀌어도 URL이 안정적으로 유지된다.

## 최종 구조

```
repo root
├── _config.yml            Jekyll 설정
├── Gemfile
├── Gemfile.lock
├── netlify.toml           Netlify 배포 설정
├── .github/
│   └── workflows/
│       └── deploy.yml     GitHub Actions 배포
├── .ruby-version
├── README.md              방문자용 소개
├── DEV.md                 개발자용 가이드
├── index.md               블로그 홈
│
├── content/
│   ├── essays/            에세이 → URL: /essays/:name
│   └── projects/          프로젝트 → URL: /projects/:name
│
├── docs/                  개발 문서 (Jekyll 빌드 제외)
│   ├── specs/
│   └── plans/
│
└── _site/                 빌드 결과물 (gitignored)
```

## 콘텐츠 파일 이동

| 현재 경로 | 이동 경로 |
|-----------|-----------|
| `memoir_devsisters.md` | `content/essays/memoir_devsisters.md` |
| `proj_ltv.md` | `content/projects/ltv.md` |
| `proj_ltv_stg_1.md` | `content/projects/ltv_stg_1.md` |
| `ltv_modeling_mcmc.md` | `content/projects/ltv_modeling_mcmc.md` |
| `proj_cookiewiki.md` | `content/projects/cookiewiki.md` |
| `proj_llm_translation.md` | `content/projects/llm_translation.md` |
| `proj_llm_translation_stg_1.md` | `content/projects/llm_translation_stg_1.md` |
| `proj_llm_translation_stg_2.md` | `content/projects/llm_translation_stg_2.md` |
| `specs/` | `docs/specs/` |
| `plans/` | `docs/plans/` |

## `_config.yml` 변경

### permalink defaults 추가

`content/` 폴더명이 URL에 노출되지 않도록 한다.

```yaml
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
```

### exclude 업데이트

```yaml
exclude:
  - README.md
  - DEV.md
  - netlify.toml
  - docs/
  - .worktrees/
  - Gemfile
  - Gemfile.lock
```

## URL 결과

| 파일 경로 | URL |
|-----------|-----|
| `content/essays/memoir_devsisters.md` | `/essays/memoir_devsisters` |
| `content/projects/ltv.md` | `/projects/ltv` |
| `content/projects/cookiewiki.md` | `/projects/cookiewiki` |
| `index.md` | `/` |

## 기타

- `memoir_devsisters_00.png` 이미지는 `content/essays/` 로 함께 이동
- 파일명에서 `proj_` prefix 제거 (폴더로 맥락이 충분)
- 기존 URL(`/proj_ltv` 등)은 변경됨 — 외부 링크가 없으므로 허용
