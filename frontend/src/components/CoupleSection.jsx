import React from 'react';
import { Heart } from 'lucide-react';

export default function CoupleSection({ couple }) {
  const groom = couple?.groom || {
    fullName: "Putra Fajar Widianto",
    shortName: "Fajar",
    father: "Bpk. Sutarno",
    mother: "Ibu Supini",
    photo: "/images/groom.jpg",
    orderNumber: "Putra pertama dari"
  };

  const bride = couple?.bride || {
    fullName: "Rosa Prisantika Bay Sukur",
    shortName: "Rosa",
    father: "Bpk. Ahmad Erwin Sukur",
    mother: "Ibu Amira",
    photo: "/images/bride.jpg",
    orderNumber: "Putri kedua dari"
  };

  return (
    <section id="couple" className="couple-section">
      <div className="container">
        
        <div className="section-title-wrap">
          <span className="section-subtitle">Pasangan Pengantin</span>
          <h2 className="section-title gold-gradient-text">Kedua Mempelai</h2>
          <div className="section-divider">
            <span className="line"></span>
            <span className="diamond"></span>
            <span className="line"></span>
          </div>
        </div>

        <p className="couple-intro-text">
          Maha Suci Allah SWT yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat, taufik, dan ridho-Nya, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:
        </p>

        <div className="couple-grid">
          
          {/* Groom Card */}
          <div className="glass-card couple-card groom-card">
            <div className="avatar-frame-wrap">
              <div className="avatar-glow"></div>
              <div className="avatar-frame">
                <img 
                  src={groom.photo || "/images/groom.jpg"} 
                  alt={groom.fullName} 
                  className="couple-photo"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80";
                  }}
                />
              </div>
            </div>

            <div className="couple-details">
              <h3 className="couple-name font-serif">{groom.fullName}</h3>
              <p className="couple-nickname font-script">{groom.shortName}</p>
              
              <div className="parents-info">
                <p className="order-text">{groom.orderNumber}</p>
                <p className="parents-names">
                  <strong>{groom.father}</strong> & <strong>{groom.mother}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Connected Love Bridge with Heart Icon */}
          <div className="couple-connector-wrap">
            <div className="connector-line connector-top"></div>
            <div className="heart-bridge-circle" title="Ikatan Cinta">
              <Heart size={26} className="heart-icon fill-gold" />
            </div>
            <div className="connector-line connector-bottom"></div>
          </div>

          {/* Bride Card */}
          <div className="glass-card couple-card bride-card">
            <div className="avatar-frame-wrap">
              <div className="avatar-glow"></div>
              <div className="avatar-frame">
                <img 
                  src={bride.photo || "/images/bride.jpg"} 
                  alt={bride.fullName} 
                  className="couple-photo"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                  }}
                />
              </div>
            </div>

            <div className="couple-details">
              <h3 className="couple-name font-serif">{bride.fullName}</h3>
              <p className="couple-nickname font-script">{bride.shortName}</p>
              
              <div className="parents-info">
                <p className="order-text">{bride.orderNumber}</p>
                <p className="parents-names">
                  <strong>{bride.father}</strong> & <strong>{bride.mother}</strong>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .couple-section {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .couple-intro-text {
          font-size: 0.98rem;
          color: var(--text-muted);
          text-align: center;
          max-width: 540px;
          margin: -0.5rem auto 2.5rem;
          line-height: 1.8;
          padding: 0 1rem;
        }

        .couple-grid {
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
          position: relative;
        }

        .couple-card {
          text-align: center;
          padding: 2.8rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .avatar-frame-wrap {
          position: relative;
          margin-bottom: 1.8rem;
        }

        .avatar-glow {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%);
          filter: blur(14px);
        }

        .avatar-frame {
          position: relative;
          width: 190px;
          height: 250px;
          border-radius: 95px 95px 45px 45px;
          padding: 6px;
          background: #ffffff;
          box-shadow: 0 15px 35px rgba(0, 30, 80, 0.35), 0 0 30px rgba(255, 255, 255, 0.6);
          overflow: hidden;
        }

        .couple-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 90px 90px 40px 40px;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .couple-card:hover .couple-photo {
          transform: scale(1.06);
        }

        .couple-name {
          font-size: clamp(1.2rem, 4.8vw, 1.75rem);
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
          text-shadow: 0 2px 10px rgba(0, 30, 80, 0.25);
          line-height: 1.25;
          word-break: normal;
          overflow-wrap: break-word;
          hyphens: none;
          max-width: 100%;
        }

        .couple-nickname {
          font-size: 2.6rem;
          color: #ffffff;
          margin-top: -0.3rem;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        }

        .parents-info {
          margin-bottom: 1.5rem;
          color: #f0f9ff;
        }

        .order-text {
          font-size: 0.86rem;
          margin-bottom: 0.2rem;
          color: #e0f2fe;
        }

        .parents-names {
          font-size: 0.98rem;
          color: #ffffff;
        }

        .parents-names strong {
          color: #ffffff;
          font-weight: 700;
        }

        .couple-connector-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: -1.2rem 0;
          z-index: 5;
          position: relative;
        }

        .connector-line {
          width: 3px;
          height: 38px;
          background: #ffffff;
          box-shadow: 0 0 12px #ffffff;
          border-radius: 2px;
        }

        .connector-bottom {
          background: #ffffff;
        }

        .heart-bridge-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 8px 20px rgba(0, 30, 80, 0.25);
          animation: pulseHeart 2.4s ease-in-out infinite;
        }

        .fill-gold {
          fill: #005fd0 !important;
          color: #005fd0 !important;
          filter: drop-shadow(0 2px 6px rgba(0, 95, 208, 0.4));
        }

        @keyframes pulseHeart {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.9);
          }
        }

        @media (max-width: 480px) {
          .couple-card {
            padding: 2.2rem 1.15rem;
          }
          .couple-name {
            font-size: clamp(1.15rem, 5vw, 1.42rem);
            line-height: 1.3;
          }
          .couple-nickname {
            font-size: 2.2rem;
          }
          .avatar-frame {
            width: 165px;
            height: 220px;
          }
          .parents-names {
            font-size: 0.9rem;
          }
        }

        @media (min-width: 680px) {
          .couple-photo {
            object-position: center top;
          }
        }
      `}</style>
    </section>
  );
}
