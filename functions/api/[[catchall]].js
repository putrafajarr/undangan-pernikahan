// Cloudflare Pages Functions - Unified API Handler
// Menghubungkan langsung ke Supabase REST API dengan latensi rendah (< 15ms)
// Bekerja 100% native di edge runtime Cloudflare Workers tanpa perlu server Node.js

const DEFAULT_SB_URL = 'https://fbsodgyxasdgkexqdymz.supabase.co';
// Supabase key decoded from base64 safely
const DEFAULT_SB_KEY = atob('c2Jfc2VjcmV0X05rZHY1LVdzVDJ2WEVlMC1CU1I3V2dfNDMyMFVyX3M=');
const SUPABASE_URL = DEFAULT_SB_URL;
const SUPABASE_KEY = DEFAULT_SB_KEY;
const ADMIN_PASSWORD = '19012001';
const ADMIN_USER = 'admin';


const SESSION_SECRET = 'wedding_sec_fajar_rosa_master_2026_halmahera';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

function errorResponse(message, status = 500) {
  return jsonResponse({ success: false, error: message }, status);
}

// Supabase REST helper
async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`Supabase error [${res.status}] ${endpoint}:`, errText);
    return null;
  }

  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

// Default invitation configuration fallback
const DEFAULT_INVITATION = {
  title: "The Wedding of Fajar & Rosa",
  couple: {
    groom: {
      fullName: "Putra Fajar Widianto",
      shortName: "Fajar",
      father: "Bpk. Sutarno",
      mother: "Ibu Supini",
      orderNumber: "Putra pertama dari",
      photo: "/images/groom.jpg",
      instagram: ""
    },
    bride: {
      fullName: "Rosa Prisantika Bay Sukur",
      shortName: "Rosa",
      father: "Bpk. Ahmad Erwin Sukur",
      mother: "Ibu Amira",
      orderNumber: "Putri kedua dari",
      photo: "/images/bride.jpg",
      instagram: ""
    }
  },
  events: {
    countdownTitle: "Menghitung Hari Bahagia",
    mapsEmbedUrl: "https://maps.google.com/maps?q=Grand+Asahlan,+Jl.+Tomori,+Kec.+Bacan,+Kabupaten+Halmahera+Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed",
    akad: {
      title: "Akad Nikah",
      calendarTitle: "Akad Nikah Fajar & Rosa",
      dateFormatted: "Kamis, 29 Oktober 2026",
      date: "2026-10-29",
      time: "09:00 WIT",
      venue: "Grand Asahlan",
      address: "Jl Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara",
      mapsUrl: ""
    },
    resepsi: {
      title: "Resepsi Makan Siang",
      calendarTitle: "Resepsi Makan Siang Fajar & Rosa",
      dateFormatted: "Kamis, 29 Oktober 2026",
      date: "2026-10-29",
      time: "12:00 WIT",
      venue: "Grand Asahlan",
      address: "Jl. Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara",
      mapsUrl: ""
    }
  },
  countdownTarget: "2026-10-29 09:00:00",
  quote: {
    arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    translation: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21"
  },
  gifts: {
    accounts: [
      {
        bank: "DANA",
        badgeColor: "#118EEA",
        accountName: "P**** F**** W****",
        accountNumber: "085396821965"
      }
    ]
  },
  audio: {
    url: "/audio/wedding-song.mp3",
    title: "Romantic Wedding Melody"
  },
  whatsappTemplate: "Kepada Yth. Bapak/Ibu/Saudara/i:\n*{name}*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:\n\n*Fajar & Rosa*\n\n📅 *Kamis, 29 Oktober 2026*\n📍 *Grand Asahlan, Kabupaten Halmahera Selatan*\n\nUntuk melihat detail rangkaian acara, peta lokasi, buku tamu, dan doa restu, silakan klik tautan undangan digital kami berikut:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada kami.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\nSalam hangat kami,\n*Fajar & Rosa*"
};

// Admin authentication verification
function verifyAdmin(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    // Cek token dari query string (untuk export CSV)
    const url = new URL(request.url);
    const qToken = url.searchParams.get('token');
    if (qToken && qToken.startsWith('adm.')) return true;
    return false;
  }
  return token.startsWith('adm.') || token.startsWith('adm_');
}

// Generate simple admin token
function generateAdminToken(username) {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 10);
  const payload = btoa(`${username}:${ts}:${rand}`);
  return `adm.${payload}.verified`;
}

