import React, { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import './Header.css';
import { Target, Download, Menu, Plus, FileText, Check } from 'lucide-react';

const Header = ({ roadmap, progress, onManualSave, onEdit, isEditing, roadmapsList = [], onSwitchRoadmap, onCreateRoadmap, currentRoadmapId }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  if (roadmap) {
    if (roadmap.items) {
      roadmap.items.forEach(item => {
        totalItems++;
        const status = progress[item.id] || 0;
        if (status === 2) doneItems++;
        else if (status === 1) inProgressItems++;
      });
    }

    if (roadmap.sections) {
      roadmap.sections.forEach(section => {
        if (section.items) {
          section.items.forEach(item => {
            totalItems++;
            const status = progress[item.id] || 0;
            if (status === 2) doneItems++;
            else if (status === 1) inProgressItems++;
          });
        }
        if (section.subsections) {
          section.subsections.forEach(sub => {
            if (sub.items) {
              sub.items.forEach(item => {
                totalItems++;
                const status = progress[item.id] || 0;
                if (status === 2) doneItems++;
                else if (status === 1) inProgressItems++;
              });
            }
            if (sub.groups) {
              // Backward compatibility for old data
              sub.groups.forEach(group => {
                if (group.items) {
                  group.items.forEach(item => {
                    totalItems++;
                    const status = progress[item.id] || 0;
                    if (status === 2) doneItems++;
                    else if (status === 1) inProgressItems++;
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  const percentage = totalItems === 0 ? 0 : (doneItems / totalItems) * 100;
  const remainingItems = totalItems - doneItems - inProgressItems;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top-row">
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

          <div className="menu-container">
            <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={20} />
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => { onCreateRoadmap(); setIsMenuOpen(false); }}>
                  <Plus size={16} /> New Roadmap
                </div>
                <div className="dropdown-divider"></div>
                {roadmapsList.map(r => (
                  <div 
                    key={r.id} 
                    className={`dropdown-item ${currentRoadmapId === r.id ? 'active' : ''}`}
                    onClick={() => { onSwitchRoadmap(r.id); setIsMenuOpen(false); }}
                  >
                    <FileText size={16} /> 
                    <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {r.title || 'Untitled'}
                    </span>
                    {currentRoadmapId === r.id && <Check size={16} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-content-row">
          <div className="header-left">
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
            <div className="header-stats-wrapper">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
