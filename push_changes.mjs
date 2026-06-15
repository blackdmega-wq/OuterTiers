import { execSync } from 'child_process';

const token = process.env.GITHUB_TOKEN;
if (!token) { console.error('No GITHUB_TOKEN'); process.exit(1); }

const run = (cmd) => {
  console.log('$', cmd.replace(token, '***'));
  return execSync(cmd, { cwd: '/home/runner/workspace/github-repo', stdio: 'pipe' }).toString().trim();
};

run('git config user.email "agent@replit.com"');
run('git config user.name "Replit Agent"');
run(`git remote set-url origin https://x-access-token:${token}@github.com/blackdmega-wq/OuterTiers.git`);
run('git add -A');
const staged = run('git --no-optional-locks diff --cached --stat');
console.log('Staged:\n', staged);
const msg = 'UI improvements: silver/bronze glow, crown centering, tab slide animation, mobile leaderboard fix, tier column mobile sizes, discord icon spin';
run(`git commit -m "${msg}"`);
const out = run('git push origin main');
console.log(out);
console.log('Done!');
