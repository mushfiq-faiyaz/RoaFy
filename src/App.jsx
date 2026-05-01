import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import RoadmapTree from './components/RoadmapTree';
import ManualBuilder from './components/ManualBuilder';
import { getRoadmap, saveRoadmap, getProgress, saveProgress } from './utils/storage';
import { extractTextFromPdf } from './utils/pdfExtract';
import { parseRoadmap } from './utils/parseRoadmap';
import './App.css';

function App() {
  const [roadmap, setRoadmapState] = useState(() => getRoadmap());
  const [progress, setProgressState] = useState(() => getProgress());
  const [loadingStep, setLoadingStep] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(() => !getRoadmap());



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

  const handleManualSave = () => {
    if (roadmap) {
      saveRoadmap(roadmap);
      saveProgress(progress);
      setIsEditing(false);
    }
  };

  const handleSaveOnly = () => {
    if (roadmap) {
      saveRoadmap(roadmap);
      saveProgress(progress);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="app-container">
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      <Header 
        roadmap={roadmap} 
        progress={progress} 
        onManualSave={handleManualSave} 
        onEdit={handleEdit}
        isEditing={isEditing}
      />
      
      <main className="container main-content">
        {isEditing ? (
          <ManualBuilder 
            roadmap={roadmap} 
            setRoadmap={handleSetRoadmap} 
            onSave={handleSaveOnly}
          />
        ) : (
          roadmap && (
            <RoadmapTree 
              roadmap={roadmap} 
              progress={progress} 
              onItemClick={handleItemClick} 
            />
          )
        )}
      </main>
    </div>
  );
}

export default App;
