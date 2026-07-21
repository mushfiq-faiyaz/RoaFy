import React, { useState, useRef } from 'react';
import { ListTodo, Clock, CheckCircle } from 'lucide-react';
import './BoardView.css';

const BoardView = ({ roadmap, progress, onItemStatusChange }) => {
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [popupItem, setPopupItem] = useState(null);

  const boardContainerRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartRef = useRef(null);

  // Helper to extract all items recursively from the roadmap
  const getAllRoadmapItems = (map) => {
    if (!map) return [];
    const items = [];

    // 1. Direct items at the root level of the roadmap
    if (map.items) {
      map.items.forEach(item => {
        items.push({
          ...item,
          phase: map.title || 'General'
        });
      });
    }

    // 2. Items within sections/subsections
    if (map.sections) {
      map.sections.forEach(section => {
        const sectionTitle = section.title || 'Untitled Section';
        
        // Direct section items
        if (section.items) {
          section.items.forEach(item => {
            items.push({
              ...item,
              phase: sectionTitle
            });
          });
        }
        
        // Subsection items
        if (section.subsections) {
          section.subsections.forEach(sub => {
            if (sub.items) {
              sub.items.forEach(item => {
                items.push({
                  ...item,
                  phase: sectionTitle
                });
              });
            }
            
            // Subsection group items
            if (sub.groups) {
              sub.groups.forEach(group => {
                if (group.items) {
                  group.items.forEach(item => {
                    items.push({
                      ...item,
                      phase: sectionTitle
                    });
                  });
                }
              });
            }
          });
        }
      });
    }

    return items;
  };

  const allItems = getAllRoadmapItems(roadmap);

  const columnsData = [
    {
      id: 'todo',
      title: 'To Do',
      status: 0,
      icon: <ListTodo size={18} className="column-icon todo-icon" />,
      items: allItems.filter(item => (progress?.[item.id] || 0) === 0)
    },
    {
      id: 'inProgress',
      title: 'In Progress',
      status: 1,
      icon: <Clock size={18} className="column-icon ip-icon" />,
      items: allItems.filter(item => progress?.[item.id] === 1)
    },
    {
      id: 'done',
      title: 'Done',
      status: 2,
      icon: <CheckCircle size={18} className="column-icon done-icon" />,
      items: allItems.filter(item => progress?.[item.id] === 2)
    }
  ];

  // Drag and Drop handlers (Desktop)
  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, colId) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      onItemStatusChange(itemId, targetStatus);
    }
    setDragOverColumn(null);
    setDraggedItemId(null);
  };

  // Mobile Horizontal Scroll Swiping synchronization
  const handleScroll = (e) => {
    const container = e.currentTarget;
    
    // Find closest column index to current viewport position
    const columns = container.querySelectorAll('.board-column');
    if (columns.length > 0) {
      let closestIdx = 0;
      let minDiff = Infinity;
      
      columns.forEach((col, idx) => {
        // Calculate distance from column left to container left in viewport pixels
        const diff = Math.abs(col.getBoundingClientRect().left - container.getBoundingClientRect().left);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      
      if (closestIdx !== activeColIndex) {
        setActiveColIndex(closestIdx);
      }
    }
  };

  // Scroll smoothly to a specific column index
  const scrollToIndex = (idx) => {
    if (boardContainerRef.current) {
      const container = boardContainerRef.current;
      const columns = container.querySelectorAll('.board-column');
      const targetCol = columns[idx];
      if (targetCol) {
        const targetScrollLeft = targetCol.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
        container.scrollTo({
          left: targetScrollLeft - 12, // match spacing/margins
          behavior: 'smooth'
        });
        setActiveColIndex(idx);
      }
    }
  };

  // Mobile Long Press Handlers
  const handleTouchStart = (e, item) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY
    };

    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    longPressTimer.current = setTimeout(() => {
      setPopupItem(item);
    }, 600); // 600ms long press threshold
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartRef.current.startX);
    const diffY = Math.abs(touch.clientY - touchStartRef.current.startY);

    // Cancel long press if user drags/swipes finger significantly (i.e. scrolling columns/cards)
    if (diffX > 12 || diffY > 12) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartRef.current = null;
  };

  // Mouse fallback handlers for easy local simulation of long press
  const handleMouseDown = (e, item) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setPopupItem(item);
    }, 600);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="board-view-outer-container fade-in">
      {/* Mobile-only tab pills navigation */}
      <div className="board-mobile-nav">
        {columnsData.map((column, idx) => (
          <button
            key={column.id}
            className={`board-nav-pill ${activeColIndex === idx ? 'active' : ''}`}
            onClick={() => scrollToIndex(idx)}
          >
            <span className="pill-title">{column.title}</span>
            <span className="pill-count">{column.items.length}</span>
          </button>
        ))}
      </div>

      <div 
        className="board-view-wrapper" 
        ref={boardContainerRef} 
        onScroll={handleScroll}
      >
        <div className="board-container">
          {columnsData.map(column => {
            const isDraggingOver = dragOverColumn === column.id;
            return (
              <div 
                key={column.id} 
                className={`board-column ${isDraggingOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, column.id)}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <div className="board-column-header">
                  <div className="board-column-header-left">
                    {column.icon}
                    <span className="column-title">{column.title}</span>
                  </div>
                  <span className="column-count">{column.items.length}</span>
                </div>
                
                <div className="board-column-cards">
                  {column.items.length > 0 ? (
                    column.items.map(item => {
                      const isDragged = draggedItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`board-card ${isDragged ? 'dragging' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => handleTouchStart(e, item)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onMouseDown={(e) => handleMouseDown(e, item)}
                          onMouseUp={handleMouseUp}
                          onMouseMove={handleMouseMove}
                        >
                          <div className="board-card-content">
                            <h4 className="board-card-title">{item.label}</h4>
                            <span className="board-card-phase">{item.phase}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="board-column-empty">
                      <span>No items</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Touch Long Press popup modal overlay */}
      {popupItem && (
        <div className="board-popup-overlay" onClick={() => setPopupItem(null)}>
          <div className="board-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="board-popup-header">Move to:</div>
            <div className="board-popup-card-name">"{popupItem.label}"</div>
            <div className="board-popup-buttons">
              <button 
                className={`board-popup-btn todo-btn ${(progress?.[popupItem.id] || 0) === 0 ? 'current' : ''}`}
                onClick={() => { onItemStatusChange(popupItem.id, 0); setPopupItem(null); }}
              >
                To Do
              </button>
              <button 
                className={`board-popup-btn ip-btn ${progress?.[popupItem.id] === 1 ? 'current' : ''}`}
                onClick={() => { onItemStatusChange(popupItem.id, 1); setPopupItem(null); }}
              >
                In Progress
              </button>
              <button 
                className={`board-popup-btn done-btn ${progress?.[popupItem.id] === 2 ? 'current' : ''}`}
                onClick={() => { onItemStatusChange(popupItem.id, 2); setPopupItem(null); }}
              >
                Done
              </button>
            </div>
            <button className="board-popup-cancel-btn" onClick={() => setPopupItem(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardView;
