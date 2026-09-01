'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const IOS_DIR = path.join(ROOT, 'ios');

function main() {
  if (fs.existsSync(IOS_DIR)) {
    console.log('iOS platform already present — skipping cap add ios');
    return;
  }

  console.log('Adding iOS platform via Capacitor...');
  execSync('npx cap add ios', {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env
  });
}

main();
