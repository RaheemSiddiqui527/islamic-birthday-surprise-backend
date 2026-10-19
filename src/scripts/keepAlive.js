import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const isEnabled = process.env.ENABLE_KEEP_ALIVE === 'true';
const targetUrl = process.env.KEEP_ALIVE_URL || 'http://localhost:5000/api/v1/health';
const intervalMs = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 5000;
const requestTimeoutMs = Math.min(intervalMs - 500, 4000); // Ensure timeout completes before next interval

let isRunning = false;
let isRequestPending = false;
let intervalTimer = null;
let consecutiveFailures = 0;

function validateTargetUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol ${parsed.protocol}. Only HTTP and HTTPS are permitted.`);
    }
    // Safety check: ensure target path points to a health check endpoint to prevent targeting unrelated URLs
    if (!parsed.pathname.includes('health')) {
      throw new Error(`Target URL path "${parsed.pathname}" must contain "health".`);
    }
    return parsed.href;
  } catch (err) {
    throw new Error(`Keep-Alive URL validation failed: ${err.message}`);
  }
}

async function pingHealthEndpoint(safeUrl) {
  if (isRequestPending) {
    console.warn('[Keep-Alive] Previous health check still pending. Skipping overlapping tick.');
    return;
  }

  isRequestPending = true;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(safeUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Islamic-Surprise-KeepAlive-Worker/1.0',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      consecutiveFailures = 0;
      const data = await response.json().catch(() => ({}));
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[Keep-Alive ${timestamp}] Status: OK (${response.status}) | Uptime: ${data.uptime ?? 'N/A'}s`);
    } else {
      consecutiveFailures++;
      console.warn(`[Keep-Alive] Warning: Received non-200 status (${response.status}) [Failures: ${consecutiveFailures}]`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    consecutiveFailures++;

    if (err.name === 'AbortError') {
      console.warn(`[Keep-Alive] Request timed out after ${requestTimeoutMs}ms [Failures: ${consecutiveFailures}]`);
    } else {
      console.warn(`[Keep-Alive] Network error: ${err.message || 'Connection failed'} [Failures: ${consecutiveFailures}]`);
    }
  } finally {
    isRequestPending = false;
  }
}

export function startKeepAliveWorker() {
  if (!isEnabled) {
    console.log('[Keep-Alive] Worker is disabled (ENABLE_KEEP_ALIVE=false). Set ENABLE_KEEP_ALIVE=true in .env to enable.');
    return;
  }

  let safeUrl;
  try {
    safeUrl = validateTargetUrl(targetUrl);
  } catch (err) {
    console.error(`[Keep-Alive] Initialization aborted: ${err.message}`);
    return;
  }

  console.log('==================================================');
  console.log(`📡 Keep-Alive Health Worker Activated`);
  console.log(`🎯 Target: ${safeUrl}`);
  console.log(`⏱️  Interval: ${intervalMs}ms (${intervalMs / 1000}s)`);
  console.log(`⏱️  Timeout: ${requestTimeoutMs}ms`);
  console.log('==================================================');

  isRunning = true;

  // Immediate initial ping
  pingHealthEndpoint(safeUrl);

  // Recurring interval
  intervalTimer = setInterval(() => {
    if (isRunning) {
      pingHealthEndpoint(safeUrl);
    }
  }, intervalMs);

  const cleanExit = (signal) => {
    console.log(`\n[Keep-Alive] Received ${signal}. Stopping worker cleanly...`);
    isRunning = false;
    if (intervalTimer) clearInterval(intervalTimer);
    process.exit(0);
  };

  process.on('SIGINT', () => cleanExit('SIGINT'));
  process.on('SIGTERM', () => cleanExit('SIGTERM'));
}

// If executed directly via CLI (e.g. `npm run keep-alive`)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startKeepAliveWorker();
}
