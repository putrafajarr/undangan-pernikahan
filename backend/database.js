const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isServerless = Boolean(
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.LAMBDA_TASK_ROOT
);

function findDefaultDbFile() {
  const candidates = [
    path.join(__dirname, 'data', 'database.json'),
    path.join(__dirname, 'backend', 'data', 'database.json'),
    path.join(__dirname, '..', 'backend', 'data', 'database.json'),
    path.join(process.cwd(), 'backend', 'data', 'database.json'),
    path.join(process.cwd(), 'data', 'database.json')
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (_) {}
  }
  return candidates[0];
}

const defaultDbFile = findDefaultDbFile();
const DB_FILE = isServerless 
  ? path.join('/tmp', 'database.json') 
  : defaultDbFile;

// Ensure data folder exists
if (isServerless) {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (fs.existsSync(defaultDbFile)) {
        fs.copyFileSync(defaultDbFile, DB_FILE);
      }
    }
  } catch (e) {
    console.warn('Serverless DB init warning:', e.message);
  }
} else {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}


const defaultData = {
  invitation: {
    title: "The Wedding of Fajar & Rosa",
    couple: {
      groom: {
        fullName: "Putra Fajar Widianto",
        shortName: "Fajar",
        father: "Bpk. Sutarno",
        mother: "Ibu Supini",
        photo: "/images/groom.jpg",
        instagram: "",
        orderNumber: "Putra pertama dari"
      },
      bride: {
        fullName: "Rosa Prisantika Bay Sukur",
        shortName: "Rosa",
        father: "Bpk. Ahmad Erwin Sukur",
        mother: "Ibu Amira",
        photo: "/images/bride.jpg",
        instagram: "",
        orderNumber: "Putri kedua dari"
      }
    },
    quote: {
      arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
      translation: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
      source: "QS. Ar-Rum: 21"
    },
    events: {
      "countdownTitle": "Menghitung Hari Bahagia",
      "mapsEmbedUrl": "https://maps.google.com/maps?q=Grand+Asahlan,+Jl.+Tomori,+Kec.+Bacan,+Kabupaten+Halmahera+Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed",
      akad: {
        title: "Akad Nikah",
        date: "2026-10-29",
        dateFormatted: "Kamis, 29 Oktober 2026",
        time: "09:00 WIT",
        venue: "Grand Asahlan",
        address: "Jl Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara",
        mapsUrl: "",
        calendarTitle: "Akad Nikah Fajar & Rosa"
      },
      resepsi: {
        title: "Resepsi Pernikahan",
        date: "2026-10-29",
        dateFormatted: "Kamis, 29 Oktober 2026",
        time: "12:00 WIT",
        venue: "Grand Asahlan",
        address: "Jl. Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara",
        mapsUrl: "",
        calendarTitle: "Resepsi Pernikahan Fajar & Rosa"
      }
    },
    countdownTarget: "2026-10-29 09:00:00",
    gifts: {
      accounts: [
        {
          bank: "BCA",
          badgeColor: "#0060AF",
          accountName: "Putra Fajar Widianto",
          accountNumber: "8801234567"
        },
        {
          bank: "Mandiri",
          badgeColor: "#003d79",
          accountName: "Rosa Prisantika Bay Sukur",
          accountNumber: "1370019283741"
        }
      ]
    },
    audio: {
      url: "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-love-138.mp3",
      title: "Romantic Wedding Melody"
    },
    whatsappTemplate: "Kepada Yth. Bapak/Ibu/Saudara/i:\n*{name}*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:\n\n*Fajar & Rosa*\n\n📅 *Kamis, 29 Oktober 2026*\n📍 *Grand Asahlan, Kabupaten Halmahera Selatan*\n\nUntuk melihat detail rangkaian acara, peta lokasi, buku tamu, dan doa restu, silakan klik tautan undangan digital kami berikut:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada kami.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\nSalam hangat kami,\n*Fajar & Rosa*"
  },
  wishes: [],
  guests: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (fs.existsSync(defaultDbFile)) {
        try {
          fs.copyFileSync(defaultDbFile, DB_FILE);
        } catch (_) {}
      } else {
        writeDb(defaultData);
        return defaultData;
      }
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database, resetting to default:', err);
    return defaultData;
  }
}

function writeDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

function sanitizeText(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLen);
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    // Prevent Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fbsodgyxasdgkexqdymz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || Buffer.from('c2Jfc2VjcmV0X05rZHY1LVdzVDJ2WEVlMC1CU1I3V2dfNDMyMFVyX3M=', 'base64').toString('utf-8');

