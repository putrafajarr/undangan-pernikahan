import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function GallerySection({ gallery, couple }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const groom = couple?.groom?.shortName || "Fajar";
  const bride = couple?.bride?.shortName || "Rosa";

  const photos = gallery || [
    { id: 1, url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", caption: "Cinta Dalam Doa" },
    { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", caption: "Langkah Bersama" },
    { id: 3, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", caption: "Senyum Bahagia" },
    { id: 4, url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80", caption: "Janji Suci" },
    { id: 5, url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80", caption: "Hari Penuh Haru" },
    { id: 6, url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80", caption: "Hingga Ke Surga-Nya" }
  ];

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        
        <div className="section-title-wrap">
          <span className="section-subtitle">Momen Bahagia</span>
          <h2 className="section-title gold-gradient-text">Galeri Foto</h2>
          <div className="section-divider">
            <span className="line"></span>
            <span className="diamond"></span>
            <span className="line"></span>
          </div>
        </div>

        <div className="gallery-grid">
          {photos.map((item, idx) => (
            <div 
              key={item.id} 
              className="gallery-item"
              onClick={() => setSelectedIdx(idx)}
            >
              <img src={item.url} alt={item.caption} className="gallery-img" loading="lazy" />
              <div className="gallery-overlay">
                <ZoomIn size={24} className="zoom-icon" />
                <span className="gallery-caption font-serif">{item.caption}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Video Quote Card */}
        <div className="glass-card video-quote-card text-center">
          <p className="romantic-quote font-script">
            "Dua jiwa, satu hati, melangkah bersama dalam ridho Ilahi."
          </p>
          <span className="quote-author font-serif text-gold">— {groom} & {bride}</span>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedIdx !== null && (
        <div className="lightbox-modal" onClick={() => setSelectedIdx(null)}>
          <button className="lightbox-close" onClick={() => setSelectedIdx(null)}>
            <X size={26} />
          </button>

          <button className="lightbox-nav btn-prev" onClick={handlePrev}>
            <ChevronLeft size={30} />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={photos[selectedIdx].url} 
              alt={photos[selectedIdx].caption} 
              className="lightbox-img" 
            />
            <p className="lightbox-caption font-serif">{photos[selectedIdx].caption}</p>
          </div>

          <button className="lightbox-nav btn-next" onClick={handleNext}>
            <ChevronRight size={30} />
          </button>
        </div>
      )}

      <style>{`
        .gallery-section {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 4/5;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(5, 5, 5, 0.9) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-item:hover .gallery-img {
          transform: scale(1.08);
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        .zoom-icon {
          color: var(--gold-300);
          margin-bottom: 0.4rem;
        }

        .gallery-caption {
          color: #ffffff;
          font-size: 1.1rem;
          text-align: center;
        }

        .video-quote-card {
          padding: 2.2rem 1.5rem;
          background: linear-gradient(135deg, rgba(0, 52, 138, 0.85) 0%, rgba(0, 40, 110, 0.9) 100%);
        }

        .romantic-quote {
          font-size: 2.2rem;
          color: var(--gold-200);
          margin-bottom: 0.3rem;
          line-height: 1.3;
        }

        .quote-author {
          font-size: 1.1rem;
          letter-spacing: 2px;
        }

        /* Lightbox Modal */
        .lightbox-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 25, 75, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .lightbox-content {
          max-width: 90vw;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 75vh;
          border-radius: 14px;
          border: 1.5px solid var(--gold-400);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
          object-fit: contain;
        }

        .lightbox-caption {
          color: var(--gold-200);
          font-size: 1.35rem;
          margin-top: 1rem;
          text-align: center;
        }

        .lightbox-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .lightbox-close:hover {
          background: rgba(212, 175, 55, 0.3);
          transform: rotate(90deg);
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 45, 120, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.45);
          color: #ffffff;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-prev { left: 1.5rem; }
        .btn-next { right: 1.5rem; }

        .lightbox-nav:hover {
          background: var(--gold-gradient);
          color: #121c17;
        }

        @media (max-width: 640px) {
          .romantic-quote {
            font-size: 1.7rem;
          }
          .lightbox-nav {
            width: 38px;
            height: 38px;
          }
          .btn-prev { left: 0.5rem; }
          .btn-next { right: 0.5rem; }
        }
      `}</style>
    </section>
  );
}
