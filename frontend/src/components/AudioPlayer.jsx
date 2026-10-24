import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function AudioPlayer({ audioUrl, isPlaying, onTogglePlay }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="audio-player-dock">
      <button
        onClick={onTogglePlay}
        className={`audio-btn ${isPlaying ? 'is-playing' : ''}`}
        title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
        id="btn-toggle-music"
      >
        <div className="vinyl-ring">
          {isPlaying ? (
            <Volume2 size={18} className="icon-pulse" style={{ color: '#005fd0' }} />
          ) : (
            <VolumeX size={18} style={{ color: '#005fd0' }} />
          )}
        </div>
      </button>

      <style>{`
        .audio-player-dock {
          position: relative;
          display: flex;
          align-items: center;
          z-index: 100;
        }

        .audio-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 30, 80, 0.25), 0 0 15px rgba(255, 255, 255, 0.5);
          transition: var(--transition-smooth);
        }

        .audio-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.9);
        }

        .audio-btn.is-playing {
          animation: spinSlow 8s linear infinite;
          border-color: #ffffff;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.9);
        }

        .vinyl-ring {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-pulse {
          animation: pulseIcon 1.5s infinite ease-in-out;
        }

        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
