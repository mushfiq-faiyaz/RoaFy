import React from 'react';

const ProgressRing = ({ percentage, size = 60, strokeWidth = 4, color = "#6366f1", textColor = "#ffffff", fontSize = "14px", text }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const validPercentage = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference - (validPercentage / 100) * circumference;

  let displayValue = validPercentage;
  if (validPercentage > 0 && validPercentage < 100) {
    if (validPercentage % 1 !== 0) {
      displayValue = validPercentage < 0.1 ? "<0.1" : validPercentage.toFixed(1);
    }
  } else {
    displayValue = Math.round(validPercentage);
  }

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      {/* Percentage text */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fontSize,
          fontWeight: '700',
          color: textColor
        }}
      >
        {text !== undefined ? text : `${displayValue}%`}
      </div>
    </div>
  );
};

export default ProgressRing;
