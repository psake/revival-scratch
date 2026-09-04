---
title: "[REVIVAL] {{module}}"
labels: revival
type: Task
---

# {{module}} revival

Tracking issue for bringing **{{module}}** from `status-incoming` to `status-active`.
Steward: {{steward}}. Repo: {{repo_url}}.

Each phase is a sub-issue below. Phases overlap; pace to the state of the repo, not the
week numbers. Reference material (comment templates, decision tree, YAML, release steps) is in
the [Revival Playbook](https://github.com/PowerShellOrg/.github/blob/main/docs/revival-playbook.md).

## Baseline (captured at transfer)

| Metric | Value |
|---|---|
| Transfer date | {{today}} |
| Last commit | {{last_push}} |
| Open issues | {{open_issues}} |
| Open PRs | {{open_prs}} |
| Stars / forks | {{stars}} / {{forks}} |
| Existing CI | {{ci}} |
| Last PSGallery release | _fill in: version and date_ |
| PSGallery downloads | _fill in_ |

These numbers go in the first release announcement.

## Working with an AI assistant

Point it at the playbook and this issue. It drafts; you post. Comments on other people's
issues, PR closes, and merges are yours to click.
