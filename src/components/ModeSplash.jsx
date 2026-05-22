import React, { useState, useEffect } from 'react';
import { Pencil, Eye } from 'lucide-react';
import './ModeSplash.css';

const ModeSplash = ({ isEditing, onHide }) => {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    // Switch to exit animation after 650ms, then unmount at 950ms
    const exitTimer = setTimeout(() => setPhase('exit'), 650);
    const hideTimer = setTimeout(() => onHide(), 950);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="mode-splash-outer">
      <div
        className={`mode-splash-card ${isEditing ? 'splash-edit' : 'splash-view'} splash-${phase}`}
      >
        <div className="splash-icon-wrap">
          {isEditing
            ? <Pencil size={34} strokeWidth={1.5} />
            : <Eye     size={34} strokeWidth={1.5} />
          }
        </div>
        <div className="splash-label">
          {isEditing ? 'Edit Mode' : 'View Mode'}
        </div>
      </div>
    </div>
  );
};

export default ModeSplash;
