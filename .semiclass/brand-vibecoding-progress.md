# SemiClass Brand Website Progress

- Course: semiclass-brand-website-vibecoding
- Updated: 2026-06-27T00:00:00.000Z
- Overall: 38%

## Current

현재 위치: 3 / 8 - 미리보기
메모: 로컬에 Node/Python 미설치 → dev server 대신 index.html 직접 열어 확인

## Roadmap

| # | Stage | Status | Progress | Done means | Next action |
|---:|---|---|---|---|---|
| 1 | 준비 | 완료 | ██████████ | 계정, 브리프, 프로젝트 폴더가 준비됨 | 다음 단계로 이동 |
| 2 | 로컬 구현 | 완료 | ██████████ | 웹사이트 파일이 로컬 프로젝트에 존재함 | 다음 단계로 이동 |
| 3 | 미리보기 | 진행 | █████░░░░░ | 로컬 URL이나 브라우저에서 화면을 확인함 | index.html을 더블클릭해 첫 화면과 CTA를 확인한다. |
| 4 | 내용/디자인 | 완료 | ██████████ | 카피, 섹션, 스타일, 모바일을 1차 수정함 | 다음 단계로 이동 |
| 5 | Git 저장 | 대기 | ░░░░░░░░░░ | Git 저장소와 최소 1개 commit이 있음 | git init 후 첫 commit을 만든다. |
| 6 | GitHub 연결 | 대기 | ░░░░░░░░░░ | GitHub remote가 연결되고 push 준비가 됨 | GitHub repo를 만들고 origin remote로 push한다. |
| 7 | Vercel 배포 | 대기 | ░░░░░░░░░░ | Vercel 프로젝트 또는 공개 URL이 있음 | Vercel에서 GitHub repo를 import한다 (Framework: Other). |
| 8 | URL 확인 | 대기 | ░░░░░░░░░░ | 공개 URL을 데스크톱과 모바일에서 확인함 | 휴대폰에서 URL을 열고 링크와 CTA를 확인한다. |
| 9 | Supabase 다음 확장 | 잠금 | 잠금 | DB, Auth, Storage는 다음 수업 범위로 분리함 | 저장 데이터와 로그인 필요성만 메모한다. |

## Signals

- packageJson: false
- devScript: false
- buildScript: false
- sourceFiles: true
- gitDir: false
- gitCommit: false
- gitRemote: null
- githubRemote: false
- vercelProject: false

## Agent Commands

```bash
node <skill-folder>/scripts/progress.mjs scan .
node <skill-folder>/scripts/progress.mjs set . preview done "로컬 화면 확인 완료"
node <skill-folder>/scripts/progress.mjs url . https://your-site.vercel.app
```
