import {mkdir, copyFile, readFile} from 'node:fs/promises';
const files = ['index.html','agenda.html','sheet.html','styles.css','favicon.svg','app.js','model.js','storage.js','demo.js'];
await mkdir('dist',{recursive:true});
for (const file of files) {
  if (!(await readFile(file)).length) throw new Error(`Empty asset: ${file}`);
  await copyFile(file, `dist/${file}`);
}
console.log(`Built ${files.length} static assets in dist/`);
