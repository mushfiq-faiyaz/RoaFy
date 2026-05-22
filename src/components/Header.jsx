import React, { useState, useEffect, useRef } from 'react';
import ProgressRing from './ProgressRing';
import './Header.css';
import { Target, Download, Menu, Plus, FileText, Check, ChevronDown, Edit2, Copy, RotateCcw, Trash2, PenLine, FileJson, FileDown, Eye, Pencil, Activity, CheckCircle, Clock, ListTodo } from 'lucide-react';

const Header = ({ 
  roadmap, progress, onManualSave, onEdit, isEditing, 
  roadmapsList = [], onSwitchRoadmap, onCreateRoadmap, currentRoadmapId,
  onRenameMap, onDuplicateMap, onResetMap, onExportPDF, onExportJSON, onDeleteMap 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const optionsRef = useRef(null);
  const switcherRef = useRef(null);
  const statsCardRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      setShowStickyProgress(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
          setShowStickyProgress(true);
        } else {
          setShowStickyProgress(false);
        }
      },
      { threshold: 0 }
    );
    
    if (statsCardRef.current) {
      observer.observe(statsCardRef.current);
    }
    return () => observer.disconnect();
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <>
      <header className="header">
      <div className="header-container">
        <div className="header-top-row">
          <div className="brand-logo">
            <Target className="brand-icon" size={28} />
            <div className="brand-text-wrapper">
              <h1 className="website-name">RoaFy</h1>
              {isEditing ? (
                <span className="mode-badge edit-badge">
                  <Pencil size={13} /> Edit Mode
                  <span className="pulse-dot"></span>
                </span>
              ) : (
                <span className="mode-badge view-badge">
                  <Eye size={13} /> View Mode
                </span>
              )}
            </div>
            {deferredPrompt && (
              <button className="install-button" onClick={handleInstallClick}>
                <Download size={14} />
                Install App
              </button>
            )}
          </div>

          {!isEditing && (
            <div className="menu-controls-wrapper">
              <div className="menu-container" ref={optionsRef}>
                <button className="menu-btn" onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSwitcherOpen(false); }}>
                  <Menu size={20} />
                </button>
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => { onCreateRoadmap(); setIsMenuOpen(false); }}>
                      <Plus size={16} /> New Roadmap
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => { onRenameMap?.(); setIsMenuOpen(false); }}>
                      <PenLine size={16} /> Rename Map
                    </div>
                    <div className="dropdown-item" onClick={() => { onEdit(); setIsMenuOpen(false); }}>
                      <Edit2 size={16} /> Edit Map
                    </div>
                    <div className="dropdown-item" onClick={() => { onDuplicateMap?.(); setIsMenuOpen(false); }}>
                      <Copy size={16} /> Duplicate Map
                    </div>
                    <div className="dropdown-item danger-item" onClick={() => { setConfirmAction('reset'); setIsMenuOpen(false); }}>
                      <RotateCcw size={16} /> Reset Map
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => { onExportPDF?.(); setIsMenuOpen(false); }}>
                      <FileDown size={16} /> Export as PDF
                    </div>
                    <div className="dropdown-item" onClick={() => { onExportJSON?.(); setIsMenuOpen(false); }}>
                      <FileJson size={16} /> Export as JSON
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item danger-item" onClick={() => { setConfirmAction('delete'); setIsMenuOpen(false); }}>
                      <Trash2 size={16} /> Delete Map
                    </div>
                  </div>
                )}
              </div>

              <div className="menu-container" ref={switcherRef}>
                <button className="menu-btn switcher-btn" onClick={() => { setIsSwitcherOpen(!isSwitcherOpen); setIsMenuOpen(false); }}>
                  <ChevronDown size={20} />
                </button>
                {isSwitcherOpen && (
                  <div className="dropdown-menu">
                    {roadmapsList.map(r => (
                      <div 
                        key={r.id} 
                        className={`dropdown-item ${currentRoadmapId === r.id ? 'active' : ''}`}
                        onClick={() => { onSwitchRoadmap(r.id); setIsSwitcherOpen(false); }}
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
          )}
        </div>

        <div className="header-content-row">
          <div className="header-left">
            {/* View toggle moved to main content tabs */}
          </div>

          <div className="header-right">
            <div className="header-stats-card" ref={statsCardRef}>
              <div className="progress-container">
                <div className="progress-label">PROGRESS</div>
                <ProgressRing percentage={percentage} size={56} strokeWidth={4} />
              </div>
              
              <div className="stats-columns">
                <div className="stat-col">
                  <div className="stat-num stat-done-num">{doneItems}</div>
                  <div className="stat-text">Done</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-col">
                  <div className="stat-num stat-in-progress-num">{inProgressItems}</div>
                  <div className="stat-text">In Progress</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-col">
                  <div className="stat-num stat-remaining-num">{remainingItems}</div>
                  <div className="stat-text">Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* Sticky Progress Bar for View Mode */}
      {!isEditing && (
        <div className={`sticky-progress-bar ${showStickyProgress ? 'visible' : ''}`}>
          <div className="sticky-progress-content">
            <div className="sticky-prog-pill purp">
              <Activity size={14} strokeWidth={2} />
              <span className="sticky-prog-num">{Math.round(percentage)}%</span>
            </div>
            <div className="sticky-prog-pill done">
              <CheckCircle size={14} strokeWidth={2} />
              <span className="sticky-prog-num">{doneItems}</span>
              <span className="sticky-prog-label">DONE</span>
            </div>
            <div className="sticky-prog-pill ip">
              <Clock size={14} strokeWidth={2} />
              <span className="sticky-prog-num">{inProgressItems}</span>
              <span className="sticky-prog-label">IN PROGRESS</span>
            </div>
            <div className="sticky-prog-pill rem">
              <ListTodo size={14} strokeWidth={2} />
              <span className="sticky-prog-num">{remainingItems}</span>
              <span className="sticky-prog-label">LEFT</span>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{confirmAction === 'reset' ? 'Reset Map?' : 'Delete Map?'}</h3>
            <p>
              {confirmAction === 'reset' 
                ? "Reset to original version? This can't be undone." 
                : "Delete this map? This can't be undone."}
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className="modal-btn-danger" onClick={() => {
                 if (confirmAction === 'reset') { onResetMap?.(); }
                 else if (confirmAction === 'delete') { onDeleteMap?.(); }
                 setConfirmAction(null);
              }}>
                 {confirmAction === 'reset' ? 'Reset' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
