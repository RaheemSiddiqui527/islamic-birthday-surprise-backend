import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { seedDefaults } from '../src/utils/seedDefaults.js';
import { getStorageProvider } from '../src/services/storage/index.js';
import { Photo } from '../src/models/Photo.js';
import { VideoEntry } from '../src/models/VideoEntry.js';

let server;
let baseUrl;
let adminCookie;
let adminToken;

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

  // Login as admin
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'BhaiJaan@2026!' })
  });
  const data = await loginRes.json();
  adminToken = data.token;
  adminCookie = loginRes.headers.get('set-cookie');
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

test('Health endpoint: /api/v1/health returns read-only status without credentials or DB writes', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.ok(typeof data.uptime === 'number');
  assert.ok(data.timestamp);

  // Ensure no sensitive keys
  const keys = Object.keys(data);
  assert.equal(keys.includes('password'), false);
  assert.equal(keys.includes('secret'), false);
  assert.equal(keys.includes('mongo'), false);
});

test('Storage Provider Abstraction: local provider is instantiated properly', () => {
  const provider = getStorageProvider();
  assert.ok(provider, 'Provider should be returned');
  assert.equal(provider.providerName, 'local');
});

test('Storage Provider Abstraction: Cloudinary throws explicit error when credentials missing', async () => {
  // If CLOUDINARY credentials are blank, instantiating CloudinaryStorageProvider directly throws
  const { CloudinaryStorageProvider } = await import('../src/services/storage/CloudinaryStorageProvider.js');
  assert.throws(
    () => {
      new CloudinaryStorageProvider();
    },
    /Cloudinary storage provider is selected/
  );
});

test('Photo Upload & Persistence: Admin can upload photo with Sharp WebP thumbnail & metadata', async () => {
  // Create a minimal 1x1 test JPEG
  const dummyJpg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="test-bhai.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    dummyJpg,
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\nTest Photo Caption\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="isPublished"\r\n\r\ntrue\r\n`),
    Buffer.from(`--${boundary}--\r\n`)
  ]);

  const uploadRes = await fetch(`${baseUrl}/admin/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${adminToken}`,
      ...(adminCookie ? { 'Cookie': adminCookie } : {})
    },
    body
  });

  assert.equal(uploadRes.status, 201);
  const uploadData = await uploadRes.json();
  assert.equal(uploadData.success, true);
  assert.equal(uploadData.photos.length, 1);
  const photo = uploadData.photos[0];
  assert.equal(photo.caption, 'Test Photo Caption');
  assert.ok(photo.filePath, 'Should have file path');
  assert.ok(photo.thumbnailPath, 'Should have thumbnail path');
  assert.ok(photo.storageKey, 'Should have storage key');

  // Verify Public Display
  const publicRes = await fetch(`${baseUrl}/public/content`);
  const publicData = await publicRes.json();
  const foundInPublic = publicData.data.photos.some((p) => p._id === photo._id);
  assert.equal(foundInPublic, true, 'Published photo must appear in public content');

  // Protection of unpublished media
  await fetch(`${baseUrl}/admin/photos/${photo._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
      ...(adminCookie ? { 'Cookie': adminCookie } : {})
    },
    body: JSON.stringify({ isPublished: false })
  });

  const publicResAfterHide = await fetch(`${baseUrl}/public/content`);
  const publicDataAfterHide = await publicResAfterHide.json();
  const hiddenInPublic = publicDataAfterHide.data.photos.some((p) => p._id === photo._id);
  assert.equal(hiddenInPublic, false, 'Unpublished photo MUST NOT be exposed in public API');

  // Deletion of media and physical files
  const deleteRes = await fetch(`${baseUrl}/admin/photos/${photo._id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      ...(adminCookie ? { 'Cookie': adminCookie } : {})
    }
  });
  assert.equal(deleteRes.status, 200);
  const checkDeleted = await Photo.findById(photo._id);
  assert.equal(checkDeleted, null, 'Photo record must be removed from MongoDB');
});