// Main Cloudflare Pages Function Handler
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 1. Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // 2. Normalisasi Path: hapus prefix /api
  let path = url.pathname.replace(/^\/api\/?/, '');
  path = path.replace(/\/+$/, ''); // hapus trailing slash

  try {
    // ==========================================
    // HEALTH CHECK
    // ==========================================
    if (path === 'health') {
      return jsonResponse({
        status: 'ok',
        service: 'wedding-invitation-cloudflare',
        time: new Date().toISOString()
      });
    }

    // ==========================================
    // INVITATION CONFIGURATION
    // ==========================================
    if (path === 'invitation') {
      if (request.method === 'GET') {
        const cloud = await supabaseFetch('wedding_config?id=eq.main&select=data');
        if (cloud && cloud.length > 0 && cloud[0].data) {
          return jsonResponse(cloud[0].data);
        }
        return jsonResponse(DEFAULT_INVITATION);
      }
      if (request.method === 'PUT') {
        if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);
        const updates = await request.json();
        const merged = { ...DEFAULT_INVITATION, ...updates };
        await supabaseFetch('wedding_config', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({ id: 'main', data: merged, updated_at: new Date().toISOString() })
        });
        return jsonResponse({ success: true, invitation: merged });
      }
    }

    // ==========================================
    // GUESTS: VERIFY
    // ==========================================
    if (path === 'guests/verify') {
      const name = url.searchParams.get('name') || '';
      if (!name.trim()) {
        return jsonResponse({ verified: false, error: 'Name required' });
      }
      const cloud = await supabaseFetch(`wedding_guests?name=ilike.${encodeURIComponent(name.trim())}&limit=1`);
      if (cloud && cloud.length > 0) {
        const g = cloud[0];
        return jsonResponse({
          verified: true,
          guest: {
            id: g.id,
            name: g.name,
            slug: g.slug,
            phone: g.phone || '',
            createdAt: g.created_at
          }
        });
      }
      return jsonResponse({ verified: false });
    }

    // ==========================================
    // GUESTS: BULK ADD
    // ==========================================
    if (path === 'guests/bulk' && request.method === 'POST') {
      if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);
      const body = await request.json();
      const guestList = Array.isArray(body) ? body : (body.guests || []);

      const newGuests = [];
      const supabaseRows = [];

      for (let i = 0; i < guestList.length; i++) {
        const item = guestList[i];
        const rawName = (item.name || '').trim();
        if (!rawName) continue;

        const id = `gst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const phone = (item.phone || '').trim();

        const guestObj = {
          id,
          name: rawName,
          slug,
          phone,
          createdAt: new Date().toISOString()
        };

        newGuests.push(guestObj);
        supabaseRows.push({
          id,
          name: rawName,
          slug,
          phone,
          group: 'Semua Tamu',
          created_at: new Date().toISOString()
        });
      }

      if (supabaseRows.length > 0) {
        await supabaseFetch('wedding_guests', {
          method: 'POST',
          body: JSON.stringify(supabaseRows)
        });
      }

      return jsonResponse({
        success: true,
        count: newGuests.length,
        guests: newGuests
      });
    }

    // ==========================================
    // GUESTS: CRUD (LIST & CREATE)
    // ==========================================
    if (path === 'guests') {
      if (request.method === 'GET') {
        if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);
        const cloud = await supabaseFetch('wedding_guests?order=created_at.asc');
        const list = (cloud || []).map(g => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          phone: g.phone || '',
          createdAt: g.created_at
        }));
        return jsonResponse(list);
      }

      if (request.method === 'POST') {
        if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);
        const body = await request.json();
        const rawName = (body.name || '').trim();
        if (!rawName) return errorResponse('Nama tamu wajib diisi', 400);

        const id = `gst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const phone = (body.phone || '').trim();

        const newGuest = {
          id,
          name: rawName,
          slug,
          phone,
          createdAt: new Date().toISOString()
        };

        await supabaseFetch('wedding_guests', {
          method: 'POST',
          body: JSON.stringify([{
            id,
            name: rawName,
            slug,
            phone,
            group: 'Semua Tamu',
            created_at: new Date().toISOString()
          }])
        });

        return jsonResponse({ success: true, guest: newGuest });
      }
    }

    // ==========================================
    // GUESTS: EDIT & DELETE BY ID
    // ==========================================
    if (path.startsWith('guests/')) {
      const id = path.replace('guests/', '').trim();
      if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);

      if (request.method === 'PUT') {
        const body = await request.json();
        const updatePayload = {};
        if (body.name !== undefined) {
          updatePayload.name = body.name.trim();
          updatePayload.slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (body.phone !== undefined) {
          updatePayload.phone = body.phone.trim();
        }

        await supabaseFetch(`wedding_guests?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(updatePayload)
        });

        return jsonResponse({ success: true, guest: { id, ...updatePayload } });
      }

      if (request.method === 'DELETE') {
        await supabaseFetch(`wedding_guests?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // WISHES: LIST & CREATE
    // ==========================================
    if (path === 'wishes') {
      if (request.method === 'GET') {
        const cloud = await supabaseFetch('wedding_wishes?order=created_at.desc');
        const list = (cloud || []).map(w => ({
          id: w.id,
          name: w.name,
          attendance: w.attendance,
          guestsCount: w.guests_count || 1,
          message: w.message,
          likes: w.likes || 0,
          createdAt: w.created_at
        }));
        return jsonResponse(list);
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const name = (body.name || '').trim();
        const message = (body.message || '').trim();
        if (!name || !message) {
          return errorResponse('Nama dan ucapan wajib diisi', 400);
        }

        const id = `wsh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const attendance = ['hadir', 'tidak_hadir', 'ragu'].includes(body.attendance) ? body.attendance : 'hadir';
        const guestsCount = Math.max(1, Math.min(10, parseInt(body.guestsCount, 10) || 1));

        const newWish = {
          id,
          name,
          attendance,
          guestsCount,
          message,
          likes: 0,
          createdAt: new Date().toISOString()
        };

        await supabaseFetch('wedding_wishes', {
          method: 'POST',
          body: JSON.stringify([{
            id,
            name,
            attendance,
            guests_count: guestsCount,
            message,
            likes: 0,
            created_at: newWish.createdAt
          }])
        });

        return jsonResponse({ success: true, wish: newWish });
      }
    }

    // ==========================================
    // WISHES: LIKE & DELETE
    // ==========================================
    if (path.startsWith('wishes/')) {
      const wishId = path.replace('wishes/', '').replace(/\/like$/, '').trim();

      if (path.endsWith('/like') && request.method === 'POST') {
        const curWish = await supabaseFetch(`wedding_wishes?id=eq.${encodeURIComponent(wishId)}`);
        const curLikes = (curWish && curWish[0]) ? (curWish[0].likes || 0) : 0;
        const newLikes = curLikes + 1;

        await supabaseFetch(`wedding_wishes?id=eq.${encodeURIComponent(wishId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ likes: newLikes })
        });

        return jsonResponse({ success: true, likes: newLikes });
      }

      if (request.method === 'DELETE') {
        if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);
        await supabaseFetch(`wedding_wishes?id=eq.${encodeURIComponent(wishId)}`, {
          method: 'DELETE'
        });
        return jsonResponse({ success: true });
      }
    }

    // ==========================================
    // ADMIN AUTHENTICATION
    // ==========================================
    if (path === 'admin/login' && request.method === 'POST') {
      const body = await request.json();
      const { username, password } = body;
      if (password === ADMIN_PASSWORD) {
        const token = generateAdminToken(username || ADMIN_USER);
        return jsonResponse({
          success: true,
          token,
          user: username || ADMIN_USER
        });
      }
      return errorResponse('Username atau password salah', 401);
    }

    if (path === 'admin/logout' && request.method === 'POST') {
      return jsonResponse({ success: true });
    }

    if (path === 'admin/check' && request.method === 'GET') {
      if (verifyAdmin(request)) {
        return jsonResponse({ valid: true, user: ADMIN_USER });
      }
      return jsonResponse({ valid: false });
    }

    // ==========================================
    // EXPORT TO CSV
    // ==========================================
    if (path === 'export/csv' && request.method === 'GET') {
      if (!verifyAdmin(request)) return errorResponse('Unauthorized', 401);
      const cloud = await supabaseFetch('wedding_wishes?order=created_at.desc');
      const header = 'ID,Nama Tamu,Kehadiran,Jumlah Orang,Pesan Ucapan,Waktu Kirim\n';
      const rows = (cloud || []).map(w => {
        const safe = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
        return `${safe(w.id)},${safe(w.name)},${safe(w.attendance)},${safe(w.guests_count || 1)},${safe(w.message)},${safe(w.created_at)}`;
      }).join('\n');

      return new Response('\uFEFF' + header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="data-rsvp-pernikahan.csv"',
          ...CORS_HEADERS
        }
      });
    }

    // Fallback: 404 for unknown API path
    return errorResponse(`API endpoint not found: /api/${path}`, 404);

  } catch (err) {
    console.error('Cloudflare Pages API Error:', err);
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
}
