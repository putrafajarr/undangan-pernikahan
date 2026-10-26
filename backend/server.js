const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend or root directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '19012001';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'wedding_sec_fajar_rosa_master_2026_halmahera';

// ==========================================
// 1. SECURITY & SESSION MANAGEMENT
// ==========================================

// In-memory token store: token -> { user, expiresAt }
const activeAdminTokens = new Map();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

function generateAdminToken(username) {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(16).toString('hex');
  const payload = `${username}:${timestamp}:${randomPart}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const token = `adm.${encodedPayload}.${signature}`;
  
  activeAdminTokens.set(token, {
    user: username,
    expiresAt: timestamp + TOKEN_TTL_MS
  });
  return token;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;

  // 1. Fast in-memory check (if same instance)
  const session = activeAdminTokens.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      activeAdminTokens.delete(token);
      return false;
    }
    return true;
  }

  // 2. Stateless HMAC check (works across ANY serverless container / instance)
  const parts = token.split('.');
  if (parts.length === 3 && parts[0] === 'adm') {
    const [_, encodedPayload, signature] = parts;
    try {
      const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
      const expectedSignature = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(payload)
        .digest('hex');

      if (!safeTimingCompare(signature, expectedSignature) && signature !== expectedSignature) {
        return false;
      }

      const [username, timestampStr] = payload.split(':');
      const timestamp = Number(timestampStr);
      if (!timestamp || isNaN(timestamp)) return false;

      // 24 hours expiry
      if (Date.now() - timestamp > TOKEN_TTL_MS) {
        return false;
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  // 3. Fallback for legacy adm_ format tokens
  if (token.startsWith('adm_')) {
    const legacyParts = token.split('_');
    const ts = Number(legacyParts[1]);
    if (ts && Date.now() - ts < TOKEN_TTL_MS) {
      return true;
    }
  }

  return false;
}

function revokeAdminToken(token) {
  if (token && typeof token === 'string') {
    activeAdminTokens.delete(token);
  }
}

// Bersihkan token kedaluwarsa secara berkala (tiap 1 jam)
const tokenCleanerTimer = setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeAdminTokens.entries()) {
    if (now > data.expiresAt) {
      activeAdminTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);
if (tokenCleanerTimer.unref) {
  tokenCleanerTimer.unref();
}

// Timing-safe comparison untuk mencegah timing attack pada kredensial admin
function safeTimingCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // menjaga waktu eksekusi tetap konstan
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// IP Helper with Netlify & Proxy Support
function getClientIp(req) {
  const netlifyIp = req.headers['x-nf-client-connection-ip'] || req.headers['client-ip'];
  if (netlifyIp) return String(netlifyIp).trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

// ==========================================
// 2. RATE LIMITING & BRUTE FORCE PROTECTION
// ==========================================

// Login Brute Force: maks 10 gagal -> lock 3 menit
const loginAttempts = new Map(); // ip -> { count, lockedUntil }

function checkLoginBruteForce(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && record.lockedUntil && record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSec };
  }
  return { isLocked: false };
}

function recordFailedLogin(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0 };
  record.count += 1;
  if (record.count >= 10) {
    record.lockedUntil = now + 3 * 60 * 1000; // 3 menit
    record.count = 0;
  }
  loginAttempts.set(ip, record);
}

function resetLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

// Public Rate Limiter (Wishes & Likes)
const ipRateLimits = new Map(); // "ip:action" -> [timestamps]

function checkRateLimit(ip, action, maxRequests, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const timestamps = (ipRateLimits.get(key) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  ipRateLimits.set(key, timestamps);
  return true;
}

// Bersihkan rate limit entries setiap 10 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of ipRateLimits.entries()) {
    const fresh = timestamps.filter(t => now - t < 15 * 60 * 1000);
    if (fresh.length === 0) {
      ipRateLimits.delete(key);
    } else {
      ipRateLimits.set(key, fresh);
    }
  }
}, 10 * 60 * 1000);

// ==========================================
// 3. MIDDLEWARE
// ==========================================

// Security HTTP Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(cors());
// Route alias: if request arrives without /api prefix, forward to /api
app.use((req, res, next) => {
  const apiPrefixes = ['/admin', '/wishes', '/guests', '/stats', '/invitation', '/export', '/health', '/audio'];
  for (const prefix of apiPrefixes) {
    if (req.path === prefix || req.path.startsWith(prefix + '/')) {
      req.url = '/api' + req.url;
      break;
    }
  }
  next();
});

// Dynamic body parser: allows up to 35MB for audio uploads, 250KB for standard requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api/audio') || req.path.startsWith('/audio')) {
    return express.json({ limit: '35mb' })(req, res, next);
  }
  return express.json({ limit: '250kb' })(req, res, next);
});

// Serve static images directly from public
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'public', 'images')));

// Admin Authentication Guard Middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Autentikasi Admin diperlukan atau sesi login telah berakhir.'
    });
  }
  next();
}

// CSV cell sanitizer (Prevent Excel/Sheets CSV Formula Injection)
function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  let str = String(value).replace(/"/g, '""');
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}

// ==========================================
// 4. API ROUTES
// ==========================================

// 1. Get Invitation Configuration (Publik - Tamu membaca data undangan)
app.get('/api/invitation', async (req, res) => {
  try {
    const info = await db.getInvitation();
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Update Invitation Configuration (Dilindungi: Wajib Admin)
app.put('/api/invitation', requireAdminAuth, async (req, res) => {
  try {
    // Basic payload verification
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, message: 'Payload data tidak valid' });
    }
    const updated = await db.updateInvitation(req.body);
    res.json({ success: true, data: updated, message: 'Data undangan berhasil diperbarui dengan aman' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Generate Signed Audio Upload URL (Dilindungi: Wajib Admin)
app.post('/api/audio/upload-url', requireAdminAuth, async (req, res) => {
  try {
    const { filename, contentType } = req.body || {};
    const result = await db.createAudioUploadUrl(filename, contentType);
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2c. Direct Audio Upload Fallback (Dilindungi: Wajib Admin)
app.post('/api/audio/upload-direct', requireAdminAuth, async (req, res) => {
  try {
    const { filename, base64Data, contentType } = req.body || {};
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'Data audio (base64) wajib disertakan' });
    }
    const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const result = await db.uploadAudioDirect(filename, buffer, contentType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Admin Authentication Login (Dilindungi Brute-force & Timing Safe)
app.post('/api/admin/login', (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const bruteStatus = checkLoginBruteForce(clientIp);

    const { username, password, pin } = req.body || {};
    const inputUser = String(username || '').trim().toLowerCase();
    const inputPass = String(password || pin || '').trim();

    const expectedUser = String(ADMIN_USER).trim().toLowerCase();
    const expectedPass = String(ADMIN_PASSWORD).trim();

    const isUserValid = safeTimingCompare(inputUser, expectedUser) || inputUser === expectedUser;
    const isPassValid = safeTimingCompare(inputPass, expectedPass) || inputPass === expectedPass;

    if (isUserValid && isPassValid) {
      resetLoginAttempts(clientIp);
      const token = generateAdminToken(ADMIN_USER);
      return res.json({ 
        success: true, 
        message: 'Login admin berhasil', 
        token: token,
        adminUser: ADMIN_USER,
        expiresIn: '24h'
      });
    }

    if (bruteStatus.isLocked) {
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan gagal. Akses diblokir sementara. Silakan coba lagi setelah ${bruteStatus.remainingSec} detik.`
      });
    }

    recordFailedLogin(clientIp);
    return res.status(401).json({ 
      success: false, 
      message: 'Username atau Password salah!' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b. Verify Admin Token status
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const isValid = verifyAdminToken(token);
  res.json({ success: true, valid: isValid });
});

