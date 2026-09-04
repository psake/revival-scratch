---
title: "[REVIVAL] {{module}} - Phase 4: First clean release"
labels: revival
type: Task
role: Steward
---

Reference: [Playbook - Phase 4](https://github.com/PowerShellOrg/.github/blob/main/docs/revival-playbook.md#phase-4-first-clean-release)
(release steps)

Goal: a release under the PowerShellOrg banner you are proud to put your name on.

## Release gate

- [ ] `CHANGELOG.md` covers everything since the last release
- [ ] Version bumped: patch / minor / major as the changes warrant
- [ ] CI green and PSScriptAnalyzer clean
- [ ] Manifest accurate: description, author or org, copyright, tags, URLs
- [ ] `README.md` current: install, working examples, badges
- [ ] Open critical bugs fixed or deferred with a written reason
- [ ] Release PR reviewed by one other maintainer (or Steward if solo)

## Exit

- [ ] Release on PSGallery under PowerShellOrg
- [ ] GitHub Release with human-readable notes
- [ ] PSGallery package description says PowerShellOrg
