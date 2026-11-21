import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const server = spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,SERVE_DIST:'1'},stdio:'pipe'});
let browser;
try {
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error(`Server exited ${code}`)));});
  browser=await chromium.launch({channel:process.env.CI ? undefined : 'msedge'});
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  await page.goto('http://127.0.0.1:4191');
  page.once('dialog',d=>d.accept()); await page.locator('#demo').click();
  await page.goto('http://127.0.0.1:4191/agenda.html'); await page.locator('.activity').first().waitFor();
  await mkdir('docs',{recursive:true});
  await page.screenshot({path:'docs/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844}); await page.screenshot({path:'docs/mobile.png',fullPage:true});
  await page.goto('http://127.0.0.1:4191/sheet.html'); await page.locator('.sheet-row').first().waitFor();
  await page.emulateMedia({media:'print'}); await page.setViewportSize({width:794,height:1123});
  await page.screenshot({path:'docs/print.png',fullPage:true});
  console.log('Captured desktop, mobile, and print-media screenshots with synthetic data.');
} finally {await browser?.close();server.kill();}
