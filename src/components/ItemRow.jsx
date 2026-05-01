import React from 'react';

const ItemRow = ({ item, status, onClick, className = '' }) => {
  let statusClass = 'status-0';
  let badgeText = null;
  if (status === 1) { statusClass = 'status-1'; badgeText = 'IN PROGRESS'; }
  if (status === 2) { statusClass = 'status-2'; badgeText = 'DONE'; }

  return (
    <div className={`item-row ${statusClass} ${className}`} onClick={onClick}>
      <div className="item-status-circle">
        {status === 2 && <span className="checkmark">✓</span>}
      </div>
      <div className="item-label">
        {item.label}
      </div>
      <div className="item-right">
        {badgeText && <div className="item-status-pill">{badgeText}</div>}
      </div>
    </div>
  );
};

export default ItemRow;
