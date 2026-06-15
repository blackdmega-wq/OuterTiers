import { execSync } from 'child_process';
const token = process.env.GITHUB_TOKEN;
if (!token) { console.error('No GITHUB_TOKEN'); process.exit(1); }
const run = (cmd, opts={}) => execSync(cmd, { cwd: '/home/runner/workspace/github-repo', stdio: 'pipe', ...opts }).toString().trim();
run(`git remote set-url origin https://x-access-token:${token}@github.com/blackdmega-wq/OuterTiers.git`);
run('git add -A');
const staged = run('git --no-optional-locks diff --cached --stat');
console.log('Staged:', staged || 'nothing');
if (staged) {
  run('git commit -m "chore: remove push helper script"');
  const out = run('git push origin main');
  console.log(out || 'pushed');
}
console.log('Done');
