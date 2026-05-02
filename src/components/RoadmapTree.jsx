import React from 'react';
import Section from './Section';
import ItemRow from './ItemRow';
import './Tree.css';

const RoadmapTree = ({ roadmap, progress, onItemClick }) => {
  if (!roadmap || !roadmap.sections) return null;

  return (
    <div className="roadmap-tree fade-in">
      <div className="tree-root-header">
        <h1 className="tree-root-title">{roadmap.title || "My Roadmap"}</h1>
        {roadmap.description && (
          <div style={{ padding: '8px 4px 0 4px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6' }}>
            {roadmap.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}
      </div>

      {roadmap.items?.length > 0 && (
        <div className="tree-root-items" style={{ marginBottom: '24px' }}>
          <div className="section-content-flat">
            {roadmap.items.map((item) => (
              <ItemRow 
                key={item.id} 
                item={item} 
                status={progress[item.id] || 0}
                onClick={() => onItemClick(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="tree-sections-container">
        {roadmap.sections?.map((section, index) => (
          <Section 
            key={section.id || `sec-${index}`} 
            section={section} 
            progress={progress} 
            onItemClick={onItemClick} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapTree;