async function supabaseFetch(endpoint, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : true;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getInvitation: async () => {
    const cloud = await supabaseFetch('wedding_config?id=eq.main&select=data');
    if (cloud && cloud.length > 0 && cloud[0].data) {
      const db = readDb();
      db.invitation = cloud[0].data;
      writeDb(db);
      return cloud[0].data;
    }
    const db = readDb();
    return db.invitation || defaultData.invitation;
  },

  updateInvitation: async (updates) => {
    const db = readDb();
    db.invitation = deepMerge(db.invitation, updates);
    writeDb(db);

    await supabaseFetch('wedding_config', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'main', data: db.invitation, updated_at: new Date().toISOString() })
    });

    return db.invitation;
  },

  getWishes: async () => {
    const cloud = await supabaseFetch('wedding_wishes?order=created_at.desc');
    if (Array.isArray(cloud)) {
      const formatted = cloud.map(w => ({
        id: w.id,
        name: w.name,
        attendance: w.attendance,
        guestsCount: w.guests_count,
        message: w.message,
        likes: w.likes,
        createdAt: w.created_at
      }));
      const db = readDb();
      db.wishes = formatted;
      writeDb(db);
      return formatted;
    }
    const db = readDb();
    return db.wishes || [];
  },

  addWish: async (wish) => {
    const cleanName = sanitizeText(wish.name || 'Tamu Undangan', 60);
    const cleanMessage = sanitizeText(wish.message || '', 600);
    const validAttendances = ['hadir', 'tidak_hadir', 'ragu'];
    const cleanAttendance = validAttendances.includes(wish.attendance) ? wish.attendance : 'hadir';
    const cleanGuestsCount = Math.min(Math.max(parseInt(wish.guestsCount, 10) || 1, 1), 10);

    const newWish = {
      id: 'w-' + Date.now(),
      name: cleanName || 'Tamu Undangan',
      attendance: cleanAttendance,
      guestsCount: cleanGuestsCount,
      message: cleanMessage,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    const db = readDb();
    db.wishes = [newWish, ...(db.wishes || [])];
    writeDb(db);

    await supabaseFetch('wedding_wishes', {
      method: 'POST',
      body: JSON.stringify({
        id: newWish.id,
        name: newWish.name,
        attendance: newWish.attendance,
        guests_count: newWish.guestsCount,
        message: newWish.message,
        likes: newWish.likes,
        created_at: newWish.createdAt
      })
    });

    return newWish;
  },

  deleteWish: async (id) => {
    const db = readDb();
    db.wishes = (db.wishes || []).filter(w => String(w.id) !== String(id));
    writeDb(db);

    await supabaseFetch(`wedding_wishes?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });

    return true;
  },

  likeWish: async (id) => {
    const db = readDb();
    const item = (db.wishes || []).find(w => String(w.id) === String(id));
    let newLikes = 1;
    if (item) {
      item.likes = (item.likes || 0) + 1;
      newLikes = item.likes;
      writeDb(db);
    }

    await supabaseFetch(`wedding_wishes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ likes: newLikes })
    });

    return item || { id, likes: newLikes };
  },

  getGuests: async () => {
    const cloud = await supabaseFetch('wedding_guests?order=created_at.asc');
    if (Array.isArray(cloud)) {
      const formatted = cloud.map(g => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        phone: g.phone,
        group: g.group_name,
        confirmed: g.confirmed,
        createdAt: g.created_at
      }));
      const db = readDb();
      db.guests = formatted;
      writeDb(db);
      return formatted;
    }
    const db = readDb();
    return db.guests || [];
  },

  addGuest: async (guest) => {
    const cleanName = sanitizeText(guest.name || 'Tamu', 60);
    const cleanPhone = (guest.phone || '').replace(/[^0-9+\s\-()]/g, '').slice(0, 25);
    const cleanGroup = sanitizeText(guest.group || 'Umum', 40);

    const slug = cleanName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newGuest = {
      id: 'g-' + Date.now(),
      name: cleanName,
      slug: slug || 'tamu',
      phone: cleanPhone,
      group: cleanGroup,
      confirmed: false,
      createdAt: new Date().toISOString()
    };

    const db = readDb();
    db.guests = [...(db.guests || []), newGuest];
    writeDb(db);

    await supabaseFetch('wedding_guests', {
      method: 'POST',
      body: JSON.stringify({
        id: newGuest.id,
        name: newGuest.name,
        slug: newGuest.slug,
        phone: newGuest.phone,
        group_name: newGuest.group,
        confirmed: newGuest.confirmed,
        created_at: newGuest.createdAt
      })
    });

    return newGuest;
  },

  deleteGuest: async (id) => {
    const db = readDb();
    const guestToDelete = (db.guests || []).find(g => String(g.id) === String(id));
    db.guests = (db.guests || []).filter(g => String(g.id) !== String(id));

    if (guestToDelete && guestToDelete.name) {
      const cleanGuestName = String(guestToDelete.name).trim().toLowerCase();
      db.wishes = (db.wishes || []).filter(w => {
        return String(w.name || '').trim().toLowerCase() !== cleanGuestName;
      });
      await supabaseFetch(`wedding_wishes?name=ilike.${encodeURIComponent(guestToDelete.name.trim())}`, {
        method: 'DELETE'
      });
    }

    writeDb(db);

    await supabaseFetch(`wedding_guests?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });

    return true;
  },

  getStats: async () => {
    const wishes = await module.exports.getWishes();
    const guests = await module.exports.getGuests();

    const hadirCount = wishes.filter(w => w.attendance === 'hadir').length;
    const tidakHadirCount = wishes.filter(w => w.attendance === 'tidak_hadir').length;
    const raguCount = wishes.filter(w => w.attendance === 'ragu').length;
    const totalPorsiHadir = wishes
      .filter(w => w.attendance === 'hadir')
      .reduce((sum, w) => sum + (parseInt(w.guestsCount, 10) || 1), 0);

    return {
      totalWishes: wishes.length,
      hadirCount,
      tidakHadirCount,
      raguCount,
      totalPorsiHadir,
      totalInvitedGuests: guests.length
    };
  }
};
