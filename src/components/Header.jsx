import React, { useState, useEffect, useRef } from 'react';
import ProgressRing from './ProgressRing';
import BlueRoutesLogo from './BlueRoutesLogo';
import './Header.css';
import { Download, Menu, Plus, FileText, Check, ChevronDown, Edit2, Copy, RotateCcw, Trash2, PenLine, FileJson, FileDown, Eye, Pencil, Activity, CheckCircle, Clock, ListTodo, Save, Settings, ChevronLeft } from 'lucide-react';

const Header = ({ 
  roadmap, progress, onManualSave, onEdit, isEditing, 
  roadmapsList = [], onSwitchRoadmap, onCreateRoadmap, currentRoadmapId,
  onRenameMap, onDuplicateMap, onResetMap, onExportPDF, onExportJSON, onDeleteMap,
  onGraphThemeChange, onGraphLayoutChange,
  currentView, onViewChange, onUpdateEnabledViews, onResetSettings
}) => {
  const enabledViews = roadmap?.enabledViews || { list: true, graph: true, timeline: true, board: true };
  const showProgressStats = (enabledViews.list && currentView === 'list') || (!enabledViews.list && currentView === 'graph');
  const currentTheme = roadmap?.graphTheme || 'classic';
  const currentLayout = roadmap?.graphLayout || 'vertical';
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showStickyProgress, setShowStickyProgress] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const toastTimeoutRef = useRef(null);
  const optionsRef = useRef(null);
  const stickyOptionsRef = useRef(null);
  const settingsRef = useRef(null);
  const switcherRef = useRef(null);
  const statsCardRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      setShowStickyProgress(false);
      return;
    }

    if (!showProgressStats) {
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
  }, [isEditing, currentView, roadmap?.enabledViews, showProgressStats]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideOriginal = optionsRef.current && !optionsRef.current.contains(event.target);
      const clickedOutsideSticky = stickyOptionsRef.current && !stickyOptionsRef.current.contains(event.target);
      const stickyDoesNotExist = !stickyOptionsRef.current;
      
      if (clickedOutsideOriginal && (clickedOutsideSticky || stickyDoesNotExist)) {
        setIsMenuOpen(false);
        setValidationError(null);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
        setValidationError(null);
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

  const handleEditCancelClick = () => {
    window.dispatchEvent(new Event('request-cancel-edit'));
    setIsMenuOpen(false);
  };

  const handleEditSaveClick = () => {
    window.dispatchEvent(new Event('request-save-exit-edit'));
    setIsMenuOpen(false);
  };

  const fallbackOrder = ['list', 'graph', 'timeline', 'board'];

  const handleToggleView = (view) => {
    const isCurrentlyEnabled = enabledViews[view];
    const enabledCount = Object.values(enabledViews).filter(Boolean).length;

    if (isCurrentlyEnabled && enabledCount === 1) {
      setValidationError("At least one view must stay enabled.");
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setValidationError(null);
      }, 3000);
      return;
    }

    setValidationError(null);
    const updatedViews = {
      ...enabledViews,
      [view]: !isCurrentlyEnabled
    };

    onUpdateEnabledViews?.(updatedViews);

    // If current view is disabled, switch to first enabled
    if (view === currentView && isCurrentlyEnabled) {
      const nextView = fallbackOrder.find(v => updatedViews[v]);
      if (nextView && onViewChange) {
        onViewChange(nextView);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Ripple factory — colour matches the destination mode
  const createRipple = (e, color = 'rgba(255,255,255,0.25)') => {
    const el = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(el.clientWidth, el.clientHeight) * 2.2;
    const radius = diameter / 2;
    const rect = el.getBoundingClientRect();
    circle.className = 'ripple-wave';
    circle.style.width  = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.left   = `${e.clientX - rect.left  - radius}px`;
    circle.style.top    = `${e.clientY - rect.top   - radius}px`;
    circle.style.background = color;
    el.querySelector('.ripple-wave')?.remove();
    el.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
  };

  const renderMenu = (ref) => (
    <div className="menu-container" ref={ref}>
      <button className="menu-btn" onClick={() => { 
        setIsMenuOpen(!isMenuOpen); 
        setIsSettingsOpen(false); 
        setIsSwitcherOpen(false); 
        setValidationError(null);
      }}>
        <Menu size={20} />
      </button>
      {isMenuOpen && (
        <div className="dropdown-menu">
          {isEditing ? (
            <>
              {/* amber ripple — leaving edit mode */}
              <div className="dropdown-item" onClick={(e) => { createRipple(e, 'rgba(251,146,60,0.35)'); handleEditCancelClick(); }}>
                <Eye size={16} /> View Mode
              </div>
              {/* amber ripple — save & leave edit mode */}
              <div className="dropdown-item" onClick={(e) => { createRipple(e, 'rgba(251,146,60,0.35)'); handleEditSaveClick(); }}>
                <Save size={16} /> Save & Exit
              </div>
            </>
          ) : (
            <>
              <div className="dropdown-item" onClick={() => { onCreateRoadmap(); setIsMenuOpen(false); }}>
                <Plus size={16} /> New Roadmap
              </div>
              <div className="dropdown-divider"></div>
              {/* indigo ripple — entering edit mode */}
              <div className="dropdown-item" onClick={(e) => { createRipple(e, 'rgba(99,102,241,0.4)'); onEdit(); setIsMenuOpen(false); }}>
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
              <div className="dropdown-divider"></div>
              <div className="dropdown-item danger-item" onClick={() => { setConfirmAction('delete'); setIsMenuOpen(false); }}>
                <Trash2 size={16} /> Delete Map
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="header">
      <div className="header-container">
        <div className="header-top-row">
          <div className="brand-logo">
            <BlueRoutesLogo />
            {deferredPrompt && (
              <button className="install-button" onClick={handleInstallClick}>
                <Download size={14} />
                Install App
              </button>
            )}
          </div>

          <div className={`menu-controls-wrapper ${isEditing ? 'is-editing' : ''}`}>
            {renderMenu(optionsRef)}

            {isEditing && (
              <div className="menu-container" ref={settingsRef}>
                <button 
                  className={`menu-btn settings-btn ${isSettingsOpen ? 'active' : ''}`}
                  onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsMenuOpen(false); }}
                  title="Map Settings"
                >
                  <Settings size={20} />
                </button>
                {isSettingsOpen && (
                  <div className="dropdown-menu settings-dropdown">
                    <div className="settings-list">
                      <div className="dropdown-section">
                        <div className="dropdown-section-label">Graph Style</div>
                        <div className="segmented-control">
                          <button 
                            className={`segmented-btn ${currentTheme === 'classic' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onGraphThemeChange?.('classic'); }}
                          >
                            Classic
                          </button>
                          <button 
                            className={`segmented-btn ${currentTheme === 'vivid' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onGraphThemeChange?.('vivid'); }}
                          >
                            Vivid
                          </button>
                        </div>
                      </div>

                      <div className="dropdown-section">
                        <div className="dropdown-section-label">Graph Layout</div>
                        <div className="segmented-control">
                          <button 
                            className={`segmented-btn ${currentLayout === 'vertical' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onGraphLayoutChange?.('vertical'); }}
                          >
                            Vertical
                          </button>
                          <button 
                            className={`segmented-btn ${currentLayout === 'horizontal' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onGraphLayoutChange?.('horizontal'); }}
                          >
                            Horizontal
                          </button>
                        </div>
                      </div>

                      <div className="dropdown-section">
                        <div className="dropdown-section-label">Enabled Views</div>
                        <div className="views-toggle-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                          {fallbackOrder.map(view => {
                            const isEnabled = enabledViews[view];
                            return (
                              <div 
                                key={view} 
                                className="toggle-item-row" 
                                onClick={(e) => { e.stopPropagation(); handleToggleView(view); }}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                              >
                                <span style={{ textTransform: 'capitalize', fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{view} View</span>
                                <label className="switch" style={{ pointerEvents: 'none' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={isEnabled} 
                                    readOnly
                                  />
                                  <span className="slider round"></span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {validationError && (
                        <div className="settings-validation-error">
                          {validationError}
                        </div>
                      )}

                      <div className="dropdown-divider"></div>
                      <div 
                        className="dropdown-item danger-item reset-settings-btn" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setConfirmAction('reset-settings');
                          setIsSettingsOpen(false);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '13px', padding: '10px 14px' }}
                      >
                        <RotateCcw size={14} /> Reset to Default Settings
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isEditing && (
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
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="header-content-row">
            <div className="header-left">
              {/* View toggle moved to main content tabs */}
            </div>

            <div className="header-right">
              {showProgressStats && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </header>

      {/* Sticky Progress Bar for View Mode */}
      {!isEditing && showProgressStats && (
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
          <div className="sticky-menu-wrapper">
            {renderMenu(stickyOptionsRef)}
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>
              {confirmAction === 'reset' && 'Reset Map?'}
              {confirmAction === 'delete' && 'Delete Map?'}
              {confirmAction === 'reset-settings' && 'Reset Settings?'}
            </h3>
            <p>
              {confirmAction === 'reset' && "Reset to original version? This can't be undone."}
              {confirmAction === 'delete' && "Delete this map? This can't be undone."}
              {confirmAction === 'reset-settings' && "Are you sure you want to reset all settings to default? This will revert your layout, theme, and view toggles."}
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmAction(null)}>
                {confirmAction === 'reset-settings' ? 'Keep Settings' : 'Cancel'}
              </button>
              <button className="modal-btn-danger" onClick={() => {
                 if (confirmAction === 'reset') { onResetMap?.(); }
                 else if (confirmAction === 'delete') { onDeleteMap?.(); }
                 else if (confirmAction === 'reset-settings') { onResetSettings?.(); }
                 setConfirmAction(null);
              }}>
                 {confirmAction === 'reset' && 'Reset'}
                 {confirmAction === 'delete' && 'Delete'}
                 {confirmAction === 'reset-settings' && 'Reset Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