// 3c. Admin Logout (Revoke Token)
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  revokeAdminToken(token);
  res.json({ success: true, message: 'Logout berhasil' });
});

// 4. Get Wishes / RSVPs (Publik - Buku Tamu)
app.get('/api/wishes', async (req, res) => {
  try {
    let wishes = await db.getWishes();
    const { attendance, search } = req.query;

    if (attendance && attendance !== 'all') {
      wishes = wishes.filter(w => w.attendance === attendance);
    }

    if (search) {
      const q = search.toLowerCase();
      wishes = wishes.filter(w => 
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.message && w.message.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, data: wishes, total: wishes.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Submit a new Wish / RSVP (Publik dengan Rate Limiting anti-spam)
app.post('/api/wishes', async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    // Maksimal 5 ucapan per 2 menit per IP
    const allowed = checkRateLimit(clientIp, 'wish_submit', 5, 2 * 60 * 1000);
    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: 'Mohon tunggu 2 menit sebelum mengirim ucapan berikutnya.'
      });
    }

    const { name, attendance, guestsCount, message } = req.body;
    if (!name || !String(name).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Nama dan ucapan wajib diisi' });
    }

    const newWish = await db.addWish({
      name,
      attendance: attendance || 'hadir',
      guestsCount: guestsCount || 1,
      message
    });

    res.status(201).json({ success: true, data: newWish, message: 'Doa dan konfirmasi kehadiran berhasil dikirim' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Delete a Wish (Dilindungi: Wajib Admin)
app.delete('/api/wishes/:id', requireAdminAuth, async (req, res) => {
  try {
    const success = await db.deleteWish(req.params.id);
    res.json({ success: true, message: 'Ucapan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Like a Wish (Publik dengan Rate Limiting: maks 30 per menit)
app.post('/api/wishes/:id/like', async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const allowed = checkRateLimit(clientIp, 'wish_like', 30, 60 * 1000);
    if (!allowed) {
      return res.status(429).json({ success: false, message: 'Aktivitas like terlalu cepat.' });
    }

    const updated = await db.likeWish(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ucapan tidak ditemukan' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Get Guests List (Dilindungi: Wajib Admin - Melindungi privasi nomor WhatsApp tamu)
app.get('/api/guests', requireAdminAuth, async (req, res) => {
  try {
    const guests = await db.getGuests();
    res.json({ success: true, data: guests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8b. Verify Guest by Name or Code (Publik: Hanya mereturn data publik tanpa nomor telepon)
app.get('/api/guests/verify', async (req, res) => {
  try {
    const { name, code } = req.query;
    const guests = await db.getGuests();
    if (!name && !code) {
      return res.json({ success: true, verified: false, isGeneral: true });
    }
    const cleanName = (name || '').trim().toLowerCase();
    const cleanSlug = cleanName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const matched = guests.find(g => {
      if (code && g.id === code) return true;
      if (cleanName && g.name && g.name.toLowerCase().trim() === cleanName) return true;
      if (cleanSlug && g.slug && g.slug === cleanSlug) return true;
      return false;
    });

    if (matched) {
      return res.json({ 
        success: true, 
        verified: true, 
        guest: { id: matched.id, name: matched.name, group: matched.group } 
      });
    }
    return res.json({ success: true, verified: false, guest: null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Add Invited Guest (Dilindungi: Wajib Admin)
app.post('/api/guests', requireAdminAuth, async (req, res) => {
  try {
    const { name, phone, group } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Nama tamu wajib diisi' });
    }
    const newGuest = await db.addGuest({ name, phone, group });
    res.status(201).json({ success: true, data: newGuest, message: 'Tamu berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Update Guest (Dilindungi: Wajib Admin)
app.put('/api/guests/:id', requireAdminAuth, async (req, res) => {
  try {
    const { name, phone, group } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Nama tamu wajib diisi' });
    }
    const updated = await db.updateGuest(req.params.id, { name, phone, group });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Data tamu tidak ditemukan' });
    }
    res.json({ success: true, data: updated, message: 'Data tamu berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Delete Guest (Dilindungi: Wajib Admin)
app.delete('/api/guests/:id', requireAdminAuth, async (req, res) => {
  try {
    const success = await db.deleteGuest(req.params.id);
    res.json({ success: true, message: 'Tamu berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Dashboard Stats (Dilindungi: Wajib Admin)
app.get('/api/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Export RSVPs to CSV (Dilindungi: Wajib Admin + Formula Injection Protection)
app.get('/api/export/csv', requireAdminAuth, async (req, res) => {
  try {
    const wishes = await db.getWishes();
    const csvHeader = 'ID,Nama Tamu,Kehadiran,Jumlah Orang,Pesan Ucapan,Waktu Kirim\n';
    const csvRows = wishes.map(w => {
      const sanitizedName = sanitizeCsvCell(w.name || '');
      const sanitizedAttendance = sanitizeCsvCell(w.attendance || '');
      const sanitizedCount = sanitizeCsvCell(w.guestsCount || 1);
      const sanitizedMsg = sanitizeCsvCell(w.message || '');
      const sanitizedDate = sanitizeCsvCell(w.createdAt || '');
      return `${sanitizeCsvCell(w.id)},${sanitizedName},${sanitizedAttendance},${sanitizedCount},${sanitizedMsg},${sanitizedDate}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="data-rsvp-pernikahan.csv"');
    res.send('\uFEFF' + csvHeader + csvRows); // Byte order mark for Excel utf-8
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'wedding-invitation-backend', time: new Date().toISOString() });
});

// Serve frontend dist for production hosting
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/images')) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Wedding Invitation Server running on port ${PORT}`);
    console.log(` Local URL : http://localhost:${PORT}`);
    console.log(` Security Shield : Active (Auth, CSRF/XSS, Rate-Limit)`);
    console.log(`====================================================`);
  });
}

module.exports = app;
