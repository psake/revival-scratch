// Opens one [REVIVAL] tracking issue plus six phase sub-issues from docs/revival/*.md.
// Idempotent: re-running for the same module finds the existing tracking issue and stops.
// Runs under the default GITHUB_TOKEN (issues: write). Needs nothing else.
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'docs/revival';
const PHASES = ['phase-0', 'phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'];
const TRACKING_LABEL = 'revival';

function parseSource(file) {
  const raw = fs.readFileSync(path.join(process.cwd(), SOURCE_DIR, `${file}.md`), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error(`${file}.md has no frontmatter`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').trim();
  }
  const labels = (meta.labels || '').split(',').map(s => s.trim()).filter(Boolean);
  return { title: meta.title, type: meta.type || null, labels, body: raw.slice(m[0].length) };
}

function fill(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? `_${k}_`));
}

async function baseline(github, fullName) {
  const blank = { last_push: '_unknown_', open_issues: '_unknown_', open_prs: '_unknown_', stars: '_unknown_', forks: '_unknown_', ci: '_unknown_' };
  const [owner, repo] = fullName.split('/');
  let r;
  try { r = (await github.rest.repos.get({ owner, repo })).data; }
  catch (e) { if (e.status === 404) return { ...blank, repo_url: `https://github.com/${fullName}`, note: 'repo not found; fill baseline by hand' }; throw e; }
  // open_issues_count includes PRs; subtract an exact PR count. No search API: it lags and misfired under GITHUB_TOKEN.
  const open_prs = (await github.paginate(github.rest.pulls.list, { owner, repo, state: 'open', per_page: 100 })).length;
  const open_issues = r.open_issues_count - open_prs;
  const ci = [];
  for (const [p, name] of [['.github/workflows', 'GitHub Actions'], ['appveyor.yml', 'AppVeyor'], ['azure-pipelines.yml', 'Azure Pipelines'], ['.travis.yml', 'Travis']]) {
    try { await github.rest.repos.getContent({ owner, repo, path: p }); ci.push(name); } catch (e) { if (e.status !== 404) throw e; }
  }
  return {
    repo_url: r.html_url, last_push: r.pushed_at.slice(0, 10), open_issues, open_prs,
    stars: r.stargazers_count, forks: r.forks_count, ci: ci.length ? ci.join(', ') : 'none',
  };
}

async function findExisting(github, owner, repo, title) {
  const issues = await github.paginate(github.rest.issues.listForRepo, { owner, repo, labels: TRACKING_LABEL, state: 'all', per_page: 100 });
  return issues.find(i => !i.pull_request && i.title === title) || null;
}

async function ensureLabel(github, owner, repo) {
  try { await github.rest.issues.getLabel({ owner, repo, name: TRACKING_LABEL }); }
  catch (e) {
    if (e.status !== 404) throw e;
    await github.rest.issues.createLabel({ owner, repo, name: TRACKING_LABEL, color: '5319e7', description: 'Module revival tracking' });
  }
}

async function createIssue(github, owner, repo, src, vars) {
  const params = { owner, repo, title: fill(src.title, vars), body: fill(src.body, vars), labels: src.labels };
  if (src.type) params.type = src.type;
  if (vars.steward && vars.steward !== '_unassigned_') params.assignees = [vars.steward];
  try {
    return (await github.request('POST /repos/{owner}/{repo}/issues', params)).data;
  } catch (e) {
    // Issue type unknown to this org, or steward not assignable: retry bare rather than fail the run.
    if (e.status !== 422) throw e;
    console.warn(`422 creating "${params.title}" (${e.message}); retrying without type/assignees`);
    delete params.type; delete params.assignees;
    return (await github.request('POST /repos/{owner}/{repo}/issues', params)).data;
  }
}

module.exports = async function run({ github, context, core, inputs }) {
  const { owner, repo } = context.repo;
  const module = inputs.module.trim();
  const target = (inputs.repo || `${owner}/${module}`).trim();
  const tracking = parseSource('tracking');

  const vars = {
    module, steward: inputs.steward ? inputs.steward.trim().replace(/^@/, '') : '_unassigned_',
    today: new Date().toISOString().slice(0, 10), ...(await baseline(github, target)),
  };
  const title = fill(tracking.title, vars);

  const existing = await findExisting(github, owner, repo, title);
  if (existing) {
    core.summary.addRaw(`Tracking issue already exists: [#${existing.number}](${existing.html_url}) (${existing.state}). Nothing created.`).write();
    core.setOutput('tracking_issue', existing.number);
    return;
  }

  await ensureLabel(github, owner, repo);
  const parent = await createIssue(github, owner, repo, tracking, vars);
  core.info(`Created ${parent.html_url}`);

  const children = [];
  for (const name of PHASES) {
    const child = await createIssue(github, owner, repo, parseSource(name), vars);
    // sub_issue_id is the database id, not the issue number.
    await github.request('POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues', { owner, repo, issue_number: parent.number, sub_issue_id: child.id });
    children.push(child);
    core.info(`  + ${child.title} -> #${child.number}`);
  }

  if (inputs.adoption_issue) {
    await github.rest.issues.createComment({ owner, repo, issue_number: Number(inputs.adoption_issue),
      body: `Revival tracking issue opened: #${parent.number}. Steward: ${vars.steward === '_unassigned_' ? 'unassigned' : '@' + vars.steward}.` });
  }

  core.setOutput('tracking_issue', parent.number);
  core.summary.addHeading(`Revival started: ${module}`)
    .addRaw(`Tracking issue [#${parent.number}](${parent.html_url}) with ${children.length} phase sub-issues.`)
    .addList(children.map(c => `#${c.number} ${c.title}`))
    .addRaw(vars.note ? `\n\n> ${vars.note}` : '')
    .write();
};
