import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Minus, Maximize2, Check, ChevronDown, ChevronUp, ArrowRight, X, GitFork } from 'lucide-react';
import './GraphView.css';

const VIVID_PALETTE = [
  { border: '#d97706', borderMuted: '#fcd34d', textAccent: '#b45309', badgeBg: '#fef3c7' }, // Gold/Yellow
  { border: '#2563eb', borderMuted: '#93c5fd', textAccent: '#1d4ed8', badgeBg: '#dbeafe' }, // Blue
  { border: '#ea580c', borderMuted: '#fdba74', textAccent: '#c2410c', badgeBg: '#ffedd5' }, // Orange
  { border: '#0d9488', borderMuted: '#5eead4', textAccent: '#0f766e', badgeBg: '#ccfbf1' }, // Teal
  { border: '#db2777', borderMuted: '#f472b6', textAccent: '#be185d', badgeBg: '#fce7f3' }, // Pink
  { border: '#9333ea', borderMuted: '#c084fc', textAccent: '#7e22ce', badgeBg: '#f3e8ff' }  // Purple
];

const GraphView = ({ roadmap, progress, onSwitchToList }) => {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Touch gesture tracking for pinch zoom & pan
  const touchStartRef = useRef({ x: 0, y: 0, dist: 0 });
  const isTouchZooming = useRef(false);

  // Helper to calculate completed & total items
  const calculateProgress = useCallback((itemsArr) => {
    let total = 0;
    let done = 0;
    if (!itemsArr) return { total, done };
    itemsArr.forEach(item => {
      total++;
      if (progress && progress[item.id] === 2) done++;
    });
    return { total, done };
  }, [progress]);

  const getPhaseProgress = useCallback((section) => {
    let total = 0;
    let done = 0;
    if (section.items) {
      const res = calculateProgress(section.items);
      total += res.total;
      done += res.done;
    }
    if (section.subsections) {
      section.subsections.forEach(sub => {
        if (sub.items) {
          const res = calculateProgress(sub.items);
          total += res.total;
          done += res.done;
        }
        if (sub.groups) {
          sub.groups.forEach(g => {
            if (g.items) {
              const res = calculateProgress(g.items);
              total += res.total;
              done += res.done;
            }
          });
        }
      });
    }
    return { total, done };
  }, [calculateProgress]);

  const getSectionProgress = useCallback((sub) => {
    let total = 0;
    let done = 0;
    if (sub.items) {
      const res = calculateProgress(sub.items);
      total += res.total;
      done += res.done;
    }
    if (sub.groups) {
      sub.groups.forEach(g => {
        if (g.items) {
          const res = calculateProgress(g.items);
          total += res.total;
          done += res.done;
        }
      });
    }
    return { total, done };
  }, [calculateProgress]);

  // Compute graph layout nodes and positions
  const layout = useMemo(() => {
    if (!roadmap || !roadmap.sections || roadmap.sections.length === 0) {
      return null;
    }

    let rootTotal = 0;
    let rootDone = 0;

    if (roadmap.items) {
      const res = calculateProgress(roadmap.items);
      rootTotal += res.total;
      rootDone += res.done;
    }

    const phases = roadmap.sections.map((sec, pIdx) => {
      const pProg = getPhaseProgress(sec);
      rootTotal += pProg.total;
      rootDone += pProg.done;

      const phaseId = sec.id || `phase-${pIdx}`;
      const isExpanded = !!expandedPhases[phaseId];
      const vividStyle = VIVID_PALETTE[pIdx % VIVID_PALETTE.length];

      const sections = (sec.subsections || []).map((sub, sIdx) => {
        const sProg = getSectionProgress(sub);
        return {
          id: sub.id || `sec-${pIdx}-${sIdx}`,
          label: sub.title || `Section ${sIdx + 1}`,
          total: sProg.total,
          done: sProg.done,
          isCompleted: sProg.total > 0 && sProg.done === sProg.total,
          anchorId: sub.id || sec.id,
          phaseId,
          vividStyle
        };
      });

      return {
        id: phaseId,
        label: sec.title || `Phase ${pIdx + 1}`,
        total: pProg.total,
        done: pProg.done,
        isCompleted: pProg.total > 0 && pProg.done === pProg.total,
        isExpanded,
        sections,
        rawSection: sec,
        vividStyle
      };
    });

    const rootNode = {
      id: 'root',
      label: roadmap.title || 'My Roadmap',
      total: rootTotal,
      done: rootDone,
      isCompleted: rootTotal > 0 && rootDone === rootTotal
    };

    const isHorizontal = (roadmap?.graphLayout || 'vertical') === 'horizontal';

    const positionedPhases = [];
    const positionedSections = [];
    const connectors = [];

    let rootX = 0;
    let rootY = 0;

    if (isHorizontal) {
      // Horizontal (left-to-right) layout
      const ROOT_X = 140;
      const PHASE_X = 460;
      const SECTION_X = 760;

      const SEC_SPACING_Y = 130;
      const PHASE_MIN_HEIGHT = 150;
      const GAP_BETWEEN_PHASES_Y = 40;

      let currentY = 0;

      phases.forEach((phase) => {
        let branchHeight = PHASE_MIN_HEIGHT;
        const secCount = phase.sections.length;

        if (phase.isExpanded && secCount > 0) {
          branchHeight = Math.max(PHASE_MIN_HEIGHT, secCount * SEC_SPACING_Y);
        }

        const phaseX = PHASE_X;
        const phaseY = currentY + branchHeight / 2;

        if (phase.isExpanded && secCount > 0) {
          phase.sections.forEach((sec, j) => {
            const secX = SECTION_X;
            const secY = currentY + (j + 0.5) * (branchHeight / secCount);

            positionedSections.push({
              ...sec,
              x: secX,
              y: secY
            });

            // Connector between Phase and Section (horizontal)
            connectors.push({
              id: `conn-${phase.id}-${sec.id}`,
              x1: phaseX + 115,
              y1: phaseY,
              x2: secX - 97,
              y2: secY,
              isHorizontal: true
            });
          });
        }

        positionedPhases.push({
          ...phase,
          x: phaseX,
          y: phaseY
        });

        currentY += branchHeight + GAP_BETWEEN_PHASES_Y;
      });

      const totalHeight = Math.max(currentY - GAP_BETWEEN_PHASES_Y, 300);
      rootX = ROOT_X;
      rootY = totalHeight / 2;

      // Connectors between Root and each Phase (horizontal)
      positionedPhases.forEach((phase) => {
        connectors.push({
          id: `conn-root-${phase.id}`,
          x1: rootX + 130,
          y1: rootY,
          x2: phase.x - 115,
          y2: phase.y,
          isHorizontal: true
        });
      });

    } else {
      // Vertical (top-down) layout
      const ROOT_Y = 80;
      const PHASE_Y = 270;
      const SECTION_Y = 460;

      const SEC_SPACING = 240;
      const PHASE_MIN_WIDTH = 270;
      const GAP_BETWEEN_PHASES = 50;

      let currentX = 0;

      phases.forEach((phase) => {
        let branchWidth = PHASE_MIN_WIDTH;
        const secCount = phase.sections.length;

        if (phase.isExpanded && secCount > 0) {
          branchWidth = Math.max(PHASE_MIN_WIDTH, secCount * SEC_SPACING);
        }

        const phaseX = currentX + branchWidth / 2;
        const phaseY = PHASE_Y;

        if (phase.isExpanded && secCount > 0) {
          phase.sections.forEach((sec, j) => {
            const secX = currentX + (j + 0.5) * (branchWidth / secCount);
            const secY = SECTION_Y;

            positionedSections.push({
              ...sec,
              x: secX,
              y: secY
            });

            // Connector between Phase and Section (vertical)
            connectors.push({
              id: `conn-${phase.id}-${sec.id}`,
              x1: phaseX,
              y1: phaseY + 42,
              x2: secX,
              y2: secY - 32,
              isHorizontal: false
            });
          });
        }

        positionedPhases.push({
          ...phase,
          x: phaseX,
          y: phaseY
        });

        currentX += branchWidth + GAP_BETWEEN_PHASES;
      });

      const totalWidth = Math.max(currentX - GAP_BETWEEN_PHASES, 400);
      rootX = totalWidth / 2;
      rootY = ROOT_Y;

      // Connectors between Root and each Phase (vertical)
      positionedPhases.forEach((phase) => {
        connectors.push({
          id: `conn-root-${phase.id}`,
          x1: rootX,
          y1: rootY + 45,
          x2: phase.x,
          y2: phase.y - 42,
          isHorizontal: false
        });
      });
    }

    // Compute exact bounding box from all node card extents
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    const allNodesWithDims = [
      { x: rootX, y: rootY, w: 260, h: 100 },
      ...positionedPhases.map(p => ({ x: p.x, y: p.y, w: 230, h: 90 })),
      ...positionedSections.map(s => ({ x: s.x, y: s.y, w: 195, h: 70 }))
    ];

    allNodesWithDims.forEach(n => {
      const left = n.x - n.w / 2;
      const right = n.x + n.w / 2;
      const top = n.y - n.h / 2;
      const bottom = n.y + n.h / 2;
      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (top < minY) minY = top;
      if (bottom > maxY) maxY = bottom;
    });

    const bounds = { minX, maxX, minY, maxY };

    return {
      rootNode: { ...rootNode, x: rootX, y: rootY },
      phases: positionedPhases,
      sections: positionedSections,
      connectors,
      bounds,
      isHorizontal
    };
  }, [roadmap, expandedPhases, getPhaseProgress, getSectionProgress, calculateProgress]);

  // Fit view to container screen
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !layout) return;
    const { bounds } = layout;
    const containerWidth = containerRef.current.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current.clientHeight || 500;

    const paddingX = 40;
    const paddingY = 40;

    const graphWidth = Math.max(bounds.maxX - bounds.minX, 100);
    const graphHeight = Math.max(bounds.maxY - bounds.minY, 100);

    const scaleX = (containerWidth - paddingX * 2) / graphWidth;
    const scaleY = (containerHeight - paddingY * 2) / graphHeight;
    let targetScale = Math.min(scaleX, scaleY);

    targetScale = Math.max(0.15, Math.min(targetScale, 1.15));

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const targetX = containerWidth / 2 - centerX * targetScale;
    const targetY = containerHeight / 2 - centerY * targetScale;

    setTransform({ x: targetX, y: targetY, scale: targetScale });
  }, [layout]);

  // Reset/fit view on initial render & layout changes
  useEffect(() => {
    fitToScreen();
  }, [fitToScreen]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => fitToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToScreen]);

  // Zoom handlers
  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 2.5)
    }));
  };

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.25)
    }));
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setTransform(prev => {
      const newScale = Math.max(0.25, Math.min(prev.scale * zoomFactor, 2.5));
      if (!containerRef.current) return { ...prev, scale: newScale };
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);

      return { x: newX, y: newY, scale: newScale };
    });
  };

  // Pan / Drag Handlers (Desktop Mouse)
  const handleMouseDown = (e) => {
    // Only pan if clicking on container or SVG background
    if (e.target.closest('.graph-node') || e.target.closest('.graph-popup')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Panning & Pinch-Zoom
  const handleTouchStart = (e) => {
    if (e.target.closest('.graph-node') || e.target.closest('.graph-popup')) return;

    if (e.touches.length === 1) {
      isTouchZooming.current = false;
      dragStartRef.current = {
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      isTouchZooming.current = true;
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      touchStartRef.current = { x: centerX, y: centerY, dist };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && !isTouchZooming.current) {
      setTransform(prev => ({
        ...prev,
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      }));
    } else if (e.touches.length === 2) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      if (touchStartRef.current.dist > 0) {
        const factor = currentDist / touchStartRef.current.dist;
        touchStartRef.current.dist = currentDist;

        setTransform(prev => {
          const newScale = Math.max(0.25, Math.min(prev.scale * factor, 2.5));
          return { ...prev, scale: newScale };
        });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    isTouchZooming.current = false;
  };

  // Node Taps
  const handlePhaseTap = (phaseId, e) => {
    e.stopPropagation();
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleSectionTap = (sec, e) => {
    e.stopPropagation();
    setSelectedSection(sec);
  };

  // Switch to List and Scroll to Section Anchor
  const handleViewInList = () => {
    if (selectedSection && onSwitchToList) {
      onSwitchToList(selectedSection.anchorId);
    }
    setSelectedSection(null);
  };

  // Empty State
  if (!layout) {
    return (
      <div className="graph-empty-container fade-in">
        <div className="graph-empty-card">
          <GitFork size={48} className="graph-empty-icon" />
          <p className="graph-empty-text">Add phases to your roadmap to see the graph</p>
        </div>
      </div>
    );
  }

  const { rootNode, phases, sections, connectors } = layout;

  const isVivid = roadmap?.graphTheme === 'vivid';

  return (
    <div
      className={`graph-view-wrapper fade-in ${isDragging ? 'is-dragging' : ''} ${isVivid ? 'vivid-view' : ''}`}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={fitToScreen}
    >
      {/* Background Canvas Grid Pattern */}
      <div className="graph-bg-grid"></div>

      {/* Canvas Layer Transformed */}
      <div
        className="graph-canvas"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG Connectors Layer */}
        <svg className="graph-svg-connectors">
          {connectors.map(conn => {
            let pathData;
            if (conn.isHorizontal) {
              const midX = (conn.x1 + conn.x2) / 2;
              pathData = `M ${conn.x1} ${conn.y1} C ${midX} ${conn.y1}, ${midX} ${conn.y2}, ${conn.x2} ${conn.y2}`;
            } else {
              const midY = (conn.y1 + conn.y2) / 2;
              pathData = `M ${conn.x1} ${conn.y1} C ${conn.x1} ${midY}, ${conn.x2} ${midY}, ${conn.x2} ${conn.y2}`;
            }
            return (
              <path
                key={conn.id}
                d={pathData}
                className={`graph-connector-line ${isVivid ? 'is-vivid' : ''}`}
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div className="graph-nodes-layer">
          {/* Root Node */}
          <div
            className={`graph-node node-root ${isVivid ? 'is-vivid' : ''}`}
            style={{ left: `${rootNode.x}px`, top: `${rootNode.y}px` }}
          >
            {isVivid && <span className="node-vivid-accent-bar" style={{ backgroundColor: '#6366f1' }} />}
            <div className="node-root-content">
              {rootNode.isCompleted && (
                <div className="node-badge-completed" title="Completed">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
              <h3 className="node-root-title">{rootNode.label}</h3>
              <div className="node-root-progress">
                <span>{rootNode.done}/{rootNode.total} items</span>
              </div>
            </div>
          </div>

          {/* Phase Nodes */}
          {phases.map(phase => (
            <div
              key={phase.id}
              className={`graph-node node-phase ${phase.isExpanded ? 'is-expanded' : ''} ${isVivid ? 'is-vivid' : ''}`}
              style={{
                left: `${phase.x}px`,
                top: `${phase.y}px`
              }}
              onClick={(e) => handlePhaseTap(phase.id, e)}
            >
              {isVivid && phase.vividStyle && (
                <span className="node-vivid-accent-bar" style={{ backgroundColor: phase.vividStyle.border }} />
              )}
              <div className="node-phase-content">
                {phase.isCompleted && (
                  <div className="node-badge-completed" title="Completed">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                <h4 className="node-phase-title">{phase.label}</h4>
                <div className="node-phase-meta">
                  <span
                    className="node-phase-badge"
                    style={isVivid && phase.vividStyle ? {
                      color: phase.vividStyle.textAccent,
                      background: phase.vividStyle.badgeBg
                    } : {}}
                  >
                    {phase.done}/{phase.total}
                  </span>
                  {phase.sections.length > 0 && (
                    <span className="node-phase-toggle">
                      {phase.isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Section Nodes */}
          {sections.map(sec => (
            <div
              key={sec.id}
              className={`graph-node node-section ${isVivid ? 'is-vivid' : ''}`}
              style={{
                left: `${sec.x}px`,
                top: `${sec.y}px`
              }}
              onClick={(e) => handleSectionTap(sec, e)}
            >
              {isVivid && sec.vividStyle && (
                <span className="node-vivid-accent-bar" style={{ backgroundColor: sec.vividStyle.borderMuted || sec.vividStyle.border }} />
              )}
              <div className="node-section-content">
                {sec.isCompleted && (
                  <div className="node-badge-completed sec-check" title="Completed">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <span className="node-section-title">{sec.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Canvas Controls (Bottom Right) */}
      <div className="graph-controls">
        <button className="graph-control-btn" onClick={zoomIn} title="Zoom In (+)">
          <Plus size={18} />
        </button>
        <button className="graph-control-btn" onClick={zoomOut} title="Zoom Out (-)">
          <Minus size={18} />
        </button>
        <button className="graph-control-btn" onClick={fitToScreen} title="Fit Graph to Screen (Double Tap)">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Section Detail Popup Modal */}
      {selectedSection && (
        <div className="graph-popup-overlay" onClick={() => setSelectedSection(null)}>
          <div className="graph-popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="graph-popup-close" onClick={() => setSelectedSection(null)}>
              <X size={16} />
            </button>
            <div className="graph-popup-header">
              <span className="graph-popup-tag">Section</span>
              <h3 className="graph-popup-title">{selectedSection.label}</h3>
            </div>

            <div className="graph-popup-body">
              <div className="graph-popup-stat">
                <span className="graph-popup-stat-label">Progress</span>
                <span className="graph-popup-stat-value">{selectedSection.done} / {selectedSection.total} items done</span>
              </div>

              <div className="graph-popup-progress-bar">
                <div
                  className="graph-popup-progress-fill"
                  style={{
                    width: `${selectedSection.total > 0 ? (selectedSection.done / selectedSection.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <button className="graph-popup-btn" onClick={handleViewInList}>
              <span>View in List</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;
