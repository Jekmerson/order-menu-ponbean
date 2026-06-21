const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mmdDir = path.join(__dirname, 'mmd');
const imgDir = path.join(__dirname, 'images');

const mainFiles = [
  'Main_UseCase.mmd',
  'Main_Activity.mmd',
  'Main_Sequence.mmd',
  'Main_Class.mmd',
  'Main_Deployment.mmd',
];

console.log(`Rendering 5 main diagrams...\n`);

for (const file of mainFiles) {
  const input = path.join(mmdDir, file);
  const output = path.join(imgDir, file.replace('.mmd', '.png'));
  const cmd = `npx -y @mermaid-js/mermaid-cli -i "${input}" -o "${output}" -e png -w 2400 -b white -s 2 -q`;

  console.log(`Rendering: ${file} ...`);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });
    if (fs.existsSync(output)) {
      const size = fs.statSync(output).size;
      console.log(`  ✓ OK (${(size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`  ✗ Output not found`);
    }
  } catch (err) {
    console.log(`  ✗ FAILED: ${err.message.substring(0, 200)}`);
  }
}

console.log(`\nDone!`);
