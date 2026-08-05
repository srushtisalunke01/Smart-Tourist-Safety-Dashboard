import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ChatAssistant from './ChatAssistant';
import SOSWidget from './SOSWidget';

export default function FloatingActionContainer() {
  const { isChatExpanded } = useApp();
  const [bottomOffset, setBottomOffset] = useState(24);
  const [rightOffset, setRightOffset] = useState(24);
  const [isSmallHeight, setIsSmallHeight] = useState(false);

  useEffect(() => {
    const handleResizeAndCollisions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Determine base offsets based on responsive breakpoints
      let baseBottom = 24; // Desktop
      let baseRight = 24;
      if (width < 768) {
        baseBottom = 16; // Mobile
        baseRight = 16;
      } else if (width < 1024) {
        baseBottom = 20; // Tablet
        baseRight = 20;
      }

      // 2. Small height detection
      const smallHeight = height < 640;
      setIsSmallHeight(smallHeight);

      // 3. Collision detection for other fixed bottom-right elements
      let collisionHeight = 0;
      const elements = document.querySelectorAll('div, footer, nav, section, button');
      elements.forEach(el => {
        // Skip our container and its children
        if (el.closest('.floating-actions-container') || el.id === 'root') return;
        
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'absolute') {
          const rect = el.getBoundingClientRect();
          // Check if element is in bottom-right quadrant and visible
          const isBottom = rect.bottom > height - 120;
          const isRight = rect.right > width - 120;
          const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          
          if (isBottom && isRight && isVisible) {
            const heightNeeded = height - rect.top;
            if (heightNeeded > collisionHeight) {
              collisionHeight = heightNeeded;
            }
          }
        }
      });

      // Adjust bottom offset if there's a collision
      let finalBottom = collisionHeight > 0 ? collisionHeight + 16 : baseBottom;
      let finalRight = baseRight;

      if (isChatExpanded) {
        if (width < 768) {
          finalBottom = Math.max(finalBottom, 96);
        } else {
          finalRight = baseRight + 448;
        }
      }

      setBottomOffset(finalBottom);
      setRightOffset(finalRight);
    };

    handleResizeAndCollisions();
    window.addEventListener('resize', handleResizeAndCollisions);
    
    // Set up a MutationObserver to watch for dynamically added elements
    const observer = new MutationObserver(handleResizeAndCollisions);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', handleResizeAndCollisions);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      className="fixed z-[100000] flex flex-col items-end pointer-events-none floating-actions-container no-scrollbar transition-all duration-300"
      style={{
        bottom: `${bottomOffset}px`,
        right: `${rightOffset}px`,
        gap: isSmallHeight ? '8px' : '16px',
        maxHeight: 'calc(100vh - 2rem)',
        overflowY: 'auto'
      }}
    >
      <ChatAssistant />
      <SOSWidget />
    </div>
  );
}
