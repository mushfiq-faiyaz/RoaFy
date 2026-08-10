import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import ItemRow from './ItemRow';
import ProgressRing from './ProgressRing';

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
  let sectionItemIndex = 0;

  if (section.items) {
    section.items.forEach(item => {
      total++;
      if (progress[item.id] === 2) done++;
      allItems.push({ 
        type: 'item', 
        data: item, 
        level: 'section', 
        markerStyle: section.markerStyle || 'circle', 
        index: sectionItemIndex++ 
      });
    });
  }

  if (section.subsections) {
    section.subsections.forEach(sub => {
      let subItemIndex = 0;
      let subTotal = 0;
      let subDone = 0;
      if (sub.items) {
        sub.items.forEach(i => {
          subTotal++;
          if (progress[i.id] === 2) subDone++;
        });
      }
      if (sub.groups) {
        sub.groups.forEach(g => {
          if (g.items) {
            g.items.forEach(i => {
              subTotal++;
              if (progress[i.id] === 2) subDone++;
            });
          }
        });
      }

      if (sub.title) {
        allItems.push({ type: 'label', text: sub.title, id: sub.id || `sub-${Math.random()}`, total: subTotal, done: subDone, description: sub.description });
      }
      
      if (sub.items) {
        sub.items.forEach(item => {
          total++;
          if (progress[item.id] === 2) done++;
          allItems.push({ 
            type: 'item', 
            data: item, 
            level: 'subsection', 
            markerStyle: sub.markerStyle || section.markerStyle || 'circle', 
            index: subItemIndex++ 
          });
        });
      }
      
      if (sub.groups) {
        sub.groups.forEach(group => {
          if (group.label) {
            let groupTotal = 0;
            let groupDone = 0;
            if (group.items) {
              group.items.forEach(i => {
                groupTotal++;
                if (progress[i.id] === 2) groupDone++;
              });
            }
            allItems.push({ type: 'label', text: group.label, id: group.id || `group-${Math.random()}`, total: groupTotal, done: groupDone, description: group.description });
          }
          if (group.items) {
            group.items.forEach(item => {
              total++;
              if (progress[item.id] === 2) done++;
              allItems.push({ 
                type: 'item', 
                data: item, 
                level: 'subsection', 
                markerStyle: sub.markerStyle || section.markerStyle || 'circle', 
                index: subItemIndex++ 
              });
            });
          }
        });
      }
    });
  }

  const accent = ACCENTS[index % ACCENTS.length];
  const percentage = total === 0 ? 0 : (done / total) * 100;

  return (
    <div className="tree-section" data-section-index={index} data-scroll-anchor={section.id}>
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
        <div style={{ marginRight: '10px' }}>
          <ProgressRing 
            percentage={percentage} 
            size={42} 
            strokeWidth={3} 
            color="#10b981"
            textColor="rgba(255,255,255,0.7)"
            fontSize="10px"
            text={`${done}/${total}`}
          />
        </div>
        <ChevronDown size={18} className={`chevron-icon ${!isExpanded ? 'chevron-closed' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="section-content-flat">
          {section.description && (
            <div style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {section.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
          {allItems.map((itemObj, i) => {
            if (itemObj.type === 'label') {
              const subTotal = itemObj.total || 0;
              const subDone = itemObj.done || 0;
              const subPercentage = subTotal === 0 ? 0 : (subDone / subTotal) * 100;
              
              return (
                <React.Fragment key={itemObj.id || `label-${i}`}>
                  <div className="subsection-label" data-scroll-anchor={itemObj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '20px' }}>
                    <span>{itemObj.text}</span>
                    {subTotal > 0 && (
                      <ProgressRing 
                        percentage={subPercentage} 
                        size={28} 
                        strokeWidth={2} 
                        color="#10b981"
                        textColor="rgba(255,255,255,0.45)"
                        fontSize="9px"
                        text={`${subDone}/${subTotal}`}
                      />
                    )}
                  </div>
                  {itemObj.description && (
                    <div style={{ padding: '0 20px 12px 48px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.5' }}>
                      {itemObj.description.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
                    </div>
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <ItemRow 
                  key={itemObj.data.id || `item-${i}`} 
                  item={itemObj.data} 
                  status={progress[itemObj.data.id] || 0}
                  onClick={() => onItemClick(itemObj.data.id)}
                  className={itemObj.level === 'subsection' ? 'indent-subsection' : 'indent-section'}
                  markerStyle={itemObj.markerStyle}
                  index={itemObj.index}
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
