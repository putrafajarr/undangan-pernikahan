const fs = require('fs');
const path = require('path');

const isServerless = Boolean(
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.LAMBDA_TASK_ROOT
);

const defaultDbFile = path.join(__dirname, 'data', 'database.json');
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
  const dataDir = path.join(__dirname, 'data');
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
    countdownTarget: "2026-10-29T09:00:00+09:00",
    loveStories: [
      {
        id: 1,
        year: "2021",
        title: "Awal Pertemuan",
        story: "Takdir mempertemukan kami saat kegiatan sosial kampus. Sebuah percakapan sederhana tentang cita-cita menjadi pintu awal kisah indah ini."
      },
      {
        id: 2,
        year: "2023",
        title: "Mulai Berkomitmen",
        story: "Setelah saling mengenal karakter, nilai kehidupan, dan impian masa depan, kami bersepakat melangkah dalam ikatan yang lebih serius dengan restu keluarga."
      },
      {
        id: 3,
        year: "2025",
        title: "Momen Lamaran",
        story: "Dengan penuh rasa syukur dan haru, di hadapan kedua keluarga besar, kami mengikrarkan janji pertunangan untuk melangkah ke jenjang pernikahan."
      },
      {
        id: 4,
        year: "2026",
        title: "Hari Bahagia Menuju Halal",
        story: "Bismillah, dengan mengharap ridho Allah SWT, kami menyempurnakan separuh agama dalam ikatan suci pernikahan."
      }
    ],
    gallery: [
      { id: 1, url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", caption: "Cinta Dalam Doa" },
      { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", caption: "Langkah Bersama" },
      { id: 3, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", caption: "Senyum Bahagia" },
      { id: 4, url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80", caption: "Janji Suci" },
      { id: 5, url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80", caption: "Hari Penuh Haru" },
      { id: 6, url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80", caption: "Hingga Ke Surga-Nya" }
    ],
    gifts: {
      accounts: [
        {
          bank: "BCA",
          accountNumber: "8801234567",
          accountName: "Putra Fajar Widianto",
          badgeColor: "#0060AF"
        },
        {
          bank: "Mandiri",
          accountNumber: "1370019283741",
          accountName: "Rosa Prisantika Bay Sukur",
          badgeColor: "#003d79"
        },
        {
          bank: "BSI (Bank Syariah Indonesia)",
          accountNumber: "7198273645",
          accountName: "Fajar & Rosa",
          badgeColor: "#00A39D"
        }
      ]
    },
    audio: {
      url: "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-love-138.mp3",
      title: "Romantic Wedding Melody"
    },
    whatsappTemplate: "Kepada Yth. Bapak/Ibu/Saudara/i:\n*{name}*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:\n\n*Fajar & Rosa*\n\n📅 *Kamis, 29 Oktober 2026*\n📍 *Grand Asahlan, Kabupaten Halmahera Selatan*\n\nUntuk melihat detail rangkaian acara, peta lokasi, buku tamu, dan doa restu, silakan klik tautan undangan digital kami berikut:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada kami.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\nSalam hangat kami,\n*Fajar & Rosa*"
  },
  wishes: [
    {
      id: "w-1",
      name: "Drs. H. Mulyadi & Ibu",
      attendance: "hadir",
      guestsCount: 1,
      message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fi khair. Selamat menempuh hidup baru untuk ananda Fajar dan Rosa, semoga menjadi keluarga sakinah, mawaddah, warahmah.",
      createdAt: "2026-10-18T10:30:00Z",
      likes: 12
    },
    {
      id: "w-2",
      name: "Dimas Anggara & Rekan Kerja",
      attendance: "hadir",
      guestsCount: 1,
      message: "Selamat ya Bro Fajar & Rosa! Akhirnya hari bahagia yang dinanti tiba juga. Lancar sampai hari H, semoga bahagia dan langgeng selamanya!",
      createdAt: "2026-10-19T08:15:00Z",
      likes: 8
    },
    {
      id: "w-3",
      name: "Annisa Larasati",
      attendance: "hadir",
      guestsCount: 1,
      message: "Aaaa selamat Rosa sahabatku tersayang! Terharu banget melihat kalian melangkah ke jenjang pernikahan. Happy wedding beautiful bride!",
      createdAt: "2026-10-19T14:40:00Z",
      likes: 15
    },
    {
      id: "w-4",
      name: "Budi Santoso, S.T.",
      attendance: "tidak_hadir",
      guestsCount: 0,
      message: "Mohon maaf Fajar & Rosa, bertepatan dengan agenda di luar kota sehingga berhalangan hadir langsung. Doa terbaik untuk keberkahan pernikahan kalian berdua.",
      createdAt: "2026-10-20T09:00:00Z",
      likes: 5
    }
  ],
  guests: [
    {
      id: "g-1",
      name: "Bapak Joko & Keluarga",
      slug: "bapak-joko-dan-keluarga",
      phone: "081234567890",
      group: "Keluarga",
      confirmed: true
    },
    {
      id: "g-2",
      name: "Dimas Anggara",
      slug: "dimas-anggara",
      phone: "081298765432",
      group: "Rekan Kerja",
      confirmed: true
    },
    {
      id: "g-3",
      name: "Annisa Larasati",
      slug: "annisa-larasati",
      phone: "081377889900",
      group: "Sahabat",
      confirmed: true
    },
    {
      id: "g-4",
      name: "dr. Hendrawan & Istri",
      slug: "dr-hendrawan-dan-istri",
      phone: "081566778899",
      group: "Keluarga",
      confirmed: false
    }
  ]
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

module.exports = {
  getInvitation: () => {
    const db = readDb();
    return db.invitation;
  },

  updateInvitation: (updates) => {
    const db = readDb();
    db.invitation = deepMerge(db.invitation, updates);
    writeDb(db);
    return db.invitation;
  },

  getWishes: () => {
    const db = readDb();
    return db.wishes || [];
  },

  addWish: (wish) => {
    const db = readDb();
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
    db.wishes = [newWish, ...(db.wishes || [])];
    writeDb(db);
    return newWish;
  },

  deleteWish: (id) => {
    const db = readDb();
    const initialLen = db.wishes.length;
    db.wishes = db.wishes.filter(w => w.id !== id);
    writeDb(db);
    return db.wishes.length < initialLen;
  },

  likeWish: (id) => {
    const db = readDb();
    const item = (db.wishes || []).find(w => w.id === id);
    if (item) {
      item.likes = (item.likes || 0) + 1;
      writeDb(db);
      return item;
    }
    return null;
  },

  getGuests: () => {
    const db = readDb();
    return db.guests || [];
  },

  addGuest: (guest) => {
    const db = readDb();
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
    db.guests = [...(db.guests || []), newGuest];
    writeDb(db);
    return newGuest;
  },

  deleteGuest: (id) => {
    const db = readDb();
    const initialLen = db.guests.length;
    db.guests = db.guests.filter(g => g.id !== id);
    writeDb(db);
    return db.guests.length < initialLen;
  },

  getStats: () => {
    const db = readDb();
    const wishes = db.wishes || [];
    const guests = db.guests || [];

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
