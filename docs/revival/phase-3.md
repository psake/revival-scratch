---
title: "[REVIVAL] {{module}} - Phase 3: Build modernization"
labels: revival
type: Task
role: Steward
---

Reference: [Playbook - Phase 3](https://github.com/PowerShellOrg/.github/blob/main/docs/revival-playbook.md#phase-3-build-modernization)
(standard stack, CI and release YAML)

Goal: the repo builds with the standard stack and CI is green on all platforms.
Work in order; each step is its own PR.

## 3a Pester

- [ ] Tests exist and use Pester 5
- [ ] `Invoke-Pester` passes locally

## 3b psake

- [ ] `psakeFile.ps1` defines `Init`, `Clean`, `Build`, `Test`, `Analyze`, `Publish`
- [ ] `Invoke-psake ?` lists them
- [ ] `Invoke-psake Test` passes

## 3c PowerShellBuild

- [ ] Build references PowerShellBuild for shared task logic
- [ ] `Test-ModuleManifest` passes
- [ ] `Invoke-psake Build` stages a clean module in `output/`

## 3d PSScriptAnalyzer

- [ ] `Invoke-psake Analyze` runs the org ruleset
- [ ] Zero warnings, or each suppression carries a justifying comment

## 3e CI

- [ ] `.github/workflows/ci.yml` calls the org reusable workflow
- [ ] CI green on `main` across Win/PS5.1, Win/PS7, Linux/PS7, macOS/PS7
- [ ] Branch protection requires the CI check

## 3f Release workflow

- [ ] `.github/workflows/release.yml` calls the org reusable workflow
- [ ] A pre-release tag (`v*-beta.1`) ran the workflow end to end

## 3g Coverage

- [ ] Coverage report generated
- [ ] Baseline percentage recorded in the tracking issue
- [ ] Critical public functions have tests; gaps filed as issues
