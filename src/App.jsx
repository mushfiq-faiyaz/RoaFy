import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import RoadmapTree from './components/RoadmapTree';
import ManualBuilder from './components/ManualBuilder';
import ScrollNavigator from './components/ScrollNavigator';
import ModeSplash from './components/ModeSplash';
import BoardView from './components/BoardView';
import TimelineView from './components/TimelineView';
import GraphView from './components/GraphView';
import { getRoadmap, saveRoadmap, getProgress, saveProgress, getAllRoadmaps, getActiveRoadmapId, setActiveRoadmapId, saveRoadmapData } from './utils/storage';
import { extractTextFromPdf } from './utils/pdfExtract';
import { parseRoadmap } from './utils/parseRoadmap';
import './App.css';

function App() {
  const [roadmap, setRoadmapState] = useState(() => getRoadmap());
  const [progress, setProgressState] = useState(() => getProgress());
  const [loadingStep, setLoadingStep] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(() => !getRoadmap());
  const [roadmapsList, setRoadmapsList] = useState([]);
  const [currentRoadmapId, setCurrentRoadmapId] = useState(() => getActiveRoadmapId());
  const [currentView, setCurrentView] = useState('list');
  const [showSplash, setShowSplash] = useState(false);
  const [splashMode, setSplashMode] = useState(false);
  const isMountedRef = useRef(false);
  const [roadmapBeforeEdit, setRoadmapBeforeEdit] = useState(null);

  const pendingScrollRestore = useRef(false);
  const scrollState = useRef({ top: 0, mainOffset: 0 });
  const containerRef = useRef(null);

  const captureScroll = () => {
    const mainEl = document.querySelector('.main-content');
    
    // Find closest anchor to anchor to
    const anchors = Array.from(document.querySelectorAll('[data-scroll-anchor]'));
    let bestAnchor = null;
    let minDiff = Infinity;
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    
    anchors.forEach(el => {
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.top - headerHeight);
      if (diff < minDiff) {
        minDiff = diff;
        bestAnchor = {
          id: el.getAttribute('data-scroll-anchor'),
          viewportTop: rect.top
        };
      }
    });

    const currentScroll = (containerRef.current && containerRef.current.scrollTop) || window.scrollY || 0;

    scrollState.current = {
      top: currentScroll,
      mainOffset: mainEl ? mainEl.offsetTop : 0,
      anchor: bestAnchor
    };
    pendingScrollRestore.current = true;
  };

  useLayoutEffect(() => {
    if (pendingScrollRestore.current) {
      pendingScrollRestore.current = false;
      requestAnimationFrame(() => {
        const applyScrollOffset = (delta) => {
          if (containerRef.current && containerRef.current.scrollTop > 0) {
            containerRef.current.scrollTop += delta;
          } else {
            window.scrollBy(0, delta);
          }
        };

        const setScrollPosition = (pos) => {
          if (containerRef.current && containerRef.current.scrollTop > 0) {
            containerRef.current.scrollTop = pos;
          } else {
            window.scrollTo(0, pos);
          }
        };

        if (scrollState.current.anchor) {
          const anchorEl = document.querySelector(`[data-scroll-anchor="${scrollState.current.anchor.id}"]`);
          if (anchorEl) {
            const currentViewportTop = anchorEl.getBoundingClientRect().top;
            const diff = currentViewportTop - scrollState.current.anchor.viewportTop;
            applyScrollOffset(diff);
            return;
          }
        }
        
        // Fallback
        const mainEl = document.querySelector('.main-content');
        const newMainOffset = mainEl ? mainEl.offsetTop : 0;
        const delta = newMainOffset - scrollState.current.mainOffset;
        setScrollPosition(scrollState.current.top + delta);
      });
    }
  }, [isEditing]);

  const updateRoadmapsList = () => {
    const all = getAllRoadmaps();
    const list = Object.keys(all).map(id => ({
      id,
      title: all[id].roadmap?.title || 'Untitled Roadmap'
    }));
    setRoadmapsList(list);
  };

  // Show splash card whenever the mode actually changes (skip first mount)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    setSplashMode(isEditing);
    setShowSplash(true);
  }, [isEditing]);

  useEffect(() => {
    updateRoadmapsList();
  }, [roadmap]);



  const handleCreateRoadmap = () => {
    const newId = Date.now().toString();
    const newRoadmap = { 
      title: "New Roadmap", 
      graphTheme: 'classic', 
      graphLayout: 'vertical', 
      enabledViews: { list: true, graph: true, timeline: true, board: true },
      sections: [] 
    };
    setActiveRoadmapId(newId);
    setCurrentRoadmapId(newId);
    saveRoadmapData(newId, newRoadmap, {});
    setRoadmapState(newRoadmap);
    setProgressState({});
    setIsEditing(true);
    updateRoadmapsList();
  };

  const handleGraphThemeChange = (newTheme) => {
    if (!roadmap) return;
    const updated = { ...roadmap, graphTheme: newTheme };
    handleSetRoadmap(updated);
    window.dispatchEvent(new CustomEvent('external-settings-changed', { detail: updated }));
  };

  const handleGraphLayoutChange = (newLayout) => {
    if (!roadmap) return;
    const updated = { ...roadmap, graphLayout: newLayout };
    handleSetRoadmap(updated);
    window.dispatchEvent(new CustomEvent('external-settings-changed', { detail: updated }));
  };

  const handleUpdateEnabledViews = (newEnabledViews) => {
    if (!roadmap) return;
    const updated = { ...roadmap, enabledViews: newEnabledViews };
    handleSetRoadmap(updated);
    window.dispatchEvent(new CustomEvent('external-settings-changed', { detail: updated }));
  };

  const handleResetSettings = () => {
    if (!roadmap) return;
    const updated = {
      ...roadmap,
      graphTheme: 'classic',
      graphLayout: 'vertical',
      enabledViews: { list: true, graph: true, timeline: true, board: true }
    };
    handleSetRoadmap(updated);
    window.dispatchEvent(new CustomEvent('external-settings-changed', { detail: updated }));
  };

  useEffect(() => {
    if (roadmap) {
      const enabledViews = roadmap.enabledViews || { list: true, graph: true, timeline: true, board: true };
      if (!enabledViews[currentView]) {
        const fallbackOrder = ['list', 'graph', 'timeline', 'board'];
        const firstEnabled = fallbackOrder.find(v => enabledViews[v]);
        if (firstEnabled) {
          setCurrentView(firstEnabled);
        }
      }
    }
  }, [roadmap, currentView]);

  const handleSwitchRoadmap = (id) => {
    const all = getAllRoadmaps();
    const data = all[id];
    if (data) {
      setActiveRoadmapId(id);
      setCurrentRoadmapId(id);
      setRoadmapState(data.roadmap || null);
      setProgressState(data.progress || {});
      setRoadmapBeforeEdit(null);
      setIsEditing(false);
    }
  };

  // This handles state updates AND auto-saves to local storage
  const handleSetRoadmap = (newRoadmap) => {
    setRoadmapState(newRoadmap);
    saveRoadmap(newRoadmap);
  };

  const handleFileUpload = async (file) => {
    setError(null);
    try {
      setLoadingStep("Reading PDF...");
      const text = await extractTextFromPdf(file);
      
      setLoadingStep("AI is parsing your roadmap ✨");
      const parsedData = await parseRoadmap(text);
      
      handleSetRoadmap(parsedData);
      setProgressState({}); // Start fresh progress
      saveProgress({});
      
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingStep(null);
    }
  };

  const handleItemClick = (itemId) => {
    const currentStatus = progress[itemId] || 0;
    const newStatus = (currentStatus + 1) % 3;
    
    const newProgress = { ...progress, [itemId]: newStatus };
    setProgressState(newProgress);
    saveProgress(newProgress); // Auto-save progress
  };

  const handleItemStatusChange = (itemId, newStatus) => {
    const newProgress = { ...progress, [itemId]: newStatus };
    setProgressState(newProgress);
    saveProgress(newProgress); // Auto-save progress
  };

  const handleUpdateSectionDates = (sectionIndex, startDate, endDate) => {
    if (!roadmap || !roadmap.sections) return;
    const newSections = [...roadmap.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      startDate,
      endDate
    };
    const newRoadmap = { ...roadmap, sections: newSections };
    handleSetRoadmap(newRoadmap);
  };

  const handleManualSave = (savedRoadmap) => {
    const finalRoadmap = savedRoadmap || roadmap;
    if (finalRoadmap) {
      saveRoadmap(finalRoadmap);
      saveProgress(progress);
      captureScroll();
      setRoadmapBeforeEdit(null);
      setIsEditing(false);
    }
  };

  const handleSaveOnly = (savedRoadmap) => {
    const finalRoadmap = savedRoadmap || roadmap;
    if (finalRoadmap) {
      saveRoadmap(finalRoadmap);
      saveProgress(progress);
      setRoadmapBeforeEdit(finalRoadmap);
    }
  };

  const handleEdit = () => {
    captureScroll();
    setRoadmapBeforeEdit(roadmap);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    captureScroll();
    if (roadmapBeforeEdit) {
      handleSetRoadmap(roadmapBeforeEdit);
      setRoadmapBeforeEdit(null);
    }
    setIsEditing(false);
  };

  const handleRenameMap = () => {
    const newTitle = window.prompt("Rename Map:", roadmap?.title);
    if (newTitle && newTitle.trim() !== "") {
      const updated = { ...roadmap, title: newTitle.trim() };
      handleSetRoadmap(updated);
      updateRoadmapsList();
    }
  };

  const handleDuplicateMap = () => {
    if (!roadmap) return;
    const newId = Date.now().toString();
    const newRoadmap = { 
      enabledViews: { list: true, graph: true, timeline: true, board: true },
      ...roadmap, 
      title: roadmap.title + ' (Copy)' 
    };
    saveRoadmapData(newId, newRoadmap, progress);
    setActiveRoadmapId(newId);
    setCurrentRoadmapId(newId);
    setRoadmapState(newRoadmap);
    setProgressState(progress);
    updateRoadmapsList();
  };

  const handleResetMap = () => {
    setProgressState({});
    saveProgress({});
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!roadmap) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ roadmap, progress }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (roadmap.title || "roadmap") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDeleteMap = () => {
    const all = getAllRoadmaps();
    delete all[currentRoadmapId];
    localStorage.setItem('roafy-roadmaps', JSON.stringify(all));
    const remainingIds = Object.keys(all);
    if (remainingIds.length > 0) {
      handleSwitchRoadmap(remainingIds[0]);
    } else {
      handleCreateRoadmap();
    }
  };

  const handleSwitchToList = (anchorId) => {
    setCurrentView('list');
    if (anchorId) {
      setTimeout(() => {
        const el = document.querySelector(`[data-scroll-anchor="${anchorId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }
  };

  const enabledViews = roadmap?.enabledViews || { list: true, graph: true, timeline: true, board: true };
  const activeViews = ['list', 'graph', 'timeline', 'board'].filter(view => enabledViews[view]);

  return (
    <div className="app-container" ref={containerRef}>
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      <Header 
        roadmap={roadmap} 
        progress={progress} 
        onManualSave={handleManualSave} 
        onEdit={handleEdit}
        isEditing={isEditing}
        roadmapsList={roadmapsList}
        onSwitchRoadmap={handleSwitchRoadmap}
        onCreateRoadmap={handleCreateRoadmap}
        currentRoadmapId={currentRoadmapId}
        onRenameMap={handleRenameMap}
        onDuplicateMap={handleDuplicateMap}
        onResetMap={handleResetMap}
        onExportPDF={handleExportPDF}
        onExportJSON={handleExportJSON}
        onDeleteMap={handleDeleteMap}
        onGraphThemeChange={handleGraphThemeChange}
        onGraphLayoutChange={handleGraphLayoutChange}
        currentView={currentView}
        onViewChange={setCurrentView}
        onUpdateEnabledViews={handleUpdateEnabledViews}
        onResetSettings={handleResetSettings}
      />
      
      <main className="container main-content">
        {isEditing ? (
          <ManualBuilder 
            roadmap={roadmap} 
            setRoadmap={handleSetRoadmap} 
            onSave={handleSaveOnly}
            onCancel={handleCancelEdit}
            onGraphThemeChange={handleGraphThemeChange}
            onGraphLayoutChange={handleGraphLayoutChange}
          />
        ) : (
          roadmap && (
            <>
              {activeViews.length > 1 && (
                <div className="view-tabs-container">
                  {activeViews.map(view => (
                     <button 
                       key={view}
                       className={`view-tab ${currentView === view ? 'active' : ''}`}
                       onClick={() => setCurrentView(view)}
                     >
                       {view.charAt(0).toUpperCase() + view.slice(1)}
                     </button>
                  ))}
                </div>
              )}

              {currentView === 'list' && (
                <RoadmapTree 
                  roadmap={roadmap} 
                  progress={progress} 
                  onItemClick={handleItemClick} 
                />
              )}
              {currentView === 'graph' && (
                <GraphView 
                  roadmap={roadmap} 
                  progress={progress} 
                  onSwitchToList={handleSwitchToList} 
                />
              )}
              {currentView === 'timeline' && (
                <TimelineView 
                  roadmap={roadmap} 
                  onUpdateSectionDates={handleUpdateSectionDates} 
                />
              )}
              {currentView === 'board' && (
                <BoardView 
                  roadmap={roadmap} 
                  progress={progress} 
                  onItemStatusChange={handleItemStatusChange} 
                />
              )}
            </>
          )
        )}
      </main>
      
      <ScrollNavigator />

      {showSplash && (
        <ModeSplash
          isEditing={splashMode}
          onHide={() => setShowSplash(false)}
        />
      )}
    </div>
  );
}

export default App;
