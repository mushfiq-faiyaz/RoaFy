import React, { useEffect, useState } from 'react';
import './ManualBuilder.css';
import { ChevronRight } from 'lucide-react';

const ManualBuilder = ({ roadmap, setRoadmap, onSave, onCancel }) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveText, setSaveText] = useState("SAVE");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!roadmap) {
      const initial = { title: "My Roadmap", sections: [] };
      setRoadmap(initial);
      setHistory([initial]);
      setHistoryIndex(0);
    } else if (history.length === 0) {
      setHistory([roadmap]);
      setHistoryIndex(0);
    }
  }, [roadmap, setRoadmap, history.length]);

  if (!roadmap) return null;

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      setSaveText("SAVED!");
      setTimeout(() => setSaveText("SAVE"), 2000);
    }
  };

  const updateState = (newRoadmap) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newRoadmap);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setRoadmap(newRoadmap);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setRoadmap(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setRoadmap(history[newIndex]);
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
      <div className="mb-header">
        <div className="auto-input-wrapper" data-value={roadmap.title || "Roadmap Title"} style={{ flex: 1, minWidth: 0, marginRight: '16px' }}>
          <input 
            className="mb-title-input" 
            value={roadmap.title} 
            onChange={e => updateState({ ...roadmap, title: e.target.value })} 
            placeholder="Roadmap Title"
          />
        </div>
        <div className="mb-header-actions">
          {onCancel && (
            <button className="mb-cancel-btn" onClick={() => setShowCancelConfirm(true)} title="Cancel">
              ✕
            </button>
          )}
          <button className={`mb-text-btn ${openDescs['roadmap'] ? 'active' : ''}`} onClick={() => toggleDesc('roadmap')} title="Add description">
            {openDescs['roadmap'] ? '- Note' : '+ Note'}
          </button>
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
          {onSave && (
            <button 
              className="mb-save-btn" 
              onClick={handleSaveClick}
            >
              {saveText}
            </button>
          )}
          <button className="mb-add-item-btn" onClick={addRootItem}>+ ITEM</button>
          <button className="mb-add-section-btn" onClick={addSection}>+ SECTION</button>
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

      <div className="mb-sections">
        {roadmap.items?.length > 0 && (
          <div className="mb-direct-items" style={{marginBottom: '16px', background: '#16161a', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
            <div style={{color:'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:600, marginBottom:'12px', textTransform:'uppercase'}}>Roadmap Items</div>
            {roadmap.items.map((item, iIdx) => (
              <React.Fragment key={item.id}>
                <div 
                  className="mb-item-row"
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
          <div key={section.id} className="section-card">
            <div className="mb-section-header">
              <span className="mb-section-number">{sIdx + 1}.</span>
              <div style={{display: 'flex', alignItems: 'baseline', flex: 1, gap: '8px', minWidth: 0}}>
                <div className="auto-input-wrapper" data-value={section.title || "Section Title"} style={{fontSize: '18px', fontWeight: 700}}>
                  <input 
                    className="mb-section-input" 
                    value={section.title} 
                    onChange={e => updateSectionTitle(sIdx, e.target.value)} 
                    placeholder="Section Title"
                  />
                </div>
                <span style={{color: 'rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap'}}>(Section)</span>
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, { type: 'section', sIdx, iIdx })}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, { type: 'section', sIdx, iIdx })}
                    >
                      <span className="mb-item-number" style={{cursor: 'grab'}}>{iIdx + 1}.</span>
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
                <div key={sub.id} className="subsection-card">
                  <div className="mb-subsection-header">
                    <span className="mb-subsection-number">{sIdx + 1}.{ssIdx + 1}</span>
                    <div style={{display: 'flex', alignItems: 'baseline', flex: 1, gap: '8px', minWidth: 0}}>
                      <div className="auto-input-wrapper" data-value={sub.title || "Subsection Title"} style={{fontSize: '14px', fontWeight: 600}}>
                        <input 
                          className="mb-subsection-input" 
                          value={sub.title} 
                          onChange={e => updateSubsectionTitle(sIdx, ssIdx, e.target.value)} 
                          placeholder="Subsection Title"
                        />
                      </div>
                      <span style={{color: 'rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap'}}>(Subsection)</span>
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
                              className="mb-item-row"
                              draggable
                              onDragStart={(e) => handleDragStart(e, { type: 'subsection', sIdx, ssIdx, iIdx })}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, { type: 'subsection', sIdx, ssIdx, iIdx })}
                            >
                              <span className="mb-item-number" style={{cursor: 'grab'}}>{iIdx + 1}.</span>
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
      {showCancelConfirm && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Discard changes?</h3>
            <p>Are you sure you want to discard your edits?</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowCancelConfirm(false)}>Keep Editing</button>
              <button className="modal-btn-danger" onClick={() => {
                setShowCancelConfirm(false);
                if (history.length > 0) {
                  setRoadmap(history[0]);
                }
                if (onCancel) onCancel();
              }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualBuilder;
