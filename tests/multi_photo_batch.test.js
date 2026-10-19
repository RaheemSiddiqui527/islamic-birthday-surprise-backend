import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { seedDefaults } from '../src/utils/seedDefaults.js';
import { Photo } from '../src/models/Photo.js';

let server;
let baseUrl;
let adminCookie;
let adminToken;

// Minimal valid 1x1 JPEG
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

test('Batch Upload: 8 photos uploaded in a single batch request succeed and persist in MongoDB', async () => {
  const boundary = '----WebKitFormBoundaryMultiBatchTest123';
  const parts = [];

  for (let i = 1; i <= 8; i++) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="batch_photo_${i}.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
      ),
      dummyJpg,
      Buffer.from('\r\n')
    );
  }

  parts.push(
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\nBatch Test Caption\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="isPublished"\r\n\r\ntrue\r\n`),
    Buffer.from(`--${boundary}--\r\n`)
  );

  const body = Buffer.concat(parts);

  const res = await fetch(`${baseUrl}/admin/photos/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${adminToken}`,
      ...(adminCookie ? { 'Cookie': adminCookie } : {})
    },
    body
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.photos.length, 8);
  assert.equal(data.failed.length, 0);

  // Verify that all 8 photos have distinct IDs and WebP thumbnails
  const ids = data.photos.map((p) => p._id);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, 8);

  for (const photo of data.photos) {
    assert.ok(photo.filePath.startsWith('/uploads/photos/'));
    assert.ok(photo.thumbnailPath.endsWith('.webp'));
    const doc = await Photo.findById(photo._id);
    assert.ok(doc, 'Photo record must exist in MongoDB');
  }

  // Verify gallery count
  const galleryRes = await fetch(`${baseUrl}/admin/photos`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      ...(adminCookie ? { 'Cookie': adminCookie } : {})
    }
  });
  const galleryData = await galleryRes.json();
  assert.equal(galleryRes.status, 200);
  assert.ok(galleryData.photos.length >= 8, 'Gallery must include newly uploaded batch');
});

test('Batch Resilience: Valid images succeed even if one image has processing error', async () => {
  const boundary = '----WebKitFormBoundaryResilienceTest456';
  const parts = [
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="good_photo_1.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
    ),
    dummyJpg,
    Buffer.from('\r\n'),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="corrupt_photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
    ),
    Buffer.from('not-a-real-image-buffer-corrupt'),
    Buffer.from('\r\n'),
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="good_photo_2.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
    ),
    dummyJpg,
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="isPublished"\r\n\r\ntrue\r\n`),
    Buffer.from(`--${boundary}--\r\n`)
  ];

  const body = Buffer.concat(parts);

  const res = await fetch(`${baseUrl}/admin/photos/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${adminToken}`,
      ...(adminCookie ? { 'Cookie': adminCookie } : {})
    },
    body
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  // Both good photos succeeded
  assert.ok(data.photos.length >= 2);
  assert.ok(data.photos.some((p) => p.originalName === 'good_photo_1.jpg'));
  assert.ok(data.photos.some((p) => p.originalName === 'good_photo_2.jpg'));
});
