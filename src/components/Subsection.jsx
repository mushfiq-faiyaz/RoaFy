import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Group from './Group';
import ItemRow from './ItemRow';

const Subsection = ({ subsection, progress, onItemClick, prefix }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate mini progress for this subsection
  let total = 0;
  let done = 0;
  
  if (subsection.groups) {
    subsection.groups.forEach(group => {
      if (group.items) {
        group.items.forEach(item => {
          total++;
          if (progress[item.id] === 2) done++;
        });
      }
    });
  }
  if (subsection.items) {
    subsection.items.forEach(item => {
      total++;
      if (progress[item.id] === 2) done++;
    });
  }

  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="tree-subsection">
      <div 
        className="subsection-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="subsection-title-wrap">
          <ChevronDown size={18} className={`chevron-icon ${!isExpanded ? 'chevron-closed' : ''}`} />
          <h3>{subsection.title}</h3>
        </div>
        

      </div>
      
      {isExpanded && (subsection.groups?.length > 0 || subsection.items?.length > 0) && (
        <div className="subsection-content">
          {subsection.groups?.map((group, index) => (
            <Group 
              key={group.id || `grp-${index}`} 
              group={group} 
              progress={progress} 
              onItemClick={onItemClick} 
            />
          ))}
          {subsection.items?.map((item, index) => (
            <ItemRow 
              key={item.id || `sub-item-${index}`} 
              item={item} 
              status={progress[item.id] || 0} 
              onClick={() => onItemClick(item.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subsection;
