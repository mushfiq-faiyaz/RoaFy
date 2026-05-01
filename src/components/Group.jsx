import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ItemRow from './ItemRow';

const getLabelColorClass = (label) => {
  const l = label.toLowerCase();
  if (l.includes('topic') && !l.includes('sub')) return 'color-blue';
  if (l.includes('subtopic')) return 'color-purple';
  if (l.includes('activity') || l.includes('learning')) return 'color-green';
  if (l.includes('project')) return 'color-orange';
  return 'color-blue'; // default
};

const Group = ({ group, progress, onItemClick, prefix }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const colorClass = getLabelColorClass(group.label);

  return (
    <div className="tree-group">
      <div 
        className={`group-header ${colorClass}`} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronDown size={16} className={`chevron-icon ${!isExpanded ? 'chevron-closed' : ''}`} />
        <h4>{group.label}</h4>
      </div>
      
      {isExpanded && group.items && (
        <div className="group-content">
          {group.items.map((item, index) => (
            <ItemRow 
              key={item.id || `item-${index}`} 
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

export default Group;
