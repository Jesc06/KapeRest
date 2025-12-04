import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import VoiceNavigator from './VoiceNavigator';

const FloatingVoiceButton: React.FC = () => {
  const [showNavigator, setShowNavigator] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    // Only toggle if not dragging
    if (!isDragging) {
      const willOpen = !showNavigator;
      setShowNavigator(willOpen);
      // Automatically start listening when opening
      if (willOpen) {
        setAutoListen(true);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Backdrop Blur when modal is open */}
      {showNavigator && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => {
            setShowNavigator(false);
            setAutoListen(false);
          }}
        />
      )}

      {/* Floating Button with Orange Theme */}
      <button
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className="fixed z-40 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-move group border-3 border-white dark:border-stone-800"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        title="Voice Navigator (Drag to move)"
      >
        <FontAwesomeIcon
          icon={faMicrophone}
          className="text-white text-2xl group-hover:scale-125 transition-transform duration-200 drop-shadow-lg"
        />
        
        {/* Pulsing ring effect */}
        <span className="absolute inset-0 rounded-full bg-orange-400 dark:bg-orange-500 animate-ping opacity-30"></span>
      </button>

      {/* Voice Navigator Panel */}
      {showNavigator && (
        <VoiceNavigator 
          onClose={() => {
            setShowNavigator(false);
            setAutoListen(false);
          }} 
          autoListen={autoListen}
          onListeningStart={() => setAutoListen(false)}
        />
      )}
    </>
  );
};

export default FloatingVoiceButton;
