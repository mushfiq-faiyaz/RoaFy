import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './ScrollNavigator.css';

const ScrollNavigator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef();
  
  const requestRef = useRef();
  const holdTimerRef = useRef();
  const isAutoScrolling = useRef(false);
  const scrollDirection = useRef(0);
  const holdThresholdCrossed = useRef(false);
  const currentSpeed = useRef(4);

  const getScrollContainer = () => {
    return document.querySelector('.app-container') || document.documentElement;
  };

  const autoScroll = () => {
    if (isAutoScrolling.current) {
      const container = getScrollContainer();
      if (container) {
        container.scrollBy(0, scrollDirection.current * currentSpeed.current);
        
        // Smoothly accelerate up to a max speed of 25px per frame
        if (currentSpeed.current < 25) {
          currentSpeed.current += 0.4;
        }
      }
      requestRef.current = requestAnimationFrame(autoScroll);
    }
  };

  const stopAutoScroll = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    isAutoScrolling.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const handlePointerDown = (direction) => {
    holdThresholdCrossed.current = false;
    scrollDirection.current = direction;
    currentSpeed.current = 4; // Reset speed on new press
    
    holdTimerRef.current = setTimeout(() => {
      holdThresholdCrossed.current = true;
      isAutoScrolling.current = true;
      requestRef.current = requestAnimationFrame(autoScroll);
    }, 300);
  };

  const handlePointerUp = (direction) => {
    stopAutoScroll();
    
    if (!holdThresholdCrossed.current) {
      // Execute single click jump
      jumpToSection(direction);
    }
  };

  const handlePointerLeave = () => {
    stopAutoScroll();
  };

  const jumpToSection = (direction) => {
    const container = getScrollContainer();
    if (!container) return;
    
    const headers = Array.from(document.querySelectorAll('.section-header, .mb-section-header'));
    if (headers.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerScrollTop = container.scrollTop;
    
    const positions = headers.map(header => {
      const rect = header.getBoundingClientRect();
      const absoluteY = rect.top - containerRect.top + containerScrollTop;
      return absoluteY;
    });

    let targetY = null;
    const currentY = containerScrollTop;

    if (direction === -1) {
      for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i] < currentY - 10) {
          targetY = positions[i];
          break;
        }
      }
      if (targetY === null) targetY = 0; // fallback to top
    } else {
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] > currentY + 10) {
          targetY = positions[i];
          break;
        }
      }
      if (targetY === null) targetY = container.scrollHeight; // fallback to bottom
    }

    if (targetY !== null) {
      container.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  // Handle scroll visibility
  useEffect(() => {
    const container = getScrollContainer();
    if (!container) return;

    const handleScroll = () => {
      // Don't fade out if we are currently holding to auto-scroll
      if (!isAutoScrolling.current) {
        setIsVisible(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    };

    // Make sure we attach to the scrollable element itself
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className={`scroll-navigator ${!isVisible && !isAutoScrolling.current ? 'hidden' : ''}`}>
      <button 
        className="scroll-nav-btn"
        onPointerDown={() => handlePointerDown(-1)}
        onPointerUp={() => handlePointerUp(-1)}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        title="Scroll Up (Hold for auto-scroll)"
      >
        <ChevronUp size={24} />
      </button>
      <button 
        className="scroll-nav-btn"
        onPointerDown={() => handlePointerDown(1)}
        onPointerUp={() => handlePointerUp(1)}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        title="Scroll Down (Hold for auto-scroll)"
      >
        <ChevronDown size={24} />
      </button>
    </div>
  );
};

export default ScrollNavigator;
