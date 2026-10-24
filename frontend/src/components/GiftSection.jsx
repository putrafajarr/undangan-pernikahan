import React, { useState } from 'react';
import { CreditCard, Copy, Check, Gift, Wifi } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GiftSection({ gifts }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const defaultAccounts = [
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
    }
  ];

  const accounts = (Array.isArray(gifts?.accounts) && gifts.accounts.length > 0)
    ? gifts.accounts
    : defaultAccounts;

  const physicalGift = gifts?.physicalGift;

  const copyToClipboard = (text, key) => {
    // Copy clean digits without spaces for mobile banking
    const cleanText = text.toString().replace(/\s+/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedKey(key);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 }
    });
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const validAccounts = accounts.filter(acc => 
    (acc.accountNumber && acc.accountNumber.trim()) || (acc.accountName && acc.accountName.trim())
  );

  // Format account number visually with spaces for clean card readability
  const formatCardNumber = (num) => {
    if (!num) return '';
    const clean = num.toString().replace(/\s+/g, '');
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <section id="gift" className="gift-section">
      <div className="container">
        
        <div className="section-title-wrap">
          <span className="section-subtitle">Tanda Kasih</span>
          <h2 className="section-title gold-gradient-text">Amplop Digital</h2>
          <div className="section-divider">
            <span className="line"></span>
            <span className="diamond"></span>
            <span className="line"></span>
          </div>
        </div>

        <div className="glass-card gift-card text-center">
          <div className="gift-icon-wrap">
            <Gift size={32} className="text-gold" />
          </div>

          <p className="gift-intro">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi merupakan ungkapan tanda kasih Anda, fitur amplop digital ini dapat digunakan untuk memudahkan pemberian tanda kasih:
          </p>

          {/* Luxury Bank Cards Grid */}
          {validAccounts.length === 0 ? (
            <div className="no-accounts-notice">
              <p>Nomor rekening transfer belum diatur oleh pengantin.</p>
            </div>
          ) : (
            <div className="accounts-grid">
              {validAccounts.map((acc, index) => {
                const isCopied = copiedKey === `acc-${index}`;
                return (
                  <div key={index} className="bank-luxury-card">
                    {/* Gloss Overlay Sheen */}
                    <div className="card-gloss-sheen"></div>

                    {/* Top Row: Bank Badge & Tech (EMV Chip + Contactless) */}
                    <div className="card-top-row">
                      <div className="bank-brand-badge">
                        <span className="bank-name-text">{acc.bank || 'BANK TRANSFER'}</span>
                      </div>

                      <div className="card-tech-group">
                        <Wifi size={18} className="contactless-wave" />
                        <div className="emv-gold-chip" title="EMV Smart Chip">
                          <span className="chip-line horiz"></span>
                          <span className="chip-line vert"></span>
                          <div className="chip-center-pin"></div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Formatted Account Number */}
                    <div className="card-middle-content">
                      <span className="card-micro-caption">NOMOR REKENING</span>
                      <div className="bank-card-number font-sans">
                        {formatCardNumber(acc.accountNumber)}
                      </div>
                    </div>

                    {/* Bottom: Cardholder Name & Action Button */}
                    <div className="card-bottom-row">
                      <div className="card-holder-info">
                        <span className="card-micro-caption">ATAS NAMA PENERIMA</span>
                        <div className="card-holder-name">
                          {acc.accountName}
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(acc.accountNumber, `acc-${index}`)}
                        className={`btn-luxury-copy ${isCopied ? 'copied' : ''}`}
                        id={`btn-copy-${(acc.bank || 'bank').toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                        title="Salin Nomor Rekening ke Clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check size={16} />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Salin No. Rekening</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      <style>{`
        .gift-section {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .gift-card {
          padding: 2.8rem 1.8rem;
          max-width: 620px;
          margin: 0 auto;
        }

        .gift-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.15);
          border: 1.5px solid var(--gold-400);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.4rem;
        }

        .gift-intro {
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 500px;
          margin: 0 auto 2.2rem;
        }

        .accounts-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        /* Luxury VIP Bank Card Design */
        .bank-luxury-card {
          position: relative;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.09) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.65);
          border-radius: 20px;
          padding: 1.75rem 1.85rem;
          text-align: left;
          overflow: hidden;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 14px 35px rgba(0, 25, 75, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .bank-luxury-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 45px rgba(0, 30, 90, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .card-gloss-sheen {
          position: absolute;
          top: 0;
          right: 0;
          width: 60%;
          height: 100%;
          background: radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Card Header */
        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.35rem;
          position: relative;
          z-index: 2;
        }

        .bank-brand-badge {
          background: #ffffff;
          padding: 0.38rem 0.95rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
          display: inline-flex;
          align-items: center;
        }

        .bank-name-text {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 800;
          color: #005fd0;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .card-tech-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .contactless-wave {
          color: rgba(255, 255, 255, 0.85);
          transform: rotate(90deg);
        }

        /* Golden EMV Smart Chip Graphic */
        .emv-gold-chip {
          width: 40px;
          height: 30px;
          background: linear-gradient(135deg, #ffd700 0%, #e6b800 45%, #b8860b 100%);
          border-radius: 6px;
          position: relative;
          border: 1px solid #d4af37;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 6px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .emv-gold-chip .chip-line.horiz {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0, 0, 0, 0.35);
        }

        .emv-gold-chip .chip-line.vert {
          position: absolute;
          left: 40%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(0, 0, 0, 0.35);
        }

        .emv-gold-chip .chip-center-pin {
          position: absolute;
          top: 25%;
          left: 20%;
          width: 60%;
          height: 50%;
          border: 1px solid rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }

        /* Card Middle: Account Number */
        .card-middle-content {
          margin-bottom: 1.35rem;
          position: relative;
          z-index: 2;
        }

        .card-micro-caption {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          color: #bae6fd;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }

        .bank-card-number {
          font-family: var(--font-sans);
          font-size: clamp(1.4rem, 5vw, 1.85rem);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 3.5px;
          font-variant-numeric: tabular-nums lining-nums;
          -webkit-font-feature-settings: "tnum", "lnum";
          font-feature-settings: "tnum", "lnum";
          user-select: all;
          -webkit-user-select: all;
          text-shadow: 0 2px 10px rgba(0, 20, 60, 0.5), 0 0 15px rgba(255, 255, 255, 0.5);
          line-height: 1.25;
        }

        /* Card Bottom Row */
        .card-bottom-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.2rem;
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
        }

        .card-holder-info {
          flex: 1;
          min-width: 180px;
        }

        .card-holder-name {
          font-family: var(--font-sans);
          font-size: clamp(1.05rem, 3.8vw, 1.22rem);
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          text-shadow: 0 1px 4px rgba(0, 20, 60, 0.4);
          line-height: 1.35;
        }

        /* Luxury Copy Button */
        .btn-luxury-copy {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.62rem 1.25rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(0, 20, 60, 0.25), 0 0 12px rgba(255, 255, 255, 0.4);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .btn-luxury-copy:hover {
          background: #f0f9ff;
          color: #004fb0;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 30, 80, 0.35), 0 0 20px rgba(255, 255, 255, 0.8);
        }

        .btn-luxury-copy.copied {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
        }

        .no-accounts-notice {
          padding: 1.4rem;
          background: rgba(0, 48, 125, 0.75);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          margin-bottom: 1.8rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-style: italic;
        }

        /* Mobile Adjustments */
        @media (max-width: 540px) {
          .gift-card {
            padding: 2rem 1.1rem;
          }

          .bank-luxury-card {
            padding: 1.35rem 1.2rem;
            border-radius: 16px;
          }

          .bank-name-text {
            font-size: 0.92rem;
            letter-spacing: 1.2px;
          }

          .bank-brand-badge {
            padding: 0.3rem 0.75rem;
          }

          .emv-gold-chip {
            width: 36px;
            height: 26px;
          }

          .bank-card-number {
            letter-spacing: 2.2px;
            font-size: 1.35rem;
          }

          .card-bottom-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .card-holder-name {
            font-size: 1.05rem;
          }

          .btn-luxury-copy {
            width: 100%;
            justify-content: center;
            padding: 0.7rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </section>
  );
}
