import React, { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import './Header.css';
import { Target, Download } from 'lucide-react';

const Header = ({ roadmap, progress, onManualSave, onEdit, isEditing }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  let totalItems = 0;
  let doneItems = 0;
  let inProgressItems = 0;

  if (roadmap && roadmap.sections) {
    roadmap.sections.forEach(section => {
      section.subsections?.forEach(sub => {
        sub.groups?.forEach(group => {
          group.items?.forEach(item => {
            totalItems++;
            const status = progress[item.id] || 0;
            if (status === 2) doneItems++;
            else if (status === 1) inProgressItems++;
          });
        });
        sub.items?.forEach(item => {
          totalItems++;
          const status = progress[item.id] || 0;
          if (status === 2) doneItems++;
          else if (status === 1) inProgressItems++;
        });
      });
    });
  }

  const percentage = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
  const remainingItems = totalItems - doneItems - inProgressItems;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="brand-logo">
            <Target className="brand-icon" size={28} />
            <h1 className="website-name">RoaFy</h1>
            {deferredPrompt && (
              <button className="install-button" onClick={handleInstallClick}>
                <Download size={14} />
                Install App
              </button>
            )}
          </div>

          <div className="mode-tabs">
            <button 
              className={`mode-tab ${!isEditing ? 'active' : ''}`} 
              onClick={() => {
                if (isEditing) onManualSave();
              }}
            >
              View Mode
            </button>
            <button 
              className={`mode-tab ${isEditing ? 'active' : ''}`} 
              onClick={() => {
                if (!isEditing) onEdit();
              }}
            >
              Edit Mode
            </button>
          </div>
        </div>

        <div className="header-right">
          <div className="progress-container">
            <div className="progress-label">PROGRESS</div>
            <ProgressRing percentage={percentage} size={64} strokeWidth={4} />
          </div>
          
          <div className="stats-row">
            <div className="stat-pill stat-done">
              <span className="dot">●</span> {doneItems} DONE
            </div>
            <div className="stat-pill stat-in-progress">
              <span className="dot">●</span> {inProgressItems} IN PROGRESS
            </div>
            <div className="stat-pill stat-remaining">
              <span className="dot">●</span> {remainingItems} REMAINING
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
