import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import './UploadZone.css';

const UploadZone = ({ onUpload, loadingStep, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onUpload(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  if (loadingStep) {
    return (
      <div className="upload-container loading-state fade-in">
        <Loader2 className="loading-icon animate-spin" size={48} />
        <h2 className="loading-text">{loadingStep}</h2>
      </div>
    );
  }

  return (
    <div className="upload-wrapper fade-in">
      <div className="upload-header">
        <h1>RoaFy</h1>
        <p>Transform your PDF syllabus or roadmap into an interactive learning tracker.</p>
      </div>

      <div 
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input 
          type="file" 
          accept=".pdf" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden-input"
        />
        <UploadCloud className="upload-icon" size={64} />
        <h3>Click or drag to upload PDF</h3>
        <p className="upload-hint">Only .pdf files are supported</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
