import {test, expect} from '@playwright/test';
const demo = async page => {
  await page.goto('/'); page.once('dialog', d=>d.accept()); await page.getByRole('button',{name:'Load synthetic example'}).click();
  await expect(page.locator('#status')).toHaveText('Saved in this browser.');
};
test('main journey: details, create, edit, reorder, remove, reload and sheet', async ({page}) => {
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/'); await page.getByLabel('Workshop title').fill('Late night lab');
  await page.getByLabel('Start time',{exact:true}).fill('23:45'); await page.getByLabel('Target length').fill('30');
  await page.getByRole('button',{name:'Save session details'}).click();
  await page.getByRole('link',{name:'Agenda',exact:true}).click();
  await expect(page.getByText('A blank page, full of possibility.')).toBeVisible();
  for (const title of ['Opening','Practice']) {
    await page.getByLabel('Activity name').fill(title); await page.getByLabel('Minutes',{exact:true}).fill('20');
    await page.getByRole('button',{name:'Add activity',exact:true}).click();
  }
  await expect(page.locator('.budget')).toHaveText('10 minutes over target');
  await expect(page.locator('.activity').last()).toContainText('00:25 (+1d)');
  await page.getByRole('button',{name:'Earlier: Practice',exact:true}).click();
  await expect(page.locator('.activity').first()).toContainText('Practice');
  await page.getByRole('button',{name:'Edit: Practice',exact:true}).click();
  await page.getByLabel('Minutes',{exact:true}).fill('10'); await page.getByLabel('Facilitator notes').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button',{name:'Save activity',exact:true}).click();
  await expect(page.locator('.budget')).toHaveText('Your agenda fits exactly');
  await expect(page.locator('.notes')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('.notes img')).toHaveCount(0);
  page.once('dialog',d=>d.dismiss()); await page.getByRole('button',{name:'Remove: Opening',exact:true}).click();
  await expect(page.locator('.activity')).toHaveCount(2);
  page.once('dialog',d=>d.accept()); await page.getByRole('button',{name:'Remove: Opening',exact:true}).click();
  await page.reload(); await expect(page.locator('.activity')).toHaveCount(1);
  await page.getByRole('link',{name:'Facilitator sheet',exact:true}).click();
  await expect(page.locator('#sheet')).toContainText('Late night lab'); await expect(page.locator('.sheet-row')).toHaveCount(1);
  await page.emulateMedia({media:'print'}); await expect(page.locator('header')).toBeHidden();
  await expect(page.locator('#print')).toBeHidden(); await expect(page.locator('#sheet')).toBeVisible();
  expect(errors).toEqual([]);
});
test('backup download, invalid import preservation, valid restore and corruption recovery', async ({page}) => {
  await demo(page);
  const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Download backup',exact:true}).click();
  const download=await downloadPromise; expect(download.suggestedFilename()).toBe('sessionmap-backup.json');
  const before=await page.evaluate(()=>localStorage.getItem('sessionmap.v1'));
  await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
  await expect(page.locator('#status')).toContainText('not a valid JSON');
  expect(await page.evaluate(()=>localStorage.getItem('sessionmap.v1'))).toBe(before);
  const next={...JSON.parse(before),title:'Restored workshop'};
  page.once('dialog',d=>d.accept()); await page.locator('#import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(next))});
  await expect(page.getByLabel('Workshop title')).toHaveValue('Restored workshop');
  await page.evaluate(()=>localStorage.setItem('sessionmap.v1','{broken')); await page.reload();
  await expect(page.locator('#status')).toContainText('has not been replaced'); await expect(page.locator('#export')).toBeDisabled();
  await page.getByRole('button',{name:'Save session details'}).click();
  expect(await page.evaluate(()=>localStorage.getItem('sessionmap.v1'))).toBe('{broken');
  page.once('dialog',d=>d.accept()); await page.locator('#import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(next))});
  await expect(page.getByLabel('Workshop title')).toHaveValue('Restored workshop');
});
test('two-tab stale save cannot replace newer data', async ({page,context}) => {
  await demo(page); const second=await context.newPage(); await second.goto('/');
  await page.getByLabel('Workshop title').fill('Newer plan'); await page.getByRole('button',{name:'Save session details'}).click();
  await second.getByLabel('Workshop title').fill('Stale plan'); await second.getByRole('button',{name:'Save session details'}).click();
  await expect(second.locator('#status')).toContainText('changed in another tab');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sessionmap.v1')).title)).toBe('Newer plan');
});
for (const width of [1280,390,320]) test(`responsive pages at ${width}px`, async ({page}) => {
  await page.setViewportSize({width,height:900}); await demo(page);
  for (const route of ['index.html','agenda.html','sheet.html']) {
    await page.goto('/'+route); await expect(page.locator('#status')).not.toContainText('Loading');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
  }
});
