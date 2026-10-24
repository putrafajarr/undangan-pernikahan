import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function StorySection({ loveStories }) {
  const stories = loveStories || [
    {
      id: 1,
      year: "2021",
      title: "Awal Pertemuan",
      story: "Takdir mempertemukan kami saat kegiatan orientasi kerja. Sebuah percakapan sederhana tentang cita-cita menjadi pintu awal kisah indah ini."
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
  ];

  return (
    <section id="story" className="story-section">
      <div className="container">
        
        <div className="section-title-wrap">
          <span className="section-subtitle">Perjalanan Cinta</span>
          <h2 className="section-title gold-gradient-text">Kisah Kasih Kami</h2>
          <div className="section-divider">
            <span className="line"></span>
            <span className="diamond"></span>
            <span className="line"></span>
          </div>
        </div>

        <div className="timeline-container">
          <div className="timeline-spine"></div>

          {stories.map((item, index) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-badge">
                <span className="badge-year font-serif">{item.year}</span>
              </div>

              <div className="glass-card timeline-card">
                <div className="card-top-accent">
                  <Heart size={14} className="text-gold fill-gold" />
                  <span className="card-year-tag">{item.year}</span>
                </div>
                <h3 className="story-title font-serif">{item.title}</h3>
                <p className="story-text">{item.story}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .story-section {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .timeline-container {
          position: relative;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .timeline-spine {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 20px;
          width: 2px;
          background: linear-gradient(180deg, transparent 0%, #ffffff 15%, #ffffff 85%, transparent 100%);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        }

        .timeline-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding-left: 0.5rem;
        }

        .timeline-badge {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 4px 10px rgba(0, 30, 80, 0.25);
          flex-shrink: 0;
          margin-top: 1.5rem;
        }

        .badge-year {
          font-size: 0.78rem;
          font-weight: 800;
          color: #005fd0;
        }

        .timeline-card {
          flex: 1;
          padding: 1.8rem 1.5rem;
        }

        .card-top-accent {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .fill-gold {
          fill: #ffffff;
        }

        .card-year-tag {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
        }

        .story-title {
          font-size: 1.35rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.6rem;
        }

        .story-text {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.65;
        }

        @media (max-width: 480px) {
          .timeline-card {
            padding: 1.4rem 1.2rem;
          }
        }
      `}</style>
    </section>
  );
}
