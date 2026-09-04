---
title: "[REVIVAL] {{module}} - Phase 0: Inventory"
labels: revival
type: Task
role: Steward (PSGallery items: Org Admin)
---

Reference: [Playbook - Phase 0](https://github.com/PowerShellOrg/.github/blob/main/docs/revival-playbook.md#phase-0-take-inventory)

## Transfer and access

- [ ] Repo lives at `github.com/PowerShellOrg/{{module}}`
- [ ] Repo marked `status-incoming`
- [ ] Steward and maintainers have Write
- [ ] Branch protection on the default branch
- [ ] Default branch is `main`
- [ ] Labels match [`labels.yml`](https://github.com/PowerShellOrg/.github/blob/main/docs/revival/labels.yml)

## PSGallery (Org Admin)

- [ ] Package ownership transferred to the PowerShellOrg PSGallery account
- [ ] Scoped API key created: `PowerShellOrg-{{module}}-<YYYY-MM>`, 365-day expiry
- [ ] `PSGALLERY_API_KEY` secret set on the repo
- [ ] Rotation reminder on the Org Admin's tracking issue

Baseline metrics are in the tracking issue; fill in the PSGallery rows there.
