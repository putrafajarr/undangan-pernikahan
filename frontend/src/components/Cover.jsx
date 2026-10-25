import React from 'react';
import { MailOpen, Heart, Sparkles } from 'lucide-react';

export default function Cover({ 
  guestName, 
  onOpen, 
  isUnlocked, 
  couple, 
  eventDate,
  weddingTitle 
}) {
  if (isUnlocked) return null;

  const groomName = couple?.groom?.shortName || "Fajar";
  const brideName = couple?.bride?.shortName || "Rosa";
  const displayDate = eventDate || couple?.weddingDate || "Sabtu, 28 November 2026";

  return (
    <div className="cover-overlay">
      <div className="cover-bg-glow"></div>
      
      {/* Decorative Royal Corner Filigrees */}
      <div className="ornament-corner top-left"></div>
      <div className="ornament-corner top-right"></div>
      <div className="ornament-corner bottom-left"></div>
      <div className="ornament-corner bottom-right"></div>

      <div className="cover-content">
        {/* Royal Crest Monogram */}
        <div className="royal-crest">
          <Sparkles size={16} className="text-gold" />
          <span className="crest-text font-serif">WALIMATUL 'URS</span>
          <Sparkles size={16} className="text-gold" />
        </div>

        <h3 className="cover-subtitle">THE WEDDING CELEBRATION OF</h3>

        <div className="cover-names">
          <h1 className="name-groom font-script">{groomName}</h1>
          <span className="name-ampersand font-serif">&</span>
          <h1 className="name-bride font-script">{brideName}</h1>
        </div>

        <div className="date-badge-box">
          <p className="cover-date font-serif">
            {displayDate}
          </p>
        </div>

        <div className="guest-box">
          <p className="guest-label">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
          <h2 className="guest-name font-serif">{guestName || 'Tamu Undangan'}</h2>
          <p className="guest-note">
            *Mohon maaf bila ada kesalahan dalam penulisan nama/gelar
          </p>
        </div>

        <button 
          onClick={onOpen}
          className="btn-gold btn-open-invitation animate-pulse-glow"
          id="btn-buka-undangan"
        >
          <MailOpen size={20} />
          <span>Buka Undangan</span>
        </button>
      </div>

      <style>{`
        .cover-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #005fd0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
          overflow: hidden;
        }

        .cover-bg-glow {
          position: absolute;
          width: 580px;
          height: 580px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
        }

        .cover-content {
          position: relative;
          z-index: 10;
          max-width: 480px;
          width: 100%;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 2px solid #ffffff;
          border-radius: 32px;
          padding: 3.5rem 2.2rem;
          box-shadow: 0 25px 70px rgba(0, 30, 80, 0.35), 0 0 50px rgba(255, 255, 255, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .royal-crest {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          border: 1.5px solid #ffffff;
          padding: 0.4rem 1.2rem;
          border-radius: 50px;
          margin-bottom: 1.2rem;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .crest-text {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 2.5px;
          color: #ffffff;
        }

        .cover-subtitle {
          font-size: 0.85rem;
          letter-spacing: 4px;
          color: #ffffff;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .cover-names {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.9rem;
          margin: 0.4rem 0 0.8rem;
          flex-wrap: wrap;
        }

        .name-groom, .name-bride {
          font-size: 3.8rem;
          color: #ffffff;
          text-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
          line-height: 1;
        }

        .name-ampersand {
          font-size: 2.4rem;
          color: #ffffff;
          font-style: italic;
        }

        .date-badge-box {
          margin-bottom: 1.8rem;
        }

        .cover-date {
          font-size: 1.15rem;
          letter-spacing: 2px;
          color: #ffffff;
          display: inline-block;
          border-bottom: 2px solid #ffffff;
          padding-bottom: 0.3rem;
          font-weight: 600;
        }

        .guest-box {
          background: rgba(255, 255, 255, 0.16);
          border: 2px dashed #ffffff;
          border-radius: 18px;
          padding: 1.3rem 1.6rem;
          width: 100%;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0, 30, 80, 0.15);
        }

        .guest-label {
          font-size: 0.85rem;
          color: #f0f9ff;
          margin-bottom: 0.35rem;
        }

        .guest-name {
          font-size: 1.65rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.3rem;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
        }

        .guest-note {
          font-size: 0.82rem;
          color: #ffffff;
          font-style: italic;
          margin-top: 0.45rem;
          opacity: 0.95;
          text-shadow: 0 1px 3px rgba(0, 20, 60, 0.5);
          letter-spacing: 0.2px;
        }

        .btn-open-invitation {
          font-size: 1rem;
          padding: 1rem 2.4rem;
          width: auto;
        }

        /* Decorative Corners */
        .ornament-corner {
          position: absolute;
          width: 55px;
          height: 55px;
          pointer-events: none;
        }

        .top-left {
          top: 1.5rem;
          left: 1.5rem;
          border-top: 2px solid rgba(147, 197, 253, 0.75);
          border-left: 2px solid rgba(147, 197, 253, 0.75);
        }
        .top-right {
          top: 1.5rem;
          right: 1.5rem;
          border-top: 2px solid rgba(147, 197, 253, 0.75);
          border-right: 2px solid rgba(147, 197, 253, 0.75);
        }
        .bottom-left {
          bottom: 1.5rem;
          left: 1.5rem;
          border-bottom: 2px solid rgba(147, 197, 253, 0.75);
          border-left: 2px solid rgba(147, 197, 253, 0.75);
        }
        .bottom-right {
          bottom: 1.5rem;
          right: 1.5rem;
          border-bottom: 2px solid rgba(147, 197, 253, 0.75);
          border-right: 2px solid rgba(147, 197, 253, 0.75);
        }

        @media (max-width: 480px) {
          .cover-content {
            padding: 2.2rem 1.15rem;
            max-width: 95%;
          }
          .name-groom, .name-bride {
            font-size: clamp(2.2rem, 10vw, 3rem);
            line-height: 1.05;
          }
          .name-ampersand {
            font-size: 1.8rem;
          }
          .guest-name {
            font-size: clamp(1.2rem, 5vw, 1.45rem);
            line-height: 1.3;
            word-break: normal;
            overflow-wrap: break-word;
          }
          .btn-open-invitation {
            padding: 0.85rem 1.8rem;
            font-size: 0.95rem;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
