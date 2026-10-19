import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { seedDefaults } from '../src/utils/seedDefaults.js';
import { VideoEntry } from '../src/models/VideoEntry.js';
import { config } from '../src/config/index.js';
import fs from 'fs';
import path from 'path';

let server;
let baseUrl;
let adminCookie;

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

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'BhaiJaan@2026!' })
  });
  adminCookie = loginRes.headers.get('set-cookie');
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

test('Phone Video Upload: Accepts phone video (.mp4/.mov) up to 500MB and persists in DB', async () => {
  const boundary = '----WebKitFormBoundaryVideoUploadTest123';
  const parts = [];

  // 1. Title field
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nKareem Bhai Mobile Video Test\r\n`
    )
  );

  // 2. Description field
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nVideo uploaded from Android/iPhone\r\n`
    )
  );

  // 3. isGoogleFlow field
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="isGoogleFlow"\r\n\r\ntrue\r\n`
    )
  );

  // 4. Video file (e.g. 1000680198.mp4 from phone)
  const fakeVideoBytes = Buffer.from('FAKE_PHONE_MP4_VIDEO_HEADER_AND_STREAM_PAYLOAD_TEST');
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="video"; filename="1000680198.mp4"\r\nContent-Type: video/mp4\r\n\r\n`
    )
  );
  parts.push(fakeVideoBytes);
  parts.push(Buffer.from('\r\n'));

  // Closing boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(parts);

  const res = await fetch(`${baseUrl}/admin/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Cookie': adminCookie
    },
    body
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.video);
  assert.equal(data.video.title, 'Kareem Bhai Mobile Video Test');
  assert.equal(data.video.isGoogleFlow, true);
  assert.ok(data.video.filePath.includes('/uploads/videos/'));

  // Verify in MongoDB
  const saved = await VideoEntry.findById(data.video._id);
  assert.ok(saved);
  assert.equal(saved.title, 'Kareem Bhai Mobile Video Test');

  const diskFilename = path.basename(saved.filePath);
  const expectedDiskPath = path.join(config.paths.videos, diskFilename);
  assert.ok(fs.existsSync(expectedDiskPath), 'Uploaded video file must be saved on disk');

  // Verify deletion
  const deleteRes = await fetch(`${baseUrl}/admin/videos/${saved._id}`, {
    method: 'DELETE',
    headers: { 'Cookie': adminCookie }
  });
  assert.equal(deleteRes.status, 200);

  const afterDelete = await VideoEntry.findById(saved._id);
  assert.equal(afterDelete, null);
});
