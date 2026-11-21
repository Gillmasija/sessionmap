import {readdir, readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const files = [...await readdir('.'), ...(await readdir('scripts')).map(f=>`scripts/${f}`), ...(await readdir('tests')).map(f=>`tests/${f}`)].filter(f=>/\.(js|mjs|html|css|svg)$/.test(f));
for (const file of files) {
  const source = await readFile(file,'utf8');
  if (/^(<<<<<<<|=======|>>>>>>>)/m.test(source)) throw new Error(`Conflict marker: ${file}`);
  if (/[\t ]+\r?$/m.test(source)) throw new Error(`Trailing whitespace: ${file}`);
  if (/\.(js|mjs)$/.test(file)) execFileSync(process.execPath,['--check',file]);
  if (file.endsWith('.html')) {
    for (const required of ['lang="en"','name="viewport"','favicon.svg','id="main"','aria-current="page"']) if (!source.includes(required)) throw new Error(`Missing ${required}: ${file}`);
    for (const match of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (!/^https?:/.test(match[1])) await readFile(match[1]);
    }
  }
}
console.log(`Lint passed: syntax, source hygiene and page asset links (${files.length} files).`);
