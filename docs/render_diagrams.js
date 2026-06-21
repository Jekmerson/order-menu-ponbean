const fs = require('fs');
const path = require('path');

const docsDir = __dirname;
const mmdDir = path.join(docsDir, 'mmd');
const imgDir = path.join(docsDir, 'images');

// Create directories
if (!fs.existsSync(mmdDir)) fs.mkdirSync(mmdDir, { recursive: true });
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// Files to process (excluding A which has no diagrams)
const files = [
  'B_UseCase_Diagram_Skenario.md',
  'C_Activity_Diagram.md',
  'D_Sequence_Diagram.md',
  'E_Class_Diagram.md',
  'F_Deployment_Diagram.md',
];

let allMmdFiles = [];

for (const file of files) {
  const filePath = path.join(docsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const prefix = file.replace('.md', '');

  // Extract mermaid blocks
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  let idx = 1;

  while ((match = regex.exec(content)) !== null) {
    const mermaidCode = match[1].trim();
    const mmdFileName = `${prefix}_${String(idx).padStart(2, '0')}.mmd`;
    const mmdFilePath = path.join(mmdDir, mmdFileName);

    fs.writeFileSync(mmdFilePath, mermaidCode, 'utf-8');
    allMmdFiles.push(mmdFileName);
    console.log(`Extracted: ${mmdFileName}`);
    idx++;
  }
}

console.log(`\nTotal diagrams extracted: ${allMmdFiles.length}`);
console.log('\nFiles:');
allMmdFiles.forEach(f => console.log(`  ${f}`));
