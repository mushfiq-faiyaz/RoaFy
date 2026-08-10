import React, { useEffect, useState, useRef } from 'react';
import './ManualBuilder.css';
import { ChevronRight, Menu, Eye, Save, X, Undo2, Redo2, Check, Settings } from 'lucide-react';

const MarkerSettingsPopup = ({ currentStyle, onChange, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const options = [
    { value: 'circle', label: 'Circle', glyph: <div className="marker-opt-preview-glyph-circle" /> },
    { value: 'number', label: 'Numbered', glyph: '1.' },
    { value: 'alpha', label: 'Alphabetical', glyph: 'a.' },
    { value: 'roman', label: 'Roman', glyph: 'i.' },
    { value: 'none', label: 'None', glyph: '—' }
  ];

  return (
    <div 
      ref={containerRef}
      className="marker-settings-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="marker-settings-title">
        Marker Style
      </div>
      {options.map((opt) => (
        <div 
          key={opt.value}
          className={`marker-opt-label ${currentStyle === opt.value ? 'active' : ''}`}
          onClick={() => {
            onChange(opt.value);
          }}
        >
          <div className="marker-opt-radio-wrapper">
            <div className="marker-opt-radio-inner" />
          </div>
          <div className="marker-opt-preview-glyph">
            {opt.glyph}
          </div>
          <span className="marker-opt-title">
            {opt.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const getAlphaMarker = (idx) => {
  let num = idx;
  let result = '';
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 97) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result + '.';
};

const getRomanMarker = (num) => {
  const romanNumerals = [
    { value: 1000, numeral: 'm' },
    { value: 900, numeral: 'cm' },
    { value: 500, numeral: 'd' },
    { value: 400, numeral: 'cd' },
    { value: 100, numeral: 'c' },
    { value: 90, numeral: 'xc' },
    { value: 50, numeral: 'l' },
    { value: 40, numeral: 'xl' },
    { value: 10, numeral: 'x' },
    { value: 9, numeral: 'ix' },
    { value: 5, numeral: 'v' },
    { value: 4, numeral: 'iv' },
    { value: 1, numeral: 'i' }
  ];
  let result = '';
  let remaining = num;
  for (const entry of romanNumerals) {
    while (remaining >= entry.value) {
      result += entry.numeral;
      remaining -= entry.value;
    }
  }
  return result + '.';
};

const renderEditModeMarker = (markerStyle, index) => {
  const style = markerStyle || 'circle';
  if (style === 'none') return null;
  if (style === 'circle') {
    return <span className="mb-item-circle-indicator" style={{ cursor: 'grab' }} />;
  }
  let markerText = '';
  if (style === 'number') {
    markerText = `${index + 1}.`;
  } else if (style === 'alpha') {
    markerText = getAlphaMarker(index);
  } else if (style === 'roman') {
    markerText = getRomanMarker(index + 1);
  }
  return <span className="mb-item-number" style={{ cursor: 'grab' }}>{markerText}</span>;
};

const ManualBuilder = ({ roadmap: initialRoadmap, setRoadmap, onSave, onSaveAndExit, onCancel, onGraphThemeChange, onGraphLayoutChange }) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveState, setSaveState] = useState('idle');
  const [revertState, setRevertState] = useState('idle');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [showStickyToolbar, setShowStickyToolbar] = useState(false);
  const [isStickyMenuOpen, setIsStickyMenuOpen] = useState(false);
  const [isStickySettingsOpen, setIsStickySettingsOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [openMarkerSettings, setOpenMarkerSettings] = useState(null);
  const originalToolbarRef = useRef(null);
  const stickySettingsRef = useRef(null);

  const roadmap = history[historyIndex] || initialRoadmap;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
          setShowStickyToolbar(true);
        } else {
          setShowStickyToolbar(false);
        }
      },
      { threshold: 0 }
    );
    
    if (originalToolbarRef.current) {
      observer.observe(originalToolbarRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!initialRoadmap) {
      const initial = { title: "My Roadmap", sections: [] };
      setHistory([initial]);
      setHistoryIndex(0);
    } else if (history.length === 0) {
      setHistory([initialRoadmap]);
      setHistoryIndex(0);
    }
  }, [initialRoadmap, history.length]);

  useEffect(() => {
    const handleRequestCancel = () => {
      if (historyIndex > 0) {
        setShowCancelConfirm(true);
      } else {
        if (onCancel) onCancel();
      }
    };
    window.addEventListener('request-cancel-edit', handleRequestCancel);
    return () => window.removeEventListener('request-cancel-edit', handleRequestCancel);
  }, [historyIndex, onCancel]);

  useEffect(() => {
    const handleRequestSaveExit = () => {
      if (onSaveAndExit) {
        onSaveAndExit(roadmap);
      }
    };
    window.addEventListener('request-save-exit-edit', handleRequestSaveExit);
    return () => window.removeEventListener('request-save-exit-edit', handleRequestSaveExit);
  }, [roadmap, onSaveAndExit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stickySettingsRef.current && !stickySettingsRef.current.contains(event.target)) {
        setIsStickySettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleExternalSettings = (e) => {
      const updatedRoadmap = e.detail;
      const themeChanged = roadmap.graphTheme !== updatedRoadmap.graphTheme;
      const layoutChanged = roadmap.graphLayout !== updatedRoadmap.graphLayout;
      const viewsChanged = JSON.stringify(roadmap.enabledViews) !== JSON.stringify(updatedRoadmap.enabledViews);
      
      if (themeChanged || layoutChanged || viewsChanged) {
        updateState(updatedRoadmap);
      }
    };
    window.addEventListener('external-settings-changed', handleExternalSettings);
    return () => window.removeEventListener('external-settings-changed', handleExternalSettings);
  }, [roadmap, historyIndex, history]);

  if (!roadmap) return null;

  const handleExitRequest = () => {
    if (historyIndex > 0) {
      setShowCancelConfirm(true);
    } else {
      if (onCancel) onCancel();
    }
  };

  const handleRevert = () => {
    setShowRevertConfirm(true);
  };

  const handleRevertConfirm = () => {
    const base = initialRoadmap || { title: 'My Roadmap', sections: [] };
    setHistory([base]);
    setHistoryIndex(0);
    setRoadmap(base);
    setIsReverting(true);
    setTimeout(() => setIsReverting(false), 400);
    setRevertState('reverted');
    setTimeout(() => setRevertState('idle'), 1500);
    setShowRevertConfirm(false);
  };

  const handleSaveClick = () => {
    if (onSave) {
      setRoadmap(roadmap);
      onSave(roadmap);
      
      setHistory([roadmap]);
      setHistoryIndex(0);
      
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    }
  };

  const updateState = (newRoadmap) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newRoadmap);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const addSection = () => {
    updateState({
      ...roadmap,
      sections: [
        ...(roadmap.sections || []),
        { id: crypto.randomUUID(), title: "", subsections: [] }
      ]
    });
  };

  const updateSectionTitle = (sIdx, title) => {
    const newSections = [...roadmap.sections];
    newSections[sIdx] = { ...newSections[sIdx], title };
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSectionMarkerStyle = (sIdx, markerStyle) => {
    const newSections = [...roadmap.sections];
    newSections[sIdx] = { ...newSections[sIdx], markerStyle };
    updateState({ ...roadmap, sections: newSections });
  };

  const deleteSection = (sIdx) => {
    const newSections = roadmap.sections.filter((_, i) => i !== sIdx);
    updateState({ ...roadmap, sections: newSections });
  };

  const addSubsection = (sIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    section.subsections = [
      ...(section.subsections || []),
      { id: crypto.randomUUID(), title: "", groups: [], items: [] }
    ];
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSubsectionTitle = (sIdx, ssIdx, title) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    subsections[ssIdx] = { ...subsections[ssIdx], title };
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSubsectionMarkerStyle = (sIdx, ssIdx, markerStyle) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    subsections[ssIdx] = { ...subsections[ssIdx], markerStyle };
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const deleteSubsection = (sIdx, ssIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    section.subsections = section.subsections.filter((_, i) => i !== ssIdx);
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const addRootItem = () => {
    updateState({
      ...roadmap,
      items: [...(roadmap.items || []), { id: crypto.randomUUID(), label: "" }]
    });
  };

  const updateRootItemLabel = (iIdx, label) => {
    const newItems = [...(roadmap.items || [])];
    newItems[iIdx] = { ...newItems[iIdx], label };
    updateState({ ...roadmap, items: newItems });
  };

  const deleteRootItem = (iIdx) => {
    const newItems = (roadmap.items || []).filter((_, i) => i !== iIdx);
    updateState({ ...roadmap, items: newItems });
  };

  const addSectionItem = (sIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    section.items = [...(section.items || []), { id: crypto.randomUUID(), label: "" }];
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSectionItemLabel = (sIdx, iIdx, label) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const items = [...(section.items || [])];
    items[iIdx] = { ...items[iIdx], label };
    section.items = items;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const deleteSectionItem = (sIdx, iIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    section.items = (section.items || []).filter((_, i) => i !== iIdx);
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const addSubsectionItem = (sIdx, ssIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    subsection.items = [
      ...(subsection.items || []),
      { id: crypto.randomUUID(), label: "" }
    ];
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSubsectionItemLabel = (sIdx, ssIdx, iIdx, label) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    const items = [...(subsection.items || [])];
    items[iIdx] = { ...items[iIdx], label };
    subsection.items = items;
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const deleteSubsectionItem = (sIdx, ssIdx, iIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    subsection.items = subsection.items.filter((_, i) => i !== iIdx);
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const [openDescs, setOpenDescs] = useState({});
  const toggleDesc = (id) => setOpenDescs(p => ({...p, [id]: !p[id]}));

  const updateRootDesc = (value) => updateState({ ...roadmap, description: value });
  
  const updateSectionDesc = (sIdx, value) => {
    const newSections = [...roadmap.sections];
    newSections[sIdx] = { ...newSections[sIdx], description: value };
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSubsectionDesc = (sIdx, ssIdx, value) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    subsections[ssIdx] = { ...subsections[ssIdx], description: value };
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateRootItemDesc = (iIdx, value) => {
    const newItems = [...(roadmap.items || [])];
    newItems[iIdx] = { ...newItems[iIdx], description: value };
    updateState({ ...roadmap, items: newItems });
  };

  const updateSectionItemDesc = (sIdx, iIdx, value) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const items = [...(section.items || [])];
    items[iIdx] = { ...items[iIdx], description: value };
    section.items = items;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateSubsectionItemDesc = (sIdx, ssIdx, iIdx, value) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    const items = [...(subsection.items || [])];
    items[iIdx] = { ...items[iIdx], description: value };
    subsection.items = items;
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const [draggedItem, setDraggedItem] = useState(null);
  const handleDragStart = (e, path) => { setDraggedItem(path); e.stopPropagation(); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetPath) => {
    e.stopPropagation();
    if (!draggedItem) return;
    if (draggedItem.type === targetPath.type) {
      if (draggedItem.type === 'root') {
        const newItems = [...roadmap.items];
        const [moved] = newItems.splice(draggedItem.iIdx, 1);
        newItems.splice(targetPath.iIdx, 0, moved);
        updateState({ ...roadmap, items: newItems });
      } else if (draggedItem.type === 'section' && draggedItem.sIdx === targetPath.sIdx) {
        const newSections = [...roadmap.sections];
        const section = { ...newSections[draggedItem.sIdx] };
        const newItems = [...section.items];
        const [moved] = newItems.splice(draggedItem.iIdx, 1);
        newItems.splice(targetPath.iIdx, 0, moved);
        section.items = newItems;
        newSections[draggedItem.sIdx] = section;
        updateState({ ...roadmap, sections: newSections });
      } else if (draggedItem.type === 'subsection' && draggedItem.sIdx === targetPath.sIdx && draggedItem.ssIdx === targetPath.ssIdx) {
        const newSections = [...roadmap.sections];
        const section = { ...newSections[draggedItem.sIdx] };
        const newSub = [...section.subsections];
        const sub = { ...newSub[draggedItem.ssIdx] };
        const newItems = [...sub.items];
        const [moved] = newItems.splice(draggedItem.iIdx, 1);
        newItems.splice(targetPath.iIdx, 0, moved);
        sub.items = newItems;
        newSub[draggedItem.ssIdx] = sub;
        section.subsections = newSub;
        newSections[draggedItem.sIdx] = section;
        updateState({ ...roadmap, sections: newSections });
      }
    }
    setDraggedItem(null);
  };

  return (
    <div className="manual-builder fade-in">
      <div className="mb-header" ref={originalToolbarRef}>
        <div className="auto-input-wrapper" data-value={roadmap.title || "Roadmap Title"} style={{ flex: 1, minWidth: 0, marginRight: '16px' }}>
          <input 
            className="mb-title-input" 
            value={roadmap.title} 
            onChange={e => updateState({ ...roadmap, title: e.target.value })} 
            placeholder="Roadmap Title"
          />
        </div>
        <div className="mb-header-actions-container">
          <div className="mb-header-actions-group controls-group">
            {onCancel && (
              <button
                className={`mb-revert-btn${revertState === 'reverted' ? ' reverted-state' : ''}`}
                onClick={handleRevert}
                title="Revert all unsaved changes"
              >
                {revertState === 'reverted' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '13px' }}>↺</span>
                    <span>Reverted</span>
                  </div>
                ) : 'Revert'}
              </button>
            )}
            <div className="mb-undo-redo-group">
              <button 
                className="mb-undo-btn"
                onClick={undo} 
                disabled={historyIndex <= 0}
                title="Undo"
              >
                ↩
              </button>
              <button 
                className="mb-redo-btn"
                onClick={redo} 
                disabled={historyIndex >= history.length - 1}
                title="Redo"
              >
                ↪
              </button>
            </div>
            {onSave && (
              <button 
                className={`mb-save-btn ${saveState === 'saved' ? 'saved-state' : ''}`} 
                onClick={handleSaveClick}
              >
                {saveState === 'saved' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} strokeWidth={3} />
                    <span>Saved</span>
                  </div>
                ) : (
                  "SAVE"
                )}
              </button>
            )}
          </div>
          
          <div className="mb-header-actions-divider"></div>
          
          <div className="mb-header-actions-group adds-group">
            <button className="mb-add-action-btn btn-item" onClick={addRootItem}>+ ITEM</button>
            <button className="mb-add-action-btn btn-section" onClick={addSection}>+ SECTION</button>
            <button className={`mb-add-action-btn btn-note ${openDescs['roadmap'] ? 'active' : ''}`} onClick={() => toggleDesc('roadmap')} title="Add description">
              {openDescs['roadmap'] ? '- NOTE' : '+ NOTE'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-sticky-wrapper">
        <div className={`mb-sticky-toolbar ${showStickyToolbar ? 'visible' : ''}`}>
          <div className="mb-sticky-toolbar-content">
            <div className="mb-sticky-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onCancel && (
                <button
                  className={`mb-revert-sticky-btn${revertState === 'reverted' ? ' reverted-state' : ''}`}
                  onClick={handleRevert}
                  title="Revert all unsaved changes"
                >
                  {revertState === 'reverted' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '13px' }}>↺</span>
                      <span>Reverted</span>
                    </div>
                  ) : 'Revert'}
                </button>
              )}
              <button className="menu-btn" onClick={undo} disabled={historyIndex <= 0} title="Undo">
                <Undo2 size={18} />
              </button>
              <button className="menu-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
                <Redo2 size={18} />
              </button>
            </div>
            <div className="mb-sticky-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {onSave && (
                <button 
                  className={`mb-save-btn ${saveState === 'saved' ? 'saved-state' : ''}`} 
                  onClick={handleSaveClick}
                >
                  {saveState === 'saved' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} strokeWidth={3} />
                      <span>Saved</span>
                    </div>
                  ) : (
                    "SAVE"
                  )}
                </button>
              )}
              <div className="menu-container" style={{ position: 'relative' }} ref={stickySettingsRef}>
                <button 
                  className={`menu-btn ${isStickySettingsOpen ? 'active' : ''}`} 
                  onClick={() => { setIsStickySettingsOpen(!isStickySettingsOpen); setIsStickyMenuOpen(false); }}
                  title="Map Settings"
                >
                  <Settings size={20} />
                </button>
                {isStickySettingsOpen && (
                  <div className="dropdown-menu settings-dropdown" style={{ top: '100%', right: '0', marginTop: '8px' }}>
                    <div className="settings-list">
                      <div className="dropdown-section">
                        <div className="dropdown-section-label">Graph Style</div>
                        <div className="segmented-control">
                          <button 
                            className={`segmented-btn ${(roadmap?.graphTheme || 'classic') === 'classic' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = { ...roadmap, graphTheme: 'classic' };
                              updateState(updated);
                              if (onGraphThemeChange) onGraphThemeChange('classic');
                            }}
                          >
                            Classic
                          </button>
                          <button 
                            className={`segmented-btn ${(roadmap?.graphTheme || 'classic') === 'vivid' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = { ...roadmap, graphTheme: 'vivid' };
                              updateState(updated);
                              if (onGraphThemeChange) onGraphThemeChange('vivid');
                            }}
                          >
                            Vivid
                          </button>
                        </div>
                      </div>

                      <div className="dropdown-section">
                        <div className="dropdown-section-label">Graph Layout</div>
                        <div className="segmented-control">
                          <button 
                            className={`segmented-btn ${(roadmap?.graphLayout || 'vertical') === 'vertical' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = { ...roadmap, graphLayout: 'vertical' };
                              updateState(updated);
                              if (onGraphLayoutChange) onGraphLayoutChange('vertical');
                            }}
                          >
                            Vertical
                          </button>
                          <button 
                            className={`segmented-btn ${(roadmap?.graphLayout || 'vertical') === 'horizontal' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = { ...roadmap, graphLayout: 'horizontal' };
                              updateState(updated);
                              if (onGraphLayoutChange) onGraphLayoutChange('horizontal');
                            }}
                          >
                            Horizontal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="menu-container" style={{ position: 'relative' }}>
                <button className="menu-btn" onClick={() => { setIsStickyMenuOpen(!isStickyMenuOpen); setIsStickySettingsOpen(false); }}>
                  <Menu size={20} />
                </button>
                {isStickyMenuOpen && (
                  <div className="dropdown-menu" style={{ top: '100%', right: '0', marginTop: '8px' }}>
                    <div className="dropdown-item" onClick={() => { 
                      setIsStickyMenuOpen(false); 
                      handleExitRequest();
                    }}>
                      <Eye size={16} /> View Mode
                    </div>
                    <div className="dropdown-item" onClick={() => { 
                      if (onSaveAndExit) onSaveAndExit(roadmap);
                      setIsStickyMenuOpen(false); 
                    }}>
                      <Save size={16} /> Save & Exit
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openDescs['roadmap'] && (
        <div className="mb-desc-container" style={{padding: '0 0 16px 0'}}>
          <div className="mb-desc-wrapper">
            <textarea className="mb-desc-textarea" placeholder="Add roadmap description..." value={roadmap.description || ''} onChange={e => updateRootDesc(e.target.value)} />
            <span className="mb-desc-icon">✎</span>
            <span className="mb-desc-count">{(roadmap.description || '').length}</span>
          </div>
        </div>
      )}

      <div className={`mb-sections${isReverting ? ' revert-pulse' : ''}`}>
        {roadmap.items?.length > 0 && (
          <div className="mb-direct-items" style={{marginBottom: '16px', background: '#16161a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
            <div style={{color:'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:600, marginBottom:'12px', textTransform:'uppercase'}}>Roadmap Items</div>
            {roadmap.items.map((item, iIdx) => (
              <React.Fragment key={item.id}>
                <div 
                  className="mb-item-row"
                  data-scroll-anchor={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { type: 'root', iIdx })}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, { type: 'root', iIdx })}
                >
                  <span className="mb-item-number" style={{cursor: 'grab'}}>{iIdx + 1}.</span>
                  <div className="auto-input-wrapper" data-value={item.label || "Root item label"} style={{ flex: 1, minWidth: 0 }}>
                    <input 
                      className="mb-item-input" 
                      value={item.label} 
                      onChange={e => updateRootItemLabel(iIdx, e.target.value)} 
                      placeholder="Root item label"
                    />
                  </div>
                  <button className={`mb-text-btn ${openDescs[item.id] ? 'active' : ''}`} onClick={() => toggleDesc(item.id)} title="Add description">
                    {openDescs[item.id] ? '- Note' : '+ Note'}
                  </button>
                  <button className="mb-item-delete" onClick={() => deleteRootItem(iIdx)}>✕</button>
                </div>
                {openDescs[item.id] && (
                  <div className="mb-desc-container">
                    <div className="mb-desc-wrapper">
                      <textarea className="mb-desc-textarea" placeholder="Add description..." value={item.description || ''} onChange={e => updateRootItemDesc(iIdx, e.target.value)} />
                      <span className="mb-desc-icon">✎</span>
                      <span className="mb-desc-count">{(item.description || '').length}</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {roadmap.sections?.map((section, sIdx) => (
          <div 
            key={section.id} 
            className={`section-card ${openMarkerSettings?.type === 'section' && openMarkerSettings?.sIdx === sIdx ? 'has-open-settings' : ''}`} 
            data-section-index={sIdx} 
            data-scroll-anchor={section.id}
          >
            <div className="mb-section-header">
              <span className="mb-section-number">{sIdx + 1}.</span>
              <div style={{display: 'flex', alignItems: 'center', flex: 1, gap: '8px', minWidth: 0}}>
                <div className="auto-input-wrapper" data-value={section.title || "Section Title"} style={{fontSize: '18px', fontWeight: 700}}>
                  <input 
                    className="mb-section-input" 
                    value={section.title} 
                    onChange={e => updateSectionTitle(sIdx, e.target.value)} 
                    placeholder="Section Title"
                  />
                </div>
                <span style={{color: 'rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap'}}>(Section)</span>
                
                {/* Marker style settings */}
                <div className="marker-settings-container" style={{ position: 'relative' }}>
                  <button 
                    className={`marker-settings-btn ${openMarkerSettings?.type === 'section' && openMarkerSettings?.sIdx === sIdx ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openMarkerSettings?.type === 'section' && openMarkerSettings?.sIdx === sIdx) {
                        setOpenMarkerSettings(null);
                      } else {
                        setOpenMarkerSettings({ type: 'section', sIdx });
                      }
                    }}
                    title="Marker Style Settings"
                  >
                    <Settings size={14} />
                  </button>
                  {openMarkerSettings?.type === 'section' && openMarkerSettings?.sIdx === sIdx && (
                    <MarkerSettingsPopup 
                      currentStyle={section.markerStyle || 'circle'}
                      onChange={(style) => updateSectionMarkerStyle(sIdx, style)}
                      onClose={() => setOpenMarkerSettings(null)}
                    />
                  )}
                </div>
              </div>
              <button className="mb-add-item-btn" onClick={() => addSectionItem(sIdx)}>+ ITEM</button>
              <button className="mb-add-subsection-btn" onClick={() => addSubsection(sIdx)}>+ SUBSECTION</button>
              <button className={`mb-text-btn ${openDescs[section.id] ? 'active' : ''}`} onClick={() => toggleDesc(section.id)} title="Add description">
                {openDescs[section.id] ? '- Note' : '+ Note'}
              </button>
              <button className="mb-delete-section-btn" onClick={() => deleteSection(sIdx)}>✕</button>
            </div>
            {openDescs[section.id] && (
              <div className="mb-desc-container">
                <div className="mb-desc-wrapper">
                  <textarea className="mb-desc-textarea" placeholder="Add section description..." value={section.description || ''} onChange={e => updateSectionDesc(sIdx, e.target.value)} />
                  <span className="mb-desc-icon">✎</span>
                  <span className="mb-desc-count">{(section.description || '').length}</span>
                </div>
              </div>
            )}

            {section.items?.length > 0 && (
              <div className="mb-direct-items mb-section-items">
                {section.items.map((item, iIdx) => (
                  <React.Fragment key={item.id}>
                    <div 
                      className="mb-item-row"
                      data-scroll-anchor={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { type: 'section', sIdx, iIdx })}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, { type: 'section', sIdx, iIdx })}
                    >
                      {renderEditModeMarker(section.markerStyle, iIdx)}
                      <div className="auto-input-wrapper" data-value={item.label || "Section item label"} style={{ flex: 1, minWidth: 0 }}>
                        <input 
                          className="mb-item-input" 
                          value={item.label} 
                          onChange={e => updateSectionItemLabel(sIdx, iIdx, e.target.value)} 
                          placeholder="Section item label"
                        />
                      </div>
                      <button className={`mb-text-btn ${openDescs[item.id] ? 'active' : ''}`} onClick={() => toggleDesc(item.id)} title="Add description">
                        {openDescs[item.id] ? '- Note' : '+ Note'}
                      </button>
                      <button className="mb-item-delete" onClick={() => deleteSectionItem(sIdx, iIdx)}>✕</button>
                    </div>
                    {openDescs[item.id] && (
                      <div className="mb-desc-container">
                        <div className="mb-desc-wrapper">
                          <textarea className="mb-desc-textarea" placeholder="Add description..." value={item.description || ''} onChange={e => updateSectionItemDesc(sIdx, iIdx, e.target.value)} />
                          <span className="mb-desc-icon">✎</span>
                          <span className="mb-desc-count">{(item.description || '').length}</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="mb-subsections">
              {section.subsections?.map((sub, ssIdx) => (
                <div 
                  key={sub.id} 
                  className={`subsection-card ${openMarkerSettings?.type === 'subsection' && openMarkerSettings?.sIdx === sIdx && openMarkerSettings?.ssIdx === ssIdx ? 'has-open-settings' : ''}`} 
                  data-scroll-anchor={sub.id}
                >
                  <div className="mb-subsection-header">
                    <span className="mb-subsection-number">{sIdx + 1}.{ssIdx + 1}</span>
                    <div style={{display: 'flex', alignItems: 'center', flex: 1, gap: '8px', minWidth: 0}}>
                      <div className="auto-input-wrapper" data-value={sub.title || "Subsection Title"} style={{fontSize: '14px', fontWeight: 600}}>
                        <input 
                          className="mb-subsection-input" 
                          value={sub.title} 
                          onChange={e => updateSubsectionTitle(sIdx, ssIdx, e.target.value)} 
                          placeholder="Subsection Title"
                        />
                      </div>
                      <span style={{color: 'rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap'}}>(Subsection)</span>
                      
                      {/* Marker style settings */}
                      <div className="marker-settings-container" style={{ position: 'relative' }}>
                        <button 
                          className={`marker-settings-btn ${openMarkerSettings?.type === 'subsection' && openMarkerSettings?.sIdx === sIdx && openMarkerSettings?.ssIdx === ssIdx ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openMarkerSettings?.type === 'subsection' && openMarkerSettings?.sIdx === sIdx && openMarkerSettings?.ssIdx === ssIdx) {
                              setOpenMarkerSettings(null);
                            } else {
                              setOpenMarkerSettings({ type: 'subsection', sIdx, ssIdx });
                            }
                          }}
                          title="Marker Style Settings"
                        >
                          <Settings size={12} />
                        </button>
                        {openMarkerSettings?.type === 'subsection' && openMarkerSettings?.sIdx === sIdx && openMarkerSettings?.ssIdx === ssIdx && (
                          <MarkerSettingsPopup 
                            currentStyle={sub.markerStyle || 'circle'}
                            onChange={(style) => updateSubsectionMarkerStyle(sIdx, ssIdx, style)}
                            onClose={() => setOpenMarkerSettings(null)}
                          />
                        )}
                      </div>
                    </div>
                    <button className="mb-add-item-btn" onClick={() => addSubsectionItem(sIdx, ssIdx)}>+ ITEM</button>
                    <button className={`mb-text-btn ${openDescs[sub.id] ? 'active' : ''}`} onClick={() => toggleDesc(sub.id)} title="Add description">
                      {openDescs[sub.id] ? '- Note' : '+ Note'}
                    </button>
                    <button className="mb-delete-btn" onClick={() => deleteSubsection(sIdx, ssIdx)}>✕</button>
                  </div>
                  {openDescs[sub.id] && (
                    <div className="mb-desc-container">
                      <div className="mb-desc-wrapper">
                        <textarea className="mb-desc-textarea" placeholder="Add subsection description..." value={sub.description || ''} onChange={e => updateSubsectionDesc(sIdx, ssIdx, e.target.value)} />
                        <span className="mb-desc-icon">✎</span>
                        <span className="mb-desc-count">{(sub.description || '').length}</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-groups">
                    {sub.items?.length > 0 && (
                      <div className="mb-direct-items">
                        {sub.items.map((item, iIdx) => (
                          <React.Fragment key={item.id}>
                            <div 
                              className="mb-item-row mb-subsection-item"
                              data-scroll-anchor={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, { type: 'subsection', sIdx, ssIdx, iIdx })}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, { type: 'subsection', sIdx, ssIdx, iIdx })}
                            >
                              {renderEditModeMarker(sub.markerStyle || section.markerStyle, iIdx)}
                              <div className="auto-input-wrapper" data-value={item.label || "Item label"} style={{ flex: 1, minWidth: 0 }}>
                                <input 
                                  className="mb-item-input" 
                                  value={item.label} 
                                  onChange={e => updateSubsectionItemLabel(sIdx, ssIdx, iIdx, e.target.value)} 
                                  placeholder="Item label"
                                />
                              </div>
                              <button className={`mb-text-btn ${openDescs[item.id] ? 'active' : ''}`} onClick={() => toggleDesc(item.id)} title="Add description">
                                {openDescs[item.id] ? '- Note' : '+ Note'}
                              </button>
                              <button className="mb-item-delete" onClick={() => deleteSubsectionItem(sIdx, ssIdx, iIdx)}>✕</button>
                            </div>
                            {openDescs[item.id] && (
                              <div className="mb-desc-container">
                                <div className="mb-desc-wrapper">
                                  <textarea className="mb-desc-textarea" placeholder="Add description..." value={item.description || ''} onChange={e => updateSubsectionItemDesc(sIdx, ssIdx, iIdx, e.target.value)} />
                                  <span className="mb-desc-icon">✎</span>
                                  <span className="mb-desc-count">{(item.description || '').length}</span>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    <div className="mb-quick-add" onClick={() => addSubsectionItem(sIdx, ssIdx)}>
                      <span className="mb-quick-add-icon">+</span>
                      <span className="mb-quick-add-text">Add item...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showRevertConfirm && (
        <div className="modal-overlay" onClick={() => setShowRevertConfirm(false)}>
          <div className="modal-content revert-modal" onClick={e => e.stopPropagation()}>
            <div className="revert-modal-icon">↺</div>
            <h3>Revert all changes?</h3>
            <p>This will undo all unsaved edits and restore the last saved state.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowRevertConfirm(false)}>Cancel</button>
              <button className="modal-btn-danger" onClick={handleRevertConfirm}>Revert</button>
            </div>
          </div>
        </div>
      )}
      {showCancelConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Unsaved Changes</h3>
            <p>You have unsaved changes. If you leave now, your edits will be lost.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowCancelConfirm(false)}>Keep Editing</button>
              <button 
                className="modal-btn-cancel danger-item" 
                onClick={() => {
                  setShowCancelConfirm(false);
                  if (onCancel) onCancel();
                }}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualBuilder;
