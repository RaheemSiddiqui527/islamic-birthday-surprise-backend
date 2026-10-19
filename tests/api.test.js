import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { seedDefaults } from '../src/utils/seedDefaults.js';

let server;
let baseUrl;

test.before(async () => {
  await connectDB();
  await seedDefaults();

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

test('GET /api/v1/public/content returns approved greeting and no "Happy Birthday"', async () => {
  const res = await fetch(`${baseUrl}/public/content`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.settings.mainHeading, 'JANAMDIN MUBARAK, BHAI JAAN ❤️');
  assert.ok(data.data.duas.length >= 7, 'Should have at least 7 default duas');
  assert.ok(data.data.letter, 'Should return birthday letter');
  assert.equal(data.data.letter.signOff, 'Aapke Chhote Bhai Ki Taraf Se ❤️');

  const rawJson = JSON.stringify(data);
  assert.equal(/Happy\s*Birthday/i.test(rawJson), false, 'Must never contain "Happy Birthday"');
});

test('POST /api/v1/public/duas/:id/aameen increments count', async () => {
  const contentRes = await fetch(`${baseUrl}/public/content`);
  const content = await contentRes.json();
  const dua = content.data.duas[0];
  const initialCount = dua.aameenCount;

  const aameenRes = await fetch(`${baseUrl}/public/duas/${dua._id}/aameen`, { method: 'POST' });
  assert.equal(aameenRes.status, 200);
  const aameenData = await aameenRes.json();
  assert.equal(aameenData.success, true);
  assert.equal(aameenData.aameenCount, initialCount + 1);
});

test('POST /api/v1/auth/login succeeds with correct credentials and fails with wrong', async () => {
  // Fail wrong password
  const failRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'WrongPassword123!' })
  });
  assert.equal(failRes.status, 401);

  // Success with correct password
  const successRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'BhaiJaan@2026!' })
  });
  assert.equal(successRes.status, 200);
  const loginData = await successRes.json();
  assert.equal(loginData.success, true);
  assert.ok(loginData.token, 'Should return JWT token');
});

test('Protected admin route rejects unauthenticated request', async () => {
  const res = await fetch(`${baseUrl}/admin/dashboard`);
  assert.equal(res.status, 401);
});
