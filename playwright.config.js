import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: true, workers: 2,
  use: {baseURL:'http://127.0.0.1:4191', headless:true, channel:process.env.CI ? undefined : 'msedge'},
  webServer: {command:'node scripts/serve.mjs',url:'http://127.0.0.1:4191',reuseExistingServer:!process.env.CI, env:{SERVE_DIST:'1'}},
});
