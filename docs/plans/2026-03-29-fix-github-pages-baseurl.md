# Fix GitHub Pages baseurl Issue

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken page links on GitHub Pages deployment caused by wrong `baseurl` being injected by `jekyll-github-metadata` in GitHub Actions environment.

**Architecture:** `jekyll-github-metadata` (transitive dep of `jekyll-theme-primer`) hooks into `:site, :after_reset` and sets `site.baseurl = "/pages/chanheelee-dev"` in GitHub Actions Pages environment — even when `baseurl: ""` is in `_config.yml` (the plugin overrides empty strings too). A local plugin in `_plugins/` registers the same hook and runs after gem plugins, overriding the wrong value back to `""`.

**Tech Stack:** Jekyll 4.4, jekyll-github-metadata, Jekyll Hooks API, GitHub Actions

---

## Root Cause

`jekyll-relative-links` builds link URLs as:
```ruby
url = "#{site.config['baseurl']}#{target_page.url}"
```

When `jekyll-github-metadata` sets `site.baseurl = "/pages/chanheelee-dev"` (the GitHub Actions Pages staging path), this produces:
```
/pages/chanheelee-dev/essays/memoir_devsisters
```
→ resolves in browser to `https://chanheelee-dev.github.io/pages/chanheelee-dev/essays/memoir_devsisters` ❌

Expected: `site.baseurl = ""` → `/essays/memoir_devsisters` ✅

Local builds work because without `GITHUB_TOKEN` / `GITHUB_ACTIONS` env, the metadata plugin falls back to defaults and doesn't set the staging baseurl.

## Files

- Create: `_plugins/fix_baseurl.rb`

---

### Task 1: Create baseurl fix plugin

**Files:**
- Create: `_plugins/fix_baseurl.rb`

- [ ] **Step 1: Create the plugin file**

```ruby
# _plugins/fix_baseurl.rb
# jekyll-github-metadata (dep of jekyll-theme-primer) overrides site.baseurl
# with the GitHub Actions Pages staging path ("/pages/<owner>") even when
# baseurl is explicitly set to "" in _config.yml.
# This plugin re-registers on the same hook (:site, :after_reset) and runs
# after gem plugins, restoring the correct value from _config.yml.
Jekyll::Hooks.register :site, :after_reset do |site|
  configured = site.config["baseurl"]
  site.config["baseurl"] = configured.nil? ? "" : configured
end
```

> Why this works: local plugins in `_plugins/` are loaded after gem plugins (via Bundler), so this hook registration runs after `jekyll-github-metadata`'s registration. Jekyll fires hooks in registration order, so ours runs last and wins.

- [ ] **Step 2: Verify locally (baseline)**

```bash
bundle exec jekyll build
grep -r 'href="/pages/' _site/ | head -5
```

Expected: no matches (no `/pages/` prefix in hrefs)

- [ ] **Step 3: Check a content link in the built output**

```bash
grep -A2 'memoir_devsisters' _site/index.html
```

Expected output contains:
```html
href="/essays/memoir_devsisters"
```

NOT:
```html
href="/pages/chanheelee-dev/essays/memoir_devsisters"
```

- [ ] **Step 4: Commit and push**

```bash
git add _plugins/fix_baseurl.rb
git commit -m "fix: _plugins/fix_baseurl.rb로 jekyll-github-metadata baseurl 오버라이드 수정"
git push
```

- [ ] **Step 5: Verify deployed site**

GitHub Actions 빌드 완료 후:
1. `https://chanheelee-dev.github.io/` 접속
2. 에세이/프로젝트 링크 hover → `/essays/...` or `/projects/...` 형태인지 확인
3. 링크 클릭 → 올바른 페이지 로드 확인
4. 테마(Primer 스타일) 적용 여부 확인

---

## If This Doesn't Fix It

`site.baseurl`이 아니라 `site.github.url`이 문제라면 (`jekyll-theme-primer` 레이아웃이 `site.github.url`을 헤더 링크에 사용):

```ruby
# _plugins/fix_baseurl.rb 에 추가
Jekyll::Hooks.register :site, :post_read do |site|
  if site.config["github"].is_a?(Hash)
    site.config["github"]["url"] = site.config["url"] || "https://chanheelee-dev.github.io"
    site.config["github"]["baseurl"] = ""
  end
end
```

`:post_read`는 `:after_reset` 이후에 실행되므로 더 늦게 override 가능.
