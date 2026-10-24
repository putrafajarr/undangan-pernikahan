import React from 'react';
import { Heart } from 'lucide-react';

export default function ClosingSection({ couple }) {
  const groomName = couple?.groom?.shortName || "Fajar";
  const brideName = couple?.bride?.shortName || "Rosa";

  return (
    <footer className="closing-section">
      <div className="container">
        
        <div className="glass-card closing-card text-center" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div className="heart-icon-closing" style={{ margin: '0 auto 1.6rem' }}>
            <Heart size={24} style={{ color: '#005fd0', fill: '#005fd0' }} />
          </div>

          <p className="closing-text font-serif" style={{ textAlign: 'center', textAlignLast: 'center', margin: '0 auto 1.6rem', width: '100%' }}>
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami berdua.
          </p>

          <p className="closing-salam font-serif" style={{ textAlign: 'center', margin: '0 auto 2.2rem', width: '100%' }}>
            Wassalamu'alaikum Warahmatullahi Wabarakatuh
          </p>

          <div className="closing-families" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '0 auto 2.4rem' }}>
            <p className="family-label" style={{ textAlign: 'center', width: '100%' }}>Kami yang berbahagia,</p>
            <h3 className="family-couple-names font-script" style={{ textAlign: 'center', width: '100%', margin: '0 auto 0.4rem' }}>
              {groomName} & {brideName}
            </h3>
            <p className="families-subtext" style={{ textAlign: 'center', width: '100%' }}>
              Beserta Keluarga Besar Kedua Mempelai
            </p>
          </div>

          <div className="footer-credits" style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ textAlign: 'center', margin: '0 auto' }}>© 2026 Fajar. All Rights Reserved.</p>
          </div>

        </div>

      </div>

      <style>{`
        .closing-section {
          padding-top: 1rem;
          padding-bottom: 6.5rem;
        }

        .closing-card {
          padding: 3.5rem 1.8rem;
          text-align: center !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto !important;
        }

        .heart-icon-closing {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #ffffff;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto 1.6rem !important;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.8), 0 4px 15px rgba(0, 30, 80, 0.2);
        }

        .closing-text {
          font-size: 1.15rem;
          color: var(--text-main);
          line-height: 1.85;
          max-width: 520px;
          margin: 0 auto 1.6rem !important;
          text-align: center !important;
          text-align-last: center !important;
          width: 100%;
          display: block;
        }

        .closing-salam {
          font-size: 1.35rem;
          color: var(--gold-200);
          margin: 0 auto 2.2rem !important;
          font-weight: 600;
          text-align: center !important;
          width: 100%;
          display: block;
        }

        .closing-families {
          margin: 0 auto 2.4rem !important;
          text-align: center !important;
          width: 100%;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .family-label {
          font-size: 0.85rem;
          color: var(--text-light);
          margin-bottom: 0.3rem;
          text-align: center !important;
          width: 100%;
          display: block;
        }

        .family-couple-names {
          font-size: 3.4rem;
          color: #ffffff;
          line-height: 1.2;
          margin: 0 auto 0.4rem !important;
          text-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
          text-align: center !important;
          width: 100%;
          display: block;
        }

        .families-subtext {
          font-size: 0.95rem;
          color: var(--text-muted);
          text-align: center !important;
          width: 100%;
          display: block;
        }

        .share-btn {
          margin: 0 auto 2.5rem !important;
          padding: 0.88rem 2rem;
          font-size: 0.95rem;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          align-self: center !important;
          gap: 0.6rem;
        }

        .footer-credits {
          font-size: 0.78rem;
          color: var(--text-light);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.5rem;
          text-align: center !important;
          width: 100%;
        }

        .footer-credits p {
          text-align: center !important;
          margin: 0 auto !important;
        }

        @media (max-width: 480px) {
          .closing-card {
            padding: 2.6rem 1.2rem;
          }
          .family-couple-names {
            font-size: 2.8rem;
          }
          .closing-text {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </footer>
  );
}
