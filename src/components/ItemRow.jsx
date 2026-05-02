import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const ItemRow = ({ item, status, onClick, className = '' }) => {
  const [showDesc, setShowDesc] = useState(false);
  const clickTimeoutRef = useRef(null);
  let statusClass = 'status-0';
  let badgeText = null;
  if (status === 1) { statusClass = 'status-1'; badgeText = 'IN PROGRESS'; }
  if (status === 2) { statusClass = 'status-2'; badgeText = 'DONE'; }

  const handleRowClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      if (onClick) onClick();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        setShowDesc(!showDesc);
      }, 250);
    }
  };

  const handleCircleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <>
      <div className={`item-row ${statusClass} ${className}`} onClick={handleRowClick} style={{ userSelect: 'none' }}>
        <div className="item-status-circle" onClick={handleCircleClick} style={{ cursor: 'pointer' }}>
          {status === 2 && <span className="checkmark">✓</span>}
        </div>
        <div className="item-label">
          {item.label}
        </div>
        <div className="item-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {badgeText && <div className="item-status-pill">{badgeText}</div>}
          {item.description && (
            <span style={{ 
              color: 'rgba(255,255,255,0.4)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 200ms ease',
              transform: showDesc ? 'rotate(90deg)' : 'rotate(0deg)'
            }}>
              <ChevronRight size={16} strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>
      <div 
        className={`item-desc-wrapper ${className}`} 
        style={{
          display: 'grid',
          gridTemplateRows: showDesc && item.description ? '1fr' : '0fr',
          transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease',
          opacity: showDesc && item.description ? 1 : 0
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '4px 0 12px 34px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: '1.5' }}>
            {item.description?.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemRow;
