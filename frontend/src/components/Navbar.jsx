import React, { useState, useEffect } from 'react';
import { Home, Heart, Calendar, MessageSquareHeart, Gift } from 'lucide-react';

export default function Navbar({ activeSection }) {
  const [current, setCurrent] = useState('hero');

  const navItems = [
    { id: 'hero', label: 'Beranda', icon: Home },
    { id: 'couple', label: 'Mempelai', icon: Heart },
    { id: 'event', label: 'Acara', icon: Calendar },
    { id: 'rsvp', label: 'Buku Tamu', icon: MessageSquareHeart },
    { id: 'gift', label: 'Kado', icon: Gift },
  ];

  useEffect(() => {
    let lastCheck = 0;
    const handleScroll = () => {
      const now = Date.now();
      // Throttle to 4 times a second to prevent layout thrashing on every auto-scroll frame
      if (now - lastCheck < 250) return;
      lastCheck = now;

      const scrollPosition = window.scrollY + 200;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrent(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setCurrent(id);
    }
  };

  return (
    <nav className="bottom-navbar">
      <div className="nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              title={item.label}
              id={`nav-${item.id}`}
            >
              <Icon size={19} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .bottom-navbar {
          position: fixed;
          bottom: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 90;
          width: calc(100% - 2.5rem);
          max-width: 460px;
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid #ffffff;
          border-radius: 50px;
          padding: 0.45rem 0.6rem;
          box-shadow: 0 12px 35px rgba(0, 30, 80, 0.35), 0 0 25px rgba(255, 255, 255, 0.5);
        }

        .nav-btn {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          color: #005fd0;
          cursor: pointer;
          padding: 0.35rem 0.65rem;
          border-radius: 50px;
          transition: var(--transition-smooth);
        }

        .nav-icon {
          transition: transform 0.2s ease;
        }

        .nav-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .nav-btn:hover {
          color: #003e8a;
          background: rgba(0, 95, 208, 0.08);
        }

        .nav-btn.active {
          color: #ffffff;
          background: #005fd0;
          border: 1px solid #005fd0;
          box-shadow: 0 4px 15px rgba(0, 95, 208, 0.4);
        }

        .nav-btn.active .nav-icon {
          color: #ffffff;
          transform: translateY(-1px) scale(1.1);
        }

        /* Mobile Phone: Perfectly Round Circular Buttons */
        @media (max-width: 540px) {
          .bottom-navbar {
            bottom: 0.9rem;
            width: calc(100% - 1.8rem);
            max-width: 380px;
          }

          .nav-container {
            justify-content: space-between;
            padding: 0.35rem 0.5rem;
          }

          .nav-label {
            display: none;
          }

          .nav-btn {
            width: 42px;
            height: 42px;
            min-width: 42px;
            min-height: 42px;
            max-width: 42px;
            max-height: 42px;
            flex: 0 0 42px;
            aspect-ratio: 1 / 1;
            border-radius: 50%;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .nav-btn.active {
            border-radius: 50%;
            width: 42px;
            height: 42px;
          }
        }

        @media (max-width: 360px) {
          .nav-btn {
            width: 38px;
            height: 38px;
            min-width: 38px;
            min-height: 38px;
            max-width: 38px;
            max-height: 38px;
            flex: 0 0 38px;
          }
          .nav-btn.active {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </nav>
  );
}
