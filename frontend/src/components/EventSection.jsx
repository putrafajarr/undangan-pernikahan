import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Navigation, CalendarPlus, ExternalLink, Sparkles } from 'lucide-react';

export default function EventSection({ events, countdownTarget }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const akad = events?.akad || {
    title: "Akad Nikah",
    dateFormatted: "Kamis, 29 Oktober 2026",
    time: "09:00 WIT",
    venue: "Grand Asahlan",
    address: "Jl Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara",
    mapsUrl: "https://maps.app.goo.gl/zKFEurXn9iAyvT4h6"
  };

  const resepsi = events?.resepsi || {
    title: "Resepsi Pernikahan",
    dateFormatted: "Kamis, 29 Oktober 2026",
    time: "12:00 WIT",
    venue: "Grand Asahlan",
    address: "Jl. Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara",
    mapsUrl: "https://maps.app.goo.gl/zKFEurXn9iAyvT4h6"
  };

  // Dynamic Map Embed Resolver
  const getEmbedMapUrl = () => {
    // 1. Explicit embed URL configured in events (or resepsi / akad)
    const customEmbed = events?.mapsEmbedUrl || events?.resepsi?.mapsEmbedUrl || events?.akad?.mapsEmbedUrl;
    if (customEmbed && typeof customEmbed === 'string' && customEmbed.trim()) {
      const trimmed = customEmbed.trim();
      const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
      if (iframeMatch) return iframeMatch[1];
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    }

    // 2. Check if mapsUrl contains coordinates (@lat,lng or q=lat,lng)
    const targetMapsUrl = resepsi?.mapsUrl || akad?.mapsUrl || '';
    if (targetMapsUrl) {
      const coordMatch = targetMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
      }
    }

    // 3. Fallback: Automatically generate embed from venue and address
    const targetVenue = resepsi?.venue || akad?.venue || '';
    const targetAddress = resepsi?.address || akad?.address || '';
    const locationQuery = [targetVenue, targetAddress].filter(Boolean).join(', ');

    if (locationQuery) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // 4. Default fallback
    return "https://maps.google.com/maps?q=Grand+Asahlan,+Halmahera+Selatan&t=&z=16&ie=UTF8&iwloc=&output=embed";
  };

  useEffect(() => {
    let targetStr = (countdownTarget || "2026-10-29T09:00:00+09:00").toString().trim();
    // Jika format sederhana tanpa offset (misal: "2026-10-29 09:00" atau "2026-10-29T09:00"), kunci otomatis ke WIT (+09:00)
    if (!targetStr.includes('+') && !targetStr.includes('Z') && !targetStr.slice(10).includes('-')) {
      const normalized = targetStr.replace(' ', 'T');
      const withSeconds = normalized.split(':').length === 2 ? `${normalized}:00` : normalized;
      targetStr = `${withSeconds}+09:00`;
    }
    const target = new Date(targetStr).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  // Google Calendar URL Generator
  const createGoogleCalendarLink = (title, venue, address) => {
    const text = encodeURIComponent(title);
    const details = encodeURIComponent(`Menghadiri ${title} Fajar & Rosa di ${venue}`);
    const location = encodeURIComponent(`${venue || ''}, ${address || ''}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  };

  return (
    <section id="event" className="event-section">
      <div className="container">
        
        <div className="section-title-wrap">
          <span className="section-subtitle">Waktu & Tempat</span>
          <h2 className="section-title gold-gradient-text">Rangkaian Acara</h2>
          <div className="section-divider">
            <span className="line"></span>
            <span className="diamond"></span>
            <span className="line"></span>
          </div>
        </div>

        {/* Live Countdown Box */}
        <div className="glass-card countdown-card">
          <h3 className="countdown-headline font-serif">{events?.countdownTitle || "Menghitung Hari Bahagia"}</h3>
          
          <div className="countdown-grid">
            <div className="countdown-col">
              <div className="countdown-box">
                <span className="countdown-num">{String(timeLeft.days).padStart(2, '0')}</span>
              </div>
              <span className="countdown-lbl">Hari</span>
            </div>
            <div className="countdown-col">
              <div className="countdown-box">
                <span className="countdown-num">{String(timeLeft.hours).padStart(2, '0')}</span>
              </div>
              <span className="countdown-lbl">Jam</span>
            </div>
            <div className="countdown-col">
              <div className="countdown-box">
                <span className="countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
              </div>
              <span className="countdown-lbl">Menit</span>
            </div>
            <div className="countdown-col">
              <div className="countdown-box">
                <span className="countdown-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
              <span className="countdown-lbl">Detik</span>
            </div>
          </div>
        </div>

        {/* Event Cards */}
        <div className="events-wrapper">
          
          {/* Akad Nikah */}
          <div className="glass-card event-card">
            <div className="event-header">
              <div className="event-badge font-serif">Ijab Qabul</div>
              <h3 className="event-title font-serif">{akad.title}</h3>
            </div>

            <div className="event-body">
              <div className="event-info-item">
                <Calendar size={18} className="text-gold" />
                <span>{akad.dateFormatted}</span>
              </div>

              <div className="event-info-item">
                <Clock size={18} className="text-gold" />
                <span>{akad.time}</span>
              </div>

              <div className="event-info-item venue-item">
                <MapPin size={18} className="text-gold" />
                <div>
                  <strong className="venue-name">{akad.venue}</strong>
                  <p className="venue-address">{akad.address}</p>
                </div>
              </div>
            </div>

            <div className="event-actions">
              <a
                href={createGoogleCalendarLink(akad.title, akad.venue, akad.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold event-btn"
              >
                <CalendarPlus size={15} />
                <span>Simpan ke Kalender</span>
              </a>
            </div>
          </div>

          {/* Resepsi Pernikahan */}
          <div className="glass-card event-card">
            <div className="event-header">
              <div className="event-badge font-serif">Walimatul 'Urs</div>
              <h3 className="event-title font-serif">{resepsi.title}</h3>
            </div>

            <div className="event-body">
              <div className="event-info-item">
                <Calendar size={18} className="text-gold" />
                <span>{resepsi.dateFormatted}</span>
              </div>

              <div className="event-info-item">
                <Clock size={18} className="text-gold" />
                <span>{resepsi.time}</span>
              </div>

              <div className="event-info-item venue-item">
                <MapPin size={18} className="text-gold" />
                <div>
                  <strong className="venue-name">{resepsi.venue}</strong>
                  <p className="venue-address">{resepsi.address}</p>
                </div>
              </div>
            </div>

            <div className="event-actions">
              <a
                href={createGoogleCalendarLink(resepsi.title, resepsi.venue, resepsi.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold event-btn"
              >
                <CalendarPlus size={15} />
                <span>Simpan ke Kalender</span>
              </a>
            </div>
          </div>

        </div>

        {/* Embedded Map Section */}
        <div className="glass-card map-card">
          <div className="map-card-header">
            <div className="map-icon-badge">
              <MapPin size={22} className="text-gold" />
            </div>
            <div>
              <h4 className="map-title font-serif">Petunjuk Arah & Peta Lokasi</h4>
              <p className="map-subtitle">Navigasi langsung menuju lokasi rangkaian acara pernikahan</p>
            </div>
          </div>

          <div className="map-venue-highlight">
            <span className="venue-highlight-badge">Lokasi Acara</span>
            <strong className="venue-highlight-name">{resepsi.venue || akad.venue}</strong>
            <p className="venue-highlight-address">{resepsi.address || akad.address}</p>
          </div>

          <div className="map-frame-wrapper">
            <iframe 
              title="Peta Lokasi Pernikahan"
              src={getEmbedMapUrl()}
              width="100%" 
              height="320" 
              style={{ border: 0, borderRadius: '14px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="map-action-wrap">
            <a
              href={resepsi.mapsUrl || akad.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((resepsi.venue || akad.venue) + ', ' + (resepsi.address || akad.address))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold map-open-route-btn"
            >
              <Navigation size={16} />
              <span>Buka Rute di Google Maps</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>

      <style>{`
        .event-section {
          padding-top: 2rem;
          padding-bottom: 3.5rem;
        }

        .countdown-card {
          margin-bottom: 2.5rem;
          padding: 2.4rem 1.4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }

        .countdown-headline {
          font-size: 1.6rem;
          color: var(--gold-200);
          margin-bottom: 1.6rem;
          text-align: center;
          width: 100%;
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
        }

        .countdown-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .countdown-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .countdown-box {
          width: 100%;
          max-width: 88px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.18);
          border: 2px solid #ffffff;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 30, 80, 0.25), 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .countdown-num {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: 2.3rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          line-height: 1;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          letter-spacing: -0.5px;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
        }

        .countdown-lbl {
          font-size: 0.74rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          text-align: center;
        }

        .events-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .event-card {
          padding: 2.4rem 1.8rem;
          text-align: center;
        }

        .event-badge {
          display: inline-block;
          font-size: 0.85rem;
          letter-spacing: 2px;
          color: #ffffff;
          border-bottom: 2px solid #ffffff;
          padding-bottom: 0.2rem;
          margin-bottom: 0.6rem;
          text-transform: uppercase;
          font-weight: 700;
        }

        .event-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.6rem;
          text-shadow: 0 2px 10px rgba(0, 30, 80, 0.2);
        }

        .event-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.14);
          padding: 1.4rem;
          border-radius: 14px;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
        }

        .event-info-item {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .venue-item {
          align-items: flex-start;
        }

        .venue-name {
          display: block;
          color: var(--gold-200);
          font-size: 1rem;
        }

        .venue-address {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          line-height: 1.5;
        }

        .event-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .event-btn {
          width: 100%;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
        }

        .map-card {
          padding: 2.2rem 1.8rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .map-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }

        .map-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.2);
          border: 1px solid rgba(147, 197, 253, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.2rem;
        }

        .map-title {
          font-size: 1.45rem;
          color: var(--gold-300);
          margin: 0;
        }

        .map-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0.2rem 0 0;
        }

        .map-venue-highlight {
          background: rgba(255, 255, 255, 0.14);
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          border-radius: 14px;
          padding: 1.1rem 1.4rem;
          margin-bottom: 1.4rem;
          width: 100%;
          max-width: 520px;
          text-align: center;
        }

        .venue-highlight-badge {
          display: inline-block;
          font-size: 0.72rem;
          letter-spacing: 1.5px;
          color: var(--gold-300);
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          border-bottom: 1px solid rgba(217, 119, 6, 0.4);
          padding-bottom: 0.15rem;
        }

        .venue-highlight-name {
          display: block;
          color: #ffffff;
          font-size: 1.15rem;
          margin-bottom: 0.35rem;
        }

        .venue-highlight-address {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        .map-frame-wrapper {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(147, 197, 253, 0.4);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
          width: 100%;
          background: rgba(5, 15, 35, 0.9);
        }

        .map-action-wrap {
          margin-top: 1.4rem;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .event-btn {
          white-space: nowrap !important;
          font-size: clamp(0.78rem, 3.6vw, 0.92rem);
          padding: 0.75rem 1.15rem;
          gap: 0.45rem;
        }

        .map-open-route-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.82rem 1.15rem;
          font-size: clamp(0.78rem, 3.6vw, 0.92rem);
          width: auto;
          max-width: 100%;
          white-space: nowrap !important;
          letter-spacing: 0.3px;
        }

        @media (max-width: 480px) {
          .countdown-card, .event-card, .map-card {
            padding: 1.8rem 1.15rem !important;
          }
          .countdown-grid {
            gap: 0.45rem;
          }
          .countdown-box {
            height: 66px;
            border-radius: 10px;
          }
          .countdown-num {
            font-size: 1.6rem;
          }
          .countdown-lbl {
            font-size: 0.65rem;
            letter-spacing: 0.5px;
          }
          .map-title {
            font-size: 1.25rem;
          }
          .venue-highlight-name {
            font-size: 1.05rem;
          }
          .venue-name {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </section>
  );
}
