import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import ItemRow from './ItemRow';

const ACCENTS = [
  { color: '#6366f1', bg: 'rgba(99,102,241,0.25)' },
  { color: '#ec4899', bg: 'rgba(236,72,153,0.25)' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.25)' },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.25)' },
  { color: '#3b82f6', bg: 'rgba(59,130,246,0.25)' },
];

const Section = ({ section, progress, onItemClick, index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  let total = 0;
  let done = 0;
  
  const allItems = [];

  if (section.items) {
    section.items.forEach(item => {
      total++;
      if (progress[item.id] === 2) done++;
      allItems.push({ type: 'item', data: item, level: 'section' });
    });
  }

  if (section.subsections) {
    section.subsections.forEach(sub => {
      if (sub.title) {
        allItems.push({ type: 'label', text: sub.title, id: `sub-${sub.id}` });
      }
      
      if (sub.items) {
        sub.items.forEach(item => {
          total++;
          if (progress[item.id] === 2) done++;
          allItems.push({ type: 'item', data: item, level: 'subsection' });
        });
      }
      
      if (sub.groups) {
        sub.groups.forEach(group => {
          if (group.label) {
            allItems.push({ type: 'label', text: group.label, id: `group-${group.id}` });
          }
          if (group.items) {
            group.items.forEach(item => {
              total++;
              if (progress[item.id] === 2) done++;
              allItems.push({ type: 'item', data: item });
            });
          }
        });
      }
    });
  }

  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="tree-section">
      <div 
        className="section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div 
          className="section-icon-box"
          style={{ backgroundColor: accent.bg, color: accent.color }}
        >
          <BookOpen size={18} />
        </div>
        <div className="section-title">{section.title}</div>
        <div className="section-done-pill">{done}/{total} done</div>
        <ChevronDown size={18} className={`chevron-icon ${!isExpanded ? 'chevron-closed' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="section-content-flat">
          {allItems.map((itemObj, i) => {
            if (itemObj.type === 'label') {
              return <div key={itemObj.id || `label-${i}`} className="subsection-label">{itemObj.text}</div>;
            } else {
              return (
                <ItemRow 
                  key={itemObj.data.id || `item-${i}`} 
                  item={itemObj.data} 
                  status={progress[itemObj.data.id] || 0}
                  onClick={() => onItemClick(itemObj.data.id)}
                  className={itemObj.level === 'subsection' ? 'indent-subsection' : 'indent-section'}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default Section;
