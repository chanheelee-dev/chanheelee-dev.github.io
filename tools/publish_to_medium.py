#!/usr/bin/env python3
"""Publish a markdown file to Medium as a draft."""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error

MEDIUM_API_BASE = "https://api.medium.com/v1"


def get_token():
    token = os.environ.get("MEDIUM_TOKEN")
    if not token:
        print(
            "Error: MEDIUM_TOKEN 환경변수가 설정되지 않았습니다.\n"
            "Medium 토큰 발급: Settings > Security and apps > Integration tokens",
            file=sys.stderr,
        )
        sys.exit(1)
    return token


def extract_title_and_body(content):
    match = re.search(r"^# (.+)$", content, re.MULTILINE)
    if not match:
        print("Error: 마크다운 파일에서 '# 제목' 형식의 헤딩을 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)
    title = match.group(1).strip()
    body = content[: match.start()] + content[match.end() :]
    body = body.strip()
    return title, body


def check_content_warnings(content):
    warnings = []
    local_images = re.findall(r"!\[.*?\]\((?!https?://)(.*?)\)", content)
    if local_images:
        warnings.append(f"로컬 이미지 {len(local_images)}개 발견 (Medium에 업로드되지 않음): {local_images}")
    if "$$" in content:
        warnings.append("LaTeX 수식($$) 발견 - Medium에서는 렌더링되지 않습니다.")
    return warnings


def api_request(method, path, token, data=None):
    url = f"{MEDIUM_API_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8", errors="replace")
        if e.code == 401:
            print("Error: 토큰이 유효하지 않거나 만료되었습니다.", file=sys.stderr)
        else:
            print(f"Error: HTTP {e.code} - {resp_body}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="마크다운 파일을 Medium draft로 게시합니다.")
    parser.add_argument("file", help="마크다운 파일 경로")
    parser.add_argument("-t", "--tags", help="쉼표로 구분된 태그 (최대 3개, 각 25자)")
    parser.add_argument("--dry-run", action="store_true", help="API 호출 없이 미리보기")
    args = parser.parse_args()

    file_path = args.file
    if not os.path.isfile(file_path):
        print(f"Error: 파일을 찾을 수 없습니다: {file_path}", file=sys.stderr)
        sys.exit(1)

    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    title, body = extract_title_and_body(content)

    for w in check_content_warnings(content):
        print(f"Warning: {w}", file=sys.stderr)

    tags = []
    if args.tags:
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        if len(tags) > 3:
            print(f"Warning: Medium은 최대 3개 태그만 사용합니다. 초과분 제거: {tags[3:]}", file=sys.stderr)
            tags = tags[:3]
        for tag in tags:
            if len(tag) > 25:
                print(f"Error: 태그 '{tag}'가 25자를 초과합니다.", file=sys.stderr)
                sys.exit(1)

    if args.dry_run:
        print(f"Title: {title}")
        print(f"Tags:  {tags}")
        print(f"Length: {len(body)} chars")
        print("--- Content preview (first 500 chars) ---")
        print(body[:500])
        return

    token = get_token()
    user = api_request("GET", "/me", token)
    author_id = user["data"]["id"]

    result = api_request("POST", f"/users/{author_id}/posts", token, {
        "title": title,
        "contentFormat": "markdown",
        "content": body,
        "tags": tags,
        "publishStatus": "draft",
    })

    url = result["data"]["url"]
    print(f"Draft 생성 완료!")
    print(f"URL: {url}")
    print(f"Title: {title}")
    print("위 URL에서 확인 후 직접 publish 하세요.")


if __name__ == "__main__":
    main()
