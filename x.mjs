import { execSync } from 'child_process';
const t = process.env.GITHUB_TOKEN;
const r = c => execSync(c, { cwd: '/home/runner/workspace/github-repo', stdio: 'pipe' }).toString().trim();
r(`git remote set-url origin https://x-access-token:${t}@github.com/blackdmega-wq/OuterTiers.git`);
r('git add -A');
const s = r('git --no-optional-locks diff --cached --name-only');
if (s) { r('git commit -m "chore: cleanup"'); r('git push origin main'); }
console.log(r('git --no-optional-locks log --oneline -3'));
