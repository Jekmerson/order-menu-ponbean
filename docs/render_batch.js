const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mmdDir = path.join(__dirname, 'mmd');
const imgDir = path.join(__dirname, 'images');

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const files = fs.readdirSync(mmdDir).filter(f => f.endsWith('.mmd')).sort();

console.log(`Found ${files.length} .mmd files to render.\n`);

let success = 0;
let failed = 0;

for (const file of files) {
  const input = path.join(mmdDir, file);
  const output = path.join(imgDir, file.replace('.mmd', '.png'));
  const cmd = `npx -y @mermaid-js/mermaid-cli -i "${input}" -o "${output}" -e png -w 2400 -b white -s 2 -q`;

  console.log(`Rendering: ${file} ...`);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });
    if (fs.existsSync(output)) {
      const size = fs.statSync(output).size;
      console.log(`  ✓ OK (${(size / 1024).toFixed(1)} KB)`);
      success++;
    } else {
      console.log(`  ✗ Output file not found`);
      failed++;
    }
  } catch (err) {
    console.log(`  ✗ FAILED: ${err.message.substring(0, 200)}`);
    failed++;
  }
}

console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
