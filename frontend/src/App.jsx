import React, { useState, useEffect, useRef } from 'react';
import Cover from './components/Cover';
import PetalBackground from './components/PetalBackground';
import AudioPlayer from './components/AudioPlayer';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CoupleSection from './components/CoupleSection';
import EventSection from './components/EventSection';
import RsvpWishSection from './components/RsvpWishSection';
import GiftSection from './components/GiftSection';
import ClosingSection from './components/ClosingSection';
import AdminModal from './components/AdminModal';
import { ShieldCheck, Play, Pause } from 'lucide-react';

export default function App() {
  const [isCoverUnlocked, setIsCoverUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [invitationData, setInvitationData] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminParam, setIsAdminParam] = useState(false);
  
  // Auto-scroll states
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const isAutoScrollingRef = useRef(false);
  const isLoopingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const subPixelRef = useRef(0);
  const animationFrameRef = useRef(null);

  const audioRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    isAutoScrollingRef.current = isAutoScrolling;
  }, [isAutoScrolling]);

  // Read URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to') || params.get('u') || params.get('guest');
    if (toParam) {
      setGuestName(toParam);
    }
    if (params.get('admin') === 'true') {
      setIsAdminParam(true);
      setIsAdminOpen(true);
    }
  }, []);

  // Fetch invitation data from backend API
  const refreshInvitationData = () => {
    fetch('/api/invitation')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setInvitationData(json.data);
          if (json.data.couple) {
            const groom = json.data.couple.groom?.shortName || "Fajar";
            const bride = json.data.couple.bride?.shortName || "Rosa";
            document.title = `The Wedding of ${groom} & ${bride} | Undangan Pernikahan Digital`;
          }
        }
      })
      .catch((err) => {
        console.warn('Backend invitation load fallback:', err);
      });
  };

  useEffect(() => {
    refreshInvitationData();
  }, []);

  // Handle opening invitation & starting music & auto-scroll
  const handleOpenInvitation = () => {
    setIsCoverUnlocked(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.log('Audio autoplay prevented:', e);
      });
    }

    // Automatically trigger smooth auto-scroll after opening transition finishes
    setTimeout(() => {
      setIsAutoScrolling(true);
      isAutoScrollingRef.current = true;
      pauseUntilRef.current = 0;
    }, 1500);
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleToggleAutoScroll = () => {
    setIsAutoScrolling((prev) => {
      const next = !prev;
      isAutoScrollingRef.current = next;
      if (next) {
        pauseUntilRef.current = 0;
      }
      return next;
    });
  };

  // Ultra-smooth Auto Scroll engine with loop back to top
  useEffect(() => {
    if (!isCoverUnlocked) return;

    let lastTimestamp = null;
    let subPixel = 0;

    const scrollStep = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      // Cap delta time to 40ms to avoid jump when switching browser tabs
      const deltaSec = Math.min((timestamp - lastTimestamp) / 1000, 0.04);
      lastTimestamp = timestamp;

      if (isAutoScrollingRef.current) {
        const now = Date.now();
        if (now >= pauseUntilRef.current) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const currentY = window.scrollY || window.pageYOffset || 0;

          // Check if bottom reached (within 8px)
          if (maxScroll > 120 && currentY >= maxScroll - 8) {
            if (!isLoopingRef.current) {
              isLoopingRef.current = true;
              // Pause 2.5s at the bottom so user can comfortably finish reading
              pauseUntilRef.current = now + 2500;
              setTimeout(() => {
                if (!isAutoScrollingRef.current) {
                  isLoopingRef.current = false;
                  return;
                }
                // Smooth scroll back to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Pause 2.2s at top for smooth scroll to finish before resuming downwards
                pauseUntilRef.current = Date.now() + 2200;
                setTimeout(() => {
                  subPixel = 0;
                  isLoopingRef.current = false;
                }, 2200);
              }, 2500);
            }
          } else {
            // Smooth natural reading pace (~55px/sec)
            subPixel += 55 * deltaSec;
            if (subPixel >= 1) {
              const pixelsToMove = Math.floor(subPixel);
              window.scrollBy({ top: pixelsToMove, left: 0, behavior: 'instant' });
              subPixel -= pixelsToMove;
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animationFrameRef.current = requestAnimationFrame(scrollStep);

    // Pause temporarily when user interacts
    const handleUserInteraction = () => {
      if (isAutoScrollingRef.current) {
        // Pause for 3.2s so guest can read manually or click links without page moving
        pauseUntilRef.current = Date.now() + 3200;
      }
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
    };
  }, [isCoverUnlocked]);

  const audioUrl = invitationData?.audio?.url || "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-love-138.mp3";

  return (
    <div className="wedding-app">
      {/* Background Rose Petals Animation */}
      <PetalBackground />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
      />

      {/* Cover / Opening Envelope */}
      <Cover 
        guestName={guestName}
        onOpen={handleOpenInvitation}
        isUnlocked={isCoverUnlocked}
        couple={invitationData?.couple}
        eventDate={invitationData?.events?.resepsi?.dateFormatted || invitationData?.events?.akad?.dateFormatted}
        weddingTitle={invitationData?.title}
      />

      {/* Top Left Admin Portal (only if ?admin=true) */}
      {isAdminParam && (
        <div className="top-dock-bar">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="admin-badge-btn"
            title="Buka Portal Admin Pengantin"
            id="btn-open-admin"
          >
            <ShieldCheck size={14} style={{ color: '#005fd0' }} />
            <span>Admin Portal</span>
          </button>
        </div>
      )}

      {/* Top Right Controls (Auto Scroll Toggle & Music Player) */}
      {isCoverUnlocked && (
        <div className="top-right-dock">
          <button
            onClick={handleToggleAutoScroll}
            className={`autoscroll-toggle-btn ${isAutoScrolling ? 'is-active' : ''}`}
            title={isAutoScrolling ? 'Klik untuk Jeda Auto Scroll' : 'Klik untuk Mulai Auto Scroll'}
            id="btn-toggle-autoscroll"
          >
            {isAutoScrolling ? (
              <>
                <Pause size={14} className="icon-pulse" style={{ color: '#005fd0' }} />
                <span>Jeda Scroll</span>
              </>
            ) : (
              <>
                <Play size={14} style={{ color: '#005fd0', marginLeft: '2px' }} />
                <span>Auto Scroll</span>
              </>
            )}
          </button>

          <AudioPlayer 
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />
        </div>
      )}

      {/* Main Wedding Content */}
      <main className={`main-wedding-content ${isCoverUnlocked ? 'visible' : ''}`}>
        <HeroSection quote={invitationData?.quote} />
        
        <CoupleSection couple={invitationData?.couple} />
        
        <EventSection 
          events={invitationData?.events} 
          countdownTarget={invitationData?.countdownTarget}
        />
        
        <RsvpWishSection 
          guestName={guestName} 
          initialWishes={invitationData?.wishes}
        />
        
        <GiftSection gifts={invitationData?.gifts} />
        
        <ClosingSection couple={invitationData?.couple} />
      </main>

      {/* Floating Bottom Navigation */}
      {isCoverUnlocked && <Navbar />}

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        invitationData={invitationData}
        onUpdateInvitation={(updated) => {
          setInvitationData(updated);
          refreshInvitationData();
        }}
      />

      <style>{`
        .wedding-app {
          position: relative;
          min-height: 100vh;
        }

        .top-dock-bar {
          position: fixed;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .admin-badge-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.5rem 0.95rem;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 30, 80, 0.25);
          transition: var(--transition-smooth);
        }

        .admin-badge-btn:hover {
          background: #f0f9ff;
          color: #004fb0;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.6);
        }

        .top-right-dock {
          position: fixed;
          top: 1.25rem;
          right: 1.25rem;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .autoscroll-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.52rem 0.95rem;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 30, 80, 0.22), 0 0 12px rgba(255, 255, 255, 0.5);
          transition: var(--transition-smooth);
        }

        .autoscroll-toggle-btn:hover {
          background: #f0f8ff;
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 20px rgba(0, 30, 80, 0.28), 0 0 20px rgba(255, 255, 255, 0.8);
        }

        .autoscroll-toggle-btn.is-active {
          background: #f0f8ff;
          border-color: #005fd0;
          box-shadow: 0 0 16px rgba(0, 95, 208, 0.35);
        }

        .main-wedding-content {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .main-wedding-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .top-right-dock {
            top: 0.85rem;
            right: 0.85rem;
            gap: 0.45rem;
          }
          .autoscroll-toggle-btn {
            font-size: 0.72rem;
            padding: 0.42rem 0.75rem;
          }
          .top-dock-bar {
            top: 0.85rem;
            left: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
