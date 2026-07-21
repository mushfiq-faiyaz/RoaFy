import React, { useState } from 'react';
import { Calendar, Edit, X, AlertCircle } from 'lucide-react';
import './TimelineView.css';

const ACCENT_CLASSES = ['accent-blue', 'accent-purple', 'accent-green', 'accent-orange'];

const TimelineView = ({ roadmap, onUpdateSectionDates }) => {
  const [modalSectionIdx, setModalSectionIdx] = useState(null);
  const [modalSectionTitle, setModalSectionTitle] = useState('');
  const [modalStartMonth, setModalStartMonth] = useState('');
  const [modalEndMonth, setModalEndMonth] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!roadmap || !roadmap.sections) return null;

  // Add the original index to each section to make updates bulletproof
  const sectionsWithIndex = roadmap.sections.map((section, idx) => ({
    ...section,
    originalIndex: idx
  }));

  const phasesWithDates = sectionsWithIndex.filter(p => p.startDate && p.endDate);
  const phasesWithoutDates = sectionsWithIndex.filter(p => !p.startDate || !p.endDate);
  const hasMissingDates = phasesWithoutDates.length > 0;

  // Helper to format month strings (YYYY-MM) to short readable labels (e.g. Jul 2026)
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  // Generate month list spanning between min start and max end dates
  const getMonthsList = () => {
    if (phasesWithDates.length === 0) return [];
    
    let minStr = null;
    let maxStr = null;
    
    phasesWithDates.forEach(p => {
      if (!minStr || p.startDate < minStr) minStr = p.startDate;
      if (!maxStr || p.endDate > maxStr) maxStr = p.endDate;
    });

    const list = [];
    let [minYear, minMonth] = minStr.split('-').map(Number);
    let [maxYear, maxMonth] = maxStr.split('-').map(Number);
    
    let curYear = minYear;
    let curMonth = minMonth;
    
    while (curYear < maxYear || (curYear === maxYear && curMonth <= maxMonth)) {
      list.push({
        key: `${curYear}-${String(curMonth).padStart(2, '0')}`,
        year: curYear,
        month: curMonth,
        label: new Date(curYear, curMonth - 1).toLocaleString('default', { month: 'short' })
      });
      
      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }
    return list;
  };

  const monthsList = getMonthsList();

  // Modal actions
  const openEditModal = (phase, originalIdx) => {
    setModalSectionIdx(originalIdx);
    setModalSectionTitle(phase.title || 'Edit Phase Dates');
    setModalStartMonth(phase.startDate || '');
    setModalEndMonth(phase.endDate || '');
    setValidationError('');
  };

  const closeModal = () => {
    setModalSectionIdx(null);
    setModalSectionTitle('');
    setModalStartMonth('');
    setModalEndMonth('');
    setValidationError('');
  };

  const handleSaveDates = () => {
    if (!modalStartMonth || !modalEndMonth) {
      setValidationError('Please select both start and end months.');
      return;
    }
    if (modalStartMonth > modalEndMonth) {
      setValidationError('Start month must be before or equal to End month.');
      return;
    }
    
    onUpdateSectionDates(modalSectionIdx, modalStartMonth, modalEndMonth);
    closeModal();
  };

  const handleClearDates = () => {
    onUpdateSectionDates(modalSectionIdx, null, null);
    closeModal();
  };

  return (
    <div className="timeline-view-wrapper fade-in">
      {/* Date Banner Alert at the top */}
      {hasMissingDates && (
        <div className="timeline-banner">
          <AlertCircle size={18} className="banner-icon" />
          <span>Set phase dates to use Timeline view</span>
        </div>
      )}

      {/* List of dateless phase cards */}
      {phasesWithoutDates.length > 0 && (
        <div className="timeline-unmapped-container">
          <h3 className="unmapped-header">Phases Without Dates</h3>
          <div className="unmapped-grid">
            {phasesWithoutDates.map((phase) => (
              <div key={phase.id || `unmapped-${phase.originalIndex}`} className="unmapped-card">
                <span className="unmapped-card-title">{phase.title || 'Untitled Phase'}</span>
                <button 
                  className="timeline-set-dates-btn"
                  onClick={() => openEditModal(phase, phase.originalIndex)}
                >
                  <Calendar size={14} />
                  Set Dates
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vertical Gantt-style Timeline Grid */}
      {phasesWithDates.length > 0 && (
        <div className="timeline-main-container">
          <h3 className="timeline-header">Timeline Grid</h3>
          <div className="timeline-grid-outer">
            <div className="timeline-grid-container">
              {/* Left Column (Sticky Month Labels) */}
              <div className="timeline-months-column">
                {monthsList.map((m) => (
                  <div key={m.key} className="timeline-month-row">
                    <span className="month-name">{m.label}</span>
                    <span className="month-year">{m.year}</span>
                  </div>
                ))}
              </div>

              {/* Right Area (Scrollable Phase Columns and Bars) */}
              <div className="timeline-phases-area">
                <div 
                  className="timeline-phases-grid" 
                  style={{ 
                    height: `${monthsList.length * 76}px`,
                    width: `${phasesWithDates.length * 160 + 16}px`
                  }}
                >
                  {/* Grid horizontal guidelines */}
                  {monthsList.map((m, idx) => (
                    <div 
                      key={m.key} 
                      className="timeline-grid-row-line"
                      style={{ top: `${idx * 76}px` }}
                    />
                  ))}

                  {/* Vertical Gantt bars for each phase */}
                  {phasesWithDates.map((phase, colIdx) => {
                    const startIdx = monthsList.findIndex(m => m.key === phase.startDate);
                    const endIdx = monthsList.findIndex(m => m.key === phase.endDate);
                    
                    if (startIdx === -1 || endIdx === -1) return null;
                    
                    const duration = endIdx - startIdx + 1;
                    const isShort = duration === 1;
                    const colorClass = ACCENT_CLASSES[colIdx % ACCENT_CLASSES.length];
                    
                    // Style height and top offset according to row index
                    const barStyle = {
                      top: `${startIdx * 76 + 8}px`,
                      height: `${duration * 76 - 16}px`,
                      left: `${colIdx * 160 + 16}px`,
                      width: '124px'
                    };

                    return (
                      <div 
                        key={phase.id || `bar-${phase.originalIndex}`} 
                        className={`timeline-bar ${colorClass} ${isShort ? 'short-bar' : ''}`}
                        style={barStyle}
                        onClick={() => openEditModal(phase, phase.originalIndex)}
                        title={`${phase.title} (${formatMonth(phase.startDate)} - ${formatMonth(phase.endDate)})`}
                      >
                        <div className="timeline-bar-content">
                          <span className="timeline-bar-text">{phase.title}</span>
                        </div>
                        {isShort && (
                          <span className="timeline-bar-label-outside">{phase.title}</span>
                        )}
                        <span className="timeline-bar-edit-icon">
                          <Edit size={10} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Setter Picker Modal Overlay */}
      {modalSectionIdx !== null && (
        <div className="timeline-modal-overlay" onClick={closeModal}>
          <div className="timeline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="timeline-modal-header">
              <h3>Set Phase Dates</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            <div className="timeline-modal-body">
              <div className="modal-phase-name">"{modalSectionTitle}"</div>
              
              {validationError && (
                <div className="modal-validation-error">
                  <AlertCircle size={14} />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="modal-form-group">
                <label className="modal-label">Start Month</label>
                <input 
                  type="month" 
                  className="modal-date-input"
                  value={modalStartMonth}
                  onChange={(e) => {
                    setModalStartMonth(e.target.value);
                    setValidationError('');
                  }}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">End Month</label>
                <input 
                  type="month" 
                  className="modal-date-input"
                  value={modalEndMonth}
                  onChange={(e) => {
                    setModalEndMonth(e.target.value);
                    setValidationError('');
                  }}
                />
              </div>
            </div>

            <div className="timeline-modal-actions">
              {(roadmap.sections[modalSectionIdx]?.startDate || roadmap.sections[modalSectionIdx]?.endDate) && (
                <button className="modal-btn-clear" onClick={handleClearDates}>
                  Clear Dates
                </button>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button className="modal-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button className="modal-btn-save" onClick={handleSaveDates}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
