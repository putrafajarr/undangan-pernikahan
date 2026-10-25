import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Heart, 
  Search, 
  Sparkles, 
  Clock, 
  Quote, 
  MessageSquareHeart,
  MessageCircle,
  Sparkle,
  Lock,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getApiUrl } from '../config/api';

export default function RsvpWishSection({ guestName, initialWishes = [] }) {
  const [wishes, setWishes] = useState(initialWishes);
  const [loading, setLoading] = useState(false);
  const [filterAttendance, setFilterAttendance] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Stored liked wish IDs in localStorage
  const [likedIds, setLikedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_liked_wishes') || '[]');
    } catch {
      return [];
    }
  });

  const isNameLocked = Boolean(guestName && guestName !== 'Tamu Undangan' && guestName.trim() !== '');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verifiedGuestGroup, setVerifiedGuestGroup] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: guestName || '',
    attendance: 'hadir',
    guestsCount: 1,
    message: ''
  });

  // Update name and verify if guestName changes
  useEffect(() => {
    if (guestName) {
      setFormData((prev) => ({ ...prev, name: guestName }));

      if (isNameLocked) {
        fetch(getApiUrl(`/api/guests/verify?name=${encodeURIComponent(guestName)}`))
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.verified) {
              setVerificationStatus('verified');
              setVerifiedGuestGroup(data.guest?.group || '');
            } else {
              setVerificationStatus('unregistered');
            }
          })
          .catch(() => {
            setVerificationStatus('idle');
          });
      }
    }
  }, [guestName, isNameLocked]);

  // Sync initialWishes if parent updates
  useEffect(() => {
    if (initialWishes && initialWishes.length > 0 && wishes.length === 0) {
      setWishes(initialWishes);
    }
  }, [initialWishes]);

  // Fetch wishes from backend API
  const fetchWishes = async () => {
    try {
      const res = await fetch(getApiUrl('/api/wishes'));
      const json = await res.json();
      if (json.success) {
        setWishes(json.data);
      }
    } catch (err) {
      console.warn('Backend wishes fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Quick wish templates
  const quickWishes = [
    "Barakallahu lakuma wa baraka 'alaikuma 🤲",
    "Selamat menempuh hidup baru Fajar & Rosa! 🎉",
    "Semoga sakinah, mawaddah, warahmah ✨",
    "Lancar acaranya dan langgeng selamanya 💍"
  ];

  const handleQuickWish = (text) => {
    setFormData((prev) => ({
      ...prev,
      message: prev.message ? `${prev.message.trim()} ${text}` : text
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      showToast('Mohon lengkapi nama dan doa/ucapan Anda', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/wishes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        showToast('Terima kasih atas konfirmasi dan doa restu Anda!');
        // Prepend new wish
        setWishes((prev) => [result.data, ...prev]);
        // Reset message but keep name
        setFormData((prev) => ({ ...prev, message: '' }));
      } else {
        showToast(result.message || 'Gagal mengirim ucapan', 'error');
      }
    } catch (err) {
      // Offline fallback: simulate local addition
      const localNew = {
        id: 'w-local-' + Date.now(),
        name: formData.name,
        attendance: formData.attendance,
        guestsCount: formData.guestsCount,
        relationship: '',
        message: formData.message,
        createdAt: new Date().toISOString(),
        likes: 0
      };
      setWishes((prev) => [localNew, ...prev]);
      showToast('Ucapan berhasil dicatat!');
      setFormData((prev) => ({ ...prev, message: '' }));
      confetti({ particleCount: 50, spread: 60 });
    } finally {
      setLoading(false);
    }
  };

  // Handle Like / Aamiin Toggle
  const handleLike = async (id) => {
    const isAlreadyLiked = likedIds.includes(id);

    if (isAlreadyLiked) {
      // Unlike
      const nextIds = likedIds.filter((item) => item !== id);
      setLikedIds(nextIds);
      try {
        localStorage.setItem('wedding_liked_wishes', JSON.stringify(nextIds));
      } catch {}
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, likes: Math.max(0, (w.likes || 1) - 1) } : w))
      );
    } else {
      // Like
      const nextIds = [...likedIds, id];
      setLikedIds(nextIds);
      try {
        localStorage.setItem('wedding_liked_wishes', JSON.stringify(nextIds));
      } catch {}
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, likes: (w.likes || 0) + 1 } : w))
      );

      try {
        await fetch(getApiUrl(`/api/wishes/${id}/like`), { method: 'POST' });
      } catch (err) {
        console.warn('Failed to like on backend:', err);
      }
    }
  };

  // Helper Initials
  const getInitials = (name) => {
    if (!name) return 'T';
    const clean = name.replace(/^(Bpk\.|Ibu|Drs\.|Dr\.|H\.|Hj\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (clean[0] || 'T').toUpperCase();
  };

  // Avatar Gradient Generator
  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
      'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      'linear-gradient(135deg, #0284c7 0%, #93c5fd 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Filter & Search Logic
  const filteredWishes = wishes.filter((item) => {
    const matchesFilter =
      filterAttendance === 'all' || item.attendance === filterAttendance;
    const matchesSearch =
      searchQuery === '' ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Relative Time Formatter
  const formatTime = (isoString) => {
    if (!isoString) return 'Baru saja';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;

      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Baru saja';
    }
  };

  const hadirCount = wishes.filter((w) => w.attendance === 'hadir').length;
  const tidakHadirCount = wishes.filter((w) => w.attendance === 'tidak_hadir').length;
  const raguCount = wishes.filter((w) => w.attendance === 'ragu').length;

  return (
    <section id="rsvp" className="rsvp-section">
      <div className="container">
        
        <div className="section-title-wrap">
          <span className="section-subtitle">Konfirmasi & Doa</span>
          <h2 className="section-title gold-gradient-text">Buku Tamu</h2>
          <div className="section-divider">
            <span className="line"></span>
            <span className="diamond"></span>
            <span className="line"></span>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className={`toast-alert ${toast.type}`}>
            <Sparkles size={16} />
            <span>{toast.message}</span>
          </div>
        )}

        {/* RSVP Form Card */}
        <div className="glass-card form-card">
          <h3 className="form-card-title font-serif">Kirim Doa Restu & Kehadiran</h3>
          <p className="form-card-subtitle">
            Merupakan suatu kehormatan bagi kami atas konfirmasi kehadiran dan doa tulus Anda
          </p>

          <form onSubmit={handleSubmit} className="rsvp-form">
            
            {/* Nama Tamu */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Nama Tamu Undangan</label>
                {isNameLocked && (
                  <span className={`guest-lock-status-pill ${verificationStatus}`}>
                    <Lock size={12} />
                    {verificationStatus === 'verified' ? (
                      <span>Tamu Terdaftar Resmi</span>
                    ) : verificationStatus === 'unregistered' ? (
                      <span>Terkunci dari Tautan</span>
                    ) : (
                      <span>Terkunci Otomatis</span>
                    )}
                  </span>
                )}
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className={`form-input ${isNameLocked ? 'form-input-locked' : ''}`}
                  placeholder="Contoh: Bapak Joko & Keluarga"
                  value={formData.name}
                  onChange={(e) => {
                    if (!isNameLocked) {
                      setFormData({ ...formData, name: e.target.value });
                    }
                  }}
                  readOnly={isNameLocked}
                  required
                />
                {isNameLocked && (
                  <div 
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: verificationStatus === 'verified' ? '#38bdf8' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}
                    title="Nama tamu telah terkunci sesuai tautan undangan dan tidak dapat diubah"
                  >
                    <Lock size={16} />
                  </div>
                )}
              </div>

              {isNameLocked ? (
                <p style={{ fontSize: '0.78rem', color: verificationStatus === 'verified' ? '#7dd3fc' : '#bae6fd', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🔒</span>
                  <span>Nama tamu terisi otomatis &amp; terkunci sesuai tautan undangan (tidak dapat diubah).</span>
                </p>
              ) : (
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Silakan tuliskan nama lengkap Anda atau keluarga yang mewakili.
                </p>
              )}
            </div>


            {/* Konfirmasi Kehadiran */}
            <div className="form-group">
              <label className="form-label">Konfirmasi Kehadiran</label>
              <div className="attendance-options">
                <label className={`radio-card ${formData.attendance === 'hadir' ? 'active hadir' : ''}`}>
                  <input
                    type="radio"
                    name="attendance"
                    value="hadir"
                    checked={formData.attendance === 'hadir'}
                    onChange={() => setFormData({ ...formData, attendance: 'hadir' })}
                  />
                  <CheckCircle2 size={18} />
                  <span>Ya, Saya Hadir</span>
                </label>

                <label className={`radio-card ${formData.attendance === 'tidak_hadir' ? 'active tidak' : ''}`}>
                  <input
                    type="radio"
                    name="attendance"
                    value="tidak_hadir"
                    checked={formData.attendance === 'tidak_hadir'}
                    onChange={() => setFormData({ ...formData, attendance: 'tidak_hadir' })}
                  />
                  <XCircle size={18} />
                  <span>Maaf, Berhalangan</span>
                </label>

                <label className={`radio-card ${formData.attendance === 'ragu' ? 'active ragu' : ''}`}>
                  <input
                    type="radio"
                    name="attendance"
                    value="ragu"
                    checked={formData.attendance === 'ragu'}
                    onChange={() => setFormData({ ...formData, attendance: 'ragu' })}
                  />
                  <HelpCircle size={18} />
                  <span>Masih Ragu</span>
                </label>
              </div>
            </div>

            {/* Ucapan Cepat Chips */}
            <div className="quick-wishes-wrap">
              <span className="quick-wishes-label">Pilihan Cepat Doa:</span>
              <div className="quick-wishes-chips">
                {quickWishes.map((txt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickWish(txt)}
                    className="quick-wish-chip"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Ucapan dan Doa */}
            <div className="form-group">
              <label className="form-label">Ucapan & Doa Restu</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold form-submit-btn"
              id="btn-submit-rsvp"
            >
              <Send size={16} />
              <span>{loading ? 'Mengirim...' : 'Kirim Ucapan & Konfirmasi'}</span>
            </button>
          </form>
        </div>

        {/* Wishes List (Ucapan Hangat) */}
        <div className="wishes-section-wrap">
          <div className="wishes-header-bar">
            <div className="wishes-title-group">
              <MessageSquareHeart size={22} className="wishes-icon-title text-gold" />
              <h4 className="wishes-count-title font-serif">
                Ucapan Hangat
              </h4>
              <span className="wishes-total-badge">{wishes.length}</span>
            </div>

            {/* Filter Tabs */}
            <div className="attendance-filter-tabs" role="tablist">
              <button
                className={`filter-tab ${filterAttendance === 'all' ? 'active' : ''}`}
                onClick={() => setFilterAttendance('all')}
                type="button"
              >
                <span>Semua</span>
                <span className="filter-count">{wishes.length}</span>
              </button>
              <button
                className={`filter-tab ${filterAttendance === 'hadir' ? 'active' : ''}`}
                onClick={() => setFilterAttendance('hadir')}
                type="button"
              >
                <span>Hadir</span>
                <span className="filter-count">{hadirCount}</span>
              </button>
              <button
                className={`filter-tab ${filterAttendance === 'tidak_hadir' ? 'active' : ''}`}
                onClick={() => setFilterAttendance('tidak_hadir')}
                type="button"
              >
                <span>Berhalangan</span>
                <span className="filter-count">{tidakHadirCount}</span>
              </button>
              <button
                className={`filter-tab ${filterAttendance === 'ragu' ? 'active' : ''}`}
                onClick={() => setFilterAttendance('ragu')}
                type="button"
              >
                <span>Ragu</span>
                <span className="filter-count">{raguCount}</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama atau isi ucapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Wishes Cards Feed */}
          <div className="wishes-feed">
            {filteredWishes.length === 0 ? (
              <div className="empty-wishes text-center">
                <MessageCircle size={36} className="empty-icon text-muted" />
                <p>Belum ada ucapan yang sesuai.</p>
                <span className="empty-hint">Jadilah yang pertama memberikan doa restu!</span>
              </div>
            ) : (
              filteredWishes.map((item) => {
                const isLiked = likedIds.includes(item.id);
                return (
                  <div key={item.id} className="wish-card">
                    <div className="wish-card-top">
                      <div className="wish-user-header">
                        <div 
                          className="wish-avatar"
                          style={{ background: getAvatarGradient(item.name) }}
                        >
                          <span>{getInitials(item.name)}</span>
                        </div>

                        <div className="wish-author-meta">
                          <div className="wish-author-row">
                            <h5 className="wish-author">{item.name}</h5>
                          </div>
                          <div className="wish-time-row">
                            <Clock size={11} className="time-icon" />
                            <span>{formatTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Badge with Icon */}
                      <div className={`wish-badge badge-${item.attendance}`}>
                        {item.attendance === 'hadir' && (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Hadir</span>
                          </>
                        )}
                        {item.attendance === 'tidak_hadir' && (
                          <>
                            <XCircle size={13} />
                            <span>Berhalangan</span>
                          </>
                        )}
                        {item.attendance === 'ragu' && (
                          <>
                            <HelpCircle size={13} />
                            <span>Ragu-ragu</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="wish-bubble">
                      <Quote size={13} className="bubble-quote-icon" />
                      <p className="wish-text">{item.message}</p>
                    </div>

                    <div className="wish-card-bottom">
                      <button
                        type="button"
                        onClick={() => handleLike(item.id)}
                        className={`wish-like-btn ${isLiked ? 'liked' : ''}`}
                        title={isLiked ? 'Anda menyukai doa ini' : 'Beri Aamiin / Suka'}
                      >
                        <Heart 
                          size={14} 
                          className={`heart-icon ${isLiked ? 'fill-pink' : ''}`}
                          fill={isLiked ? '#ff4b72' : 'none'} 
                        />
                        <span>{item.likes || 0} Aamiin</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      <style>{`
        .rsvp-section {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .toast-alert {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.9rem 1.6rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          animation: dropDown 0.35s ease;
        }

        .toast-alert.success {
          background: rgba(0, 48, 125, 0.96);
          border: 1px solid #7dd3fc;
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(0, 25, 75, 0.6), 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .toast-alert.error {
          background: #4a1919;
          border: 1px solid #ff7b7b;
          color: #fff;
        }

        @keyframes dropDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .form-card {
          padding: 2.5rem 1.8rem;
          margin-bottom: 3rem;
        }

        .form-card-title {
          font-size: 1.65rem;
          color: #ffffff;
          text-align: center;
          margin-bottom: 0.4rem;
        }

        .form-card-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .rsvp-form {
          display: flex;
          flex-direction: column;
          gap: 1.3rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gold-200);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.16);
          border: 1.5px solid #ffffff;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .form-input::placeholder, .form-textarea::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.22);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        }

        .form-input-locked {
          background: rgba(0, 30, 80, 0.55) !important;
          color: #ffffff !important;
          cursor: not-allowed !important;
          border: 1.5px solid rgba(147, 197, 253, 0.6) !important;
          font-weight: 700 !important;
          padding-right: 42px !important;
          user-select: none;
        }

        .guest-lock-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.22rem 0.65rem;
          border-radius: 20px;
          background: rgba(56, 189, 248, 0.2);
          border: 1px solid rgba(147, 197, 253, 0.6);
          color: #bae6fd;
        }

        .guest-lock-status-pill.verified {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(74, 222, 128, 0.6);
          color: #86efac;
        }

        .form-select option {
          background: #0045a5;
          color: #fff;
        }

        .attendance-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem;
        }

        .radio-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.8rem 0.4rem;
          border-radius: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.14);
          cursor: pointer;
          font-size: 0.78rem;
          color: #ffffff;
          font-weight: 600;
          text-align: center;
          transition: var(--transition-smooth);
        }

        .radio-card input {
          display: none;
        }

        .radio-card.active.hadir {
          background: rgba(40, 167, 69, 0.25);
          border-color: #28a745;
          color: #fff;
          box-shadow: 0 0 12px rgba(40, 167, 69, 0.3);
        }

        .radio-card.active.tidak {
          background: rgba(220, 53, 69, 0.25);
          border-color: #dc3545;
          color: #fff;
          box-shadow: 0 0 12px rgba(220, 53, 69, 0.3);
        }

        .radio-card.active.ragu {
          background: rgba(56, 189, 248, 0.25);
          border-color: #38bdf8;
          color: #fff;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        /* Quick Wishes Chips */
        .quick-wishes-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .quick-wishes-label {
          font-size: 0.78rem;
          color: #93c5fd;
          font-weight: 500;
        }

        .quick-wishes-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .quick-wish-chip {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(147, 197, 253, 0.3);
          color: #e0f2fe;
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .quick-wish-chip:hover {
          background: rgba(37, 99, 235, 0.35);
          border-color: #93c5fd;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .form-submit-btn {
          width: 100%;
          padding: 0.95rem;
          margin-top: 0.5rem;
        }

        /* Wishes List Styling */
        .wishes-section-wrap {
          margin-top: 2rem;
        }

        .wishes-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .wishes-title-group {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .wishes-icon-title {
          color: #60a5fa;
          flex-shrink: 0;
        }

        .wishes-count-title {
          font-size: 1.45rem;
          color: #ffffff;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
          white-space: nowrap;
        }

        .wishes-total-badge {
          background: linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%);
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: 50px;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .attendance-filter-tabs {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(5, 18, 45, 0.92);
          padding: 0.28rem;
          border-radius: 50px;
          border: 1px solid rgba(147, 197, 253, 0.35);
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          flex-wrap: nowrap;
          max-width: 100%;
        }

        .attendance-filter-tabs::-webkit-scrollbar {
          display: none;
        }

        .filter-tab {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.38rem 0.75rem;
          font-size: 0.76rem;
          border-radius: 50px;
          cursor: pointer;
          transition: var(--transition-smooth);
          white-space: nowrap;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .filter-count {
          font-size: 0.68rem;
          background: rgba(255, 255, 255, 0.15);
          padding: 0.08rem 0.42rem;
          border-radius: 50px;
          font-weight: 700;
          line-height: 1;
        }

        .filter-tab:hover {
          color: #ffffff;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
          color: #ffffff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
        }

        .filter-tab.active .filter-count {
          background: rgba(255, 255, 255, 0.3);
          color: #ffffff;
        }

        .search-bar {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #93c5fd;
        }

        .search-input {
          width: 100%;
          background: rgba(5, 18, 45, 0.9);
          border: 1px solid rgba(147, 197, 253, 0.35);
          border-radius: 50px;
          padding: 0.7rem 1rem 0.7rem 2.6rem;
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .wishes-feed {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 580px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .wishes-feed::-webkit-scrollbar {
          width: 6px;
        }
        .wishes-feed::-webkit-scrollbar-track {
          background: rgba(4, 15, 38, 0.5);
          border-radius: 4px;
        }
        .wishes-feed::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.4);
          border-radius: 4px;
        }
        .wishes-feed::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 197, 253, 0.8);
        }

        .empty-wishes {
          padding: 3rem 1.5rem;
          background: rgba(0, 45, 115, 0.6);
          border: 1px dashed rgba(255, 255, 255, 0.35);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .empty-icon {
          color: #60a5fa;
          margin-bottom: 0.4rem;
          opacity: 0.8;
        }

        .empty-hint {
          font-size: 0.78rem;
          color: #93c5fd;
        }

        /* Wish Card Card */
        .wish-card {
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          border-radius: 18px;
          padding: 1.35rem 1.35rem;
          box-shadow: 0 8px 24px rgba(0, 30, 80, 0.2);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .wish-card:hover {
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 30, 80, 0.25), 0 0 20px rgba(255, 255, 255, 0.35);
        }

        .wish-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .wish-user-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          flex: 1;
        }

        .wish-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          flex-shrink: 0;
        }

        .wish-author-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .wish-author-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .wish-author {
          font-size: 1.02rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .wish-relation-pill {
          font-size: 0.68rem;
          font-weight: 600;
          color: #bae6fd;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(147, 197, 253, 0.35);
          padding: 0.12rem 0.55rem;
          border-radius: 50px;
          display: inline-block;
        }

        .wish-time-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .time-icon {
          color: #64748b;
        }

        .wish-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.28rem 0.7rem;
          border-radius: 50px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .badge-hadir {
          background: rgba(40, 167, 69, 0.25);
          color: #75e695;
          border: 1px solid rgba(40, 167, 69, 0.55);
        }

        .badge-tidak_hadir {
          background: rgba(220, 53, 69, 0.22);
          color: #ffa4a4;
          border: 1px solid rgba(220, 53, 69, 0.45);
        }

        .badge-ragu {
          background: rgba(56, 189, 248, 0.22);
          color: #7dd3fc;
          border: 1px solid rgba(56, 189, 248, 0.45);
        }

        .wish-bubble {
          position: relative;
          background: rgba(4, 15, 38, 0.7);
          border: 1px solid rgba(147, 197, 253, 0.22);
          border-radius: 14px;
          padding: 0.95rem 1.1rem;
          margin-bottom: 0.8rem;
        }

        .bubble-quote-icon {
          position: absolute;
          top: 0.8rem;
          left: 0.85rem;
          color: rgba(96, 165, 250, 0.45);
        }

        .wish-text {
          font-size: 0.92rem;
          color: #f1f5f9;
          line-height: 1.65;
          white-space: pre-line;
          word-break: break-word;
          padding-left: 1.35rem;
        }

        .wish-card-bottom {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .wish-like-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(147, 197, 253, 0.3);
          color: #cbd5e1;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.32rem 0.8rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wish-like-btn:hover {
          background: rgba(255, 75, 114, 0.15);
          border-color: rgba(255, 75, 114, 0.5);
          color: #ff8ca3;
          transform: scale(1.03);
        }

        .wish-like-btn.liked {
          background: rgba(255, 75, 114, 0.2);
          border-color: #ff4b72;
          color: #ff8ca3;
        }

        .wish-like-btn .fill-pink {
          color: #ff4b72;
          filter: drop-shadow(0 0 6px rgba(255, 75, 114, 0.6));
        }

        @media (max-width: 540px) {
          .attendance-options {
            grid-template-columns: 1fr;
          }
          .wishes-header-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .wishes-title-group {
            width: 100%;
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            gap: 0.5rem;
            white-space: nowrap;
          }
          .wishes-count-title {
            font-size: 1.25rem;
          }
          .attendance-filter-tabs {
            width: 100%;
            padding: 0.25rem;
            justify-content: flex-start;
          }
          .filter-tab {
            flex: 1 0 auto;
            min-width: max-content;
            text-align: center;
            padding: 0.35rem 0.58rem;
            font-size: 0.72rem;
            gap: 0.28rem;
          }
          .filter-count {
            font-size: 0.64rem;
            padding: 0.06rem 0.35rem;
          }
          .wish-card-top {
            flex-direction: column;
            align-items: flex-start;
          }
          .wish-badge {
            align-self: flex-start;
          }
        }

        @media (max-width: 380px) {
          .wishes-count-title {
            font-size: 1.15rem;
          }
          .filter-tab {
            padding: 0.3rem 0.46rem;
            font-size: 0.68rem;
            gap: 0.22rem;
          }
          .filter-count {
            font-size: 0.6rem;
            padding: 0.05rem 0.3rem;
          }
        }
      `}</style>
    </section>
  );
}
