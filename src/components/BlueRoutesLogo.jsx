import React from 'react';

const BlueRoutesLogo = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Fruit container: berry + shadow stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        {/* Blueberry SVG */}
        <svg
          className="berry-float"
          width="36"
          height="44"
          viewBox="0 0 36 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stem */}
          <line x1="18" y1="6" x2="18" y2="11" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />

          {/* Leaf */}
          <ellipse
            cx="22"
            cy="7"
            rx="4"
            ry="2"
            fill="#16a34a"
            transform="rotate(-30 22 7)"
          />

          {/* Main berry body */}
          <circle cx="18" cy="26" r="14" fill="#3b82f6" />

          {/* Radial gradient overlay — top-left highlight */}
          <circle cx="18" cy="26" r="14" fill="url(#berryGradient)" />

          {/* Crown / 5-pointed star at top of berry */}
          <polygon
            points="18,12 19.4,15.8 23.4,15.8 20.2,18.2 21.4,22 18,19.8 14.6,22 15.8,18.2 12.6,15.8 16.6,15.8"
            fill="#1d4ed8"
          />

          {/* Glossy highlight ellipse */}
          <ellipse
            cx="13"
            cy="20"
            rx="4"
            ry="2.5"
            fill="#93c5fd"
            opacity="0.4"
            transform="rotate(-20 13 20)"
          />

          {/* Gradient definition */}
          <defs>
            <radialGradient
              id="berryGradient"
              cx="30%"
              cy="28%"
              r="70%"
              fx="25%"
              fy="22%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.15" />
              <stop offset="100%" stopColor="black" stopOpacity="0.20" />
            </radialGradient>
          </defs>
        </svg>

        {/* Shadow */}
        <div className="berry-shadow" />
      </div>

      {/* Wordmark + BETA badge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: '20px',
            letterSpacing: '-0.5px',
            lineHeight: 1,
            fontFamily: 'inherit',
          }}
        >
          Blue Routes
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 'fit-content',
            background: '#2563eb',
            color: 'white',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
            lineHeight: 1.4,
          }}
        >
          BETA
        </span>
      </div>
    </div>
  );
};

export default BlueRoutesLogo;
