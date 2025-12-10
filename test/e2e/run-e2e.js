const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const MINIO_BASE = process.env.MINIO_BASE || 'http://localhost:9000';
const TEST_IMAGE = process.env.TEST_IMAGE || '../../test-data/test.png';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('E2E: API_BASE =', API_BASE);

  // 1) Create an event
  const eventBody = {
    name: 'E2E Host Test',
    slug: `e2e-host-${Date.now()}`,
    date: new Date().toISOString(),
  };

  console.log('Creating event...');
  const ev = (await axios.post(`${API_BASE}/events`, eventBody)).data;
  console.log('Created event id:', ev.id);

  // 2) Upload file
  console.log('Uploading test image:', TEST_IMAGE);
  const form = new FormData();
  form.append('file', fs.createReadStream(require('path').resolve(__dirname, TEST_IMAGE)));
  form.append('eventId', ev.id);

  const uploadResp = await axios.post(`${API_BASE}/photos/upload`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  });

  if (uploadResp.status >= 400) {
    console.error('Upload failed:', uploadResp.status, uploadResp.data);
    process.exit(2);
  }

  const uploadData = uploadResp.data;
  console.log('Upload response:', uploadData);

  // 3) Poll /photos until photo shows COMPLETED or FAILED
  const start = Date.now();
  const timeoutMs = 30000;
  let photo = null;
  console.log('Polling for photo processing completion...');
  while (Date.now() - start < timeoutMs) {
    const photos = (await axios.get(`${API_BASE}/photos`)).data;
    photo = photos.find((p) => p.id === uploadData.photoId || p.storageUrl === uploadData.storageUrl);
    if (photo && photo.processingStatus && photo.processingStatus !== 'PROCESSING') {
      console.log('Photo status:', photo.processingStatus);
      break;
    }
    await sleep(1000);
  }

  if (!photo) {
    console.error('Photo not found after timeout');
    process.exit(3);
  }

  if (photo.processingStatus === 'FAILED') {
    console.error('Photo processing failed; see API logs for details');
    process.exit(4);
  }

  // 4) Verify MinIO object exists
  // storageUrl may be internal (http://minio:9000/...), construct host-accessible URL
  const objectName = photo.storageUrl.split('/').pop();
  const minioUrl = `${MINIO_BASE}/photos/${objectName}`;
  console.log('Checking MinIO object at', minioUrl);
  const minioResp = await axios.get(minioUrl, { responseType: 'arraybuffer', validateStatus: () => true });
  if (minioResp.status !== 200) {
    console.error('MinIO object not accessible, status:', minioResp.status);
    process.exit(5);
  }

  console.log('E2E success: photo processed and object available. Photo ID:', photo.id);
  process.exit(0);
}

run().catch((err) => {
  console.error('E2E error:', err && err.message ? err.message : err);
  process.exit(1);
});
