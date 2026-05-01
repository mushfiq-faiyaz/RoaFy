import React, { useEffect, useState } from 'react';
import './ManualBuilder.css';

const ManualBuilder = ({ roadmap, setRoadmap, onSave }) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveText, setSaveText] = useState("SAVE");

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

  const addGroup = (sIdx, ssIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    subsection.groups = [
      ...(subsection.groups || []),
      { id: crypto.randomUUID(), label: "Topics", items: [] }
    ];
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateGroupLabel = (sIdx, ssIdx, gIdx, label) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    const groups = [...(subsection.groups || [])];
    groups[gIdx] = { ...groups[gIdx], label };
    subsection.groups = groups;
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const deleteGroup = (sIdx, ssIdx, gIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    subsection.groups = subsection.groups.filter((_, i) => i !== gIdx);
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const addDirectItem = (sIdx, ssIdx) => {
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

  const updateDirectItemLabel = (sIdx, ssIdx, iIdx, label) => {
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

  const deleteDirectItem = (sIdx, ssIdx, iIdx) => {
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

  const addGroupItem = (sIdx, ssIdx, gIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    const groups = [...(subsection.groups || [])];
    const group = { ...groups[gIdx] };
    group.items = [
      ...(group.items || []),
      { id: crypto.randomUUID(), label: "" }
    ];
    groups[gIdx] = group;
    subsection.groups = groups;
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const updateGroupItemLabel = (sIdx, ssIdx, gIdx, iIdx, label) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    const groups = [...(subsection.groups || [])];
    const group = { ...groups[gIdx] };
    const items = [...(group.items || [])];
    items[iIdx] = { ...items[iIdx], label };
    group.items = items;
    groups[gIdx] = group;
    subsection.groups = groups;
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  const deleteGroupItem = (sIdx, ssIdx, gIdx, iIdx) => {
    const newSections = [...roadmap.sections];
    const section = { ...newSections[sIdx] };
    const subsections = [...(section.subsections || [])];
    const subsection = { ...subsections[ssIdx] };
    const groups = [...(subsection.groups || [])];
    const group = { ...groups[gIdx] };
    group.items = group.items.filter((_, i) => i !== iIdx);
    groups[gIdx] = group;
    subsection.groups = groups;
    subsections[ssIdx] = subsection;
    section.subsections = subsections;
    newSections[sIdx] = section;
    updateState({ ...roadmap, sections: newSections });
  };

  return (
    <div className="manual-builder fade-in">
      <div className="mb-header">
        <input 
          className="mb-title-input" 
          value={roadmap.title} 
          onChange={e => updateState({ ...roadmap, title: e.target.value })} 
          placeholder="Roadmap Title"
        />
        <div className="mb-header-actions">
          <button 
            className="mb-undo-btn"
            onClick={undo} 
            disabled={historyIndex <= 0}
          >
            Undo
          </button>
          <button 
            className="mb-redo-btn"
            onClick={redo} 
            disabled={historyIndex >= history.length - 1}
          >
            Redo
          </button>
          {onSave && (
            <button 
              className="mb-save-btn" 
              onClick={handleSaveClick}
            >
              {saveText}
            </button>
          )}
          <button className="mb-add-section-btn" onClick={addSection}>+ ADD SECTION</button>
        </div>
      </div>

      <div className="mb-sections">
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
              <button className="mb-add-subsection-btn" onClick={() => addSubsection(sIdx)}>+ ADD SUBSECTION</button>
              <button className="mb-delete-section-btn" onClick={() => deleteSection(sIdx)}>✕</button>
            </div>

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
                    <button className="mb-add-item-btn" onClick={() => addDirectItem(sIdx, ssIdx)}>+ ADD ITEM</button>
                    <button className="mb-add-group-btn" onClick={() => addGroup(sIdx, ssIdx)}>+ ADD GROUP</button>
                    <button className="mb-delete-btn" onClick={() => deleteSubsection(sIdx, ssIdx)}>✕</button>
                  </div>

                  <div className="mb-groups">
                    {sub.items?.length > 0 && (
                      <div className="mb-direct-items">
                        {sub.items.map((item, iIdx) => (
                          <div key={item.id} className="mb-item-row">
                            <span className="mb-item-number">{iIdx + 1}.</span>
                            <input 
                              className="mb-item-input" 
                              value={item.label} 
                              onChange={e => updateDirectItemLabel(sIdx, ssIdx, iIdx, e.target.value)} 
                              placeholder="Direct item label"
                            />
                            <button className="mb-item-delete" onClick={() => deleteDirectItem(sIdx, ssIdx, iIdx)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mb-quick-add" onClick={() => addDirectItem(sIdx, ssIdx)}>
                      <span className="mb-quick-add-icon">+</span>
                      <span className="mb-quick-add-text">Add item...</span>
                    </div>

                    {sub.groups?.map((group, gIdx) => (
                      <div key={group.id} className="group-card">
                        <div className="mb-subsection-header">
                          <span className="mb-subsection-number">{sIdx + 1}.{ssIdx + 1}.{gIdx + 1}</span>
                          <div style={{display: 'flex', alignItems: 'baseline', flex: 1, gap: '8px', minWidth: 0}}>
                            <div className="auto-input-wrapper" data-value={group.label || "Group Label (e.g. Topics)"} style={{fontSize: '14px', fontWeight: 600}}>
                              <input 
                                className="mb-subsection-input" 
                                value={group.label} 
                                onChange={e => updateGroupLabel(sIdx, ssIdx, gIdx, e.target.value)} 
                                placeholder="Group Label (e.g. Topics)"
                              />
                            </div>
                            <span style={{color: 'rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap'}}>(Group)</span>
                          </div>
                          <button className="mb-add-item-btn" onClick={() => addGroupItem(sIdx, ssIdx, gIdx)}>+ ADD ITEM</button>
                          <button className="mb-delete-btn" onClick={() => deleteGroup(sIdx, ssIdx, gIdx)}>✕</button>
                        </div>

                        <div className="mb-items">
                          {group.items?.map((item, iIdx) => (
                            <div key={item.id} className="mb-item-row">
                              <span className="mb-item-number">{iIdx + 1}.</span>
                              <input 
                                className="mb-item-input" 
                                value={item.label} 
                                onChange={e => updateGroupItemLabel(sIdx, ssIdx, gIdx, iIdx, e.target.value)} 
                                placeholder="Item label"
                              />
                              <button className="mb-item-delete" onClick={() => deleteGroupItem(sIdx, ssIdx, gIdx, iIdx)}>✕</button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mb-quick-add" onClick={() => addGroupItem(sIdx, ssIdx, gIdx)}>
                          <span className="mb-quick-add-icon">+</span>
                          <span className="mb-quick-add-text">Add item...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualBuilder;
