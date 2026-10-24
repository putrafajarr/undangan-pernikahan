import React from 'react';
import { Sparkles, HeartHandshake } from 'lucide-react';

export default function HeroSection({ quote }) {
  return (
    <section id="hero" className="hero-section">
      <div className="container">
        <div className="glass-card hero-card text-center" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Bismillah Calligraphy */}
          <div className="bismillah-wrap" style={{ textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <h2 className="bismillah-text font-serif" style={{ textAlign: 'center', margin: '0 auto' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h2>
          </div>

          <h3 className="salam-title font-serif" style={{ textAlign: 'center', width: '100%' }}>
            Assalamu'alaikum Warahmatullahi Wabarakatuh
          </h3>

          {/* Ayat Suci Frame */}
          <div className="quote-box" style={{ textAlign: 'center', margin: '1.2rem auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '580px' }}>
            <div className="quote-glow"></div>
            <p className="arabic-quote font-serif" style={{ textAlign: 'center', textAlignLast: 'center', width: '100%' }}>
              {quote?.arabic || "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً"}
            </p>
            <p className="translation-quote" style={{ textAlign: 'center', textAlignLast: 'center', width: '100%' }}>
              "{quote?.translation || "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}"
            </p>
            <div className="quote-source text-gold font-serif" style={{ textAlign: 'center', width: '100%' }}>
              — {quote?.source || "QS. Ar-Rum: 21"}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding-top: 5.5rem;
          padding-bottom: 2.5rem;
        }

        .hero-card {
          border-radius: var(--radius-lg);
          padding: 3.4rem 2.2rem;
          text-align: center !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto !important;
        }

        .bismillah-wrap {
          margin-bottom: 1.6rem;
          width: 100%;
          text-align: center !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }

        .bismillah-text {
          font-size: 2.3rem;
          color: #ffffff;
          letter-spacing: 1.5px;
          line-height: 1.5;
          text-shadow: 0 0 25px rgba(255, 255, 255, 0.85);
          text-align: center !important;
          margin: 0 auto !important;
          width: 100%;
        }

        .salam-title {
          font-size: 1.45rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 1.4rem;
          text-align: center !important;
          width: 100%;
          display: block;
          text-shadow: 0 2px 10px rgba(0, 30, 80, 0.25);
        }

        .quote-box {
          position: relative;
          background: rgba(255, 255, 255, 0.16);
          border: 2px solid #ffffff;
          border-radius: 20px;
          padding: 2.2rem 1.8rem;
          margin: 1.2rem auto 0;
          box-shadow: 0 10px 30px rgba(0, 30, 80, 0.2), 0 0 20px rgba(255, 255, 255, 0.25);
          width: 100%;
          max-width: 580px;
          text-align: center !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .arabic-quote {
          font-size: 1.55rem;
          color: #ffffff;
          line-height: 2.2;
          margin-bottom: 1.2rem;
          text-align: center !important;
          text-align-last: center !important;
          direction: rtl;
          width: 100%;
          display: block;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
        }

        .translation-quote {
          font-size: 0.95rem;
          font-style: italic;
          color: #f0f9ff;
          line-height: 1.8;
          margin-bottom: 1.2rem;
          text-align: center !important;
          text-align-last: center !important;
          width: 100%;
          display: block;
        }

        .quote-source {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-align: center !important;
          width: 100%;
          display: block;
        }

        @media (max-width: 480px) {
          .hero-card {
            padding: 2.4rem 1.2rem;
          }
          .bismillah-text {
            font-size: 1.75rem;
          }
          .salam-title {
            font-size: 1.15rem;
          }
          .arabic-quote {
            font-size: 1.25rem;
            line-height: 2;
          }
          .quote-box {
            padding: 1.6rem 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}
