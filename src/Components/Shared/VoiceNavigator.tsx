import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faTimes } from '@fortawesome/free-solid-svg-icons';

interface VoiceNavigatorProps {
  onClose?: () => void;
}

// Route mapping for voice commands
const routeMapping: { [key: string]: string } = {
  // Home
  'home': '/',
  'homepage': '/',
  
  // Auth
  'login': '/login',
  'register': '/register',
  'sign in': '/login',
  'sign up': '/register',
  
  // Cashier routes
  'cashier': '/cashier',
  'buy item': '/cashier/buy-item',
  'buy': '/cashier/buy-item',
  'sales': '/cashier/sales',
  'cashier sales': '/cashier/sales',
  'change password': '/cashier/change-password',
  'password': '/cashier/change-password',
  'hold items': '/cashier/hold-items',
  'hold': '/cashier/hold-items',
  'purchases': '/cashier/purchases',
  'cashier purchases': '/cashier/purchases',
  
  // Staff routes
  'staff': '/staff',
  'staff page': '/staff',
  'add supplier': '/staff/add-supplier',
  'supplier': '/staff/suppliers',
  'suppliers': '/staff/suppliers',
  'supplier list': '/staff/suppliers',
  'add item': '/staff/add-item',
  'items': '/staff/items',
  'item list': '/staff/items',
  'add stocks': '/staff/add-stocks',
  'stocks': '/staff/stocks',
  'stocks list': '/staff/stocks',
  'staff sales': '/staff/sales',
  'staff purchases': '/staff/purchases',
  'void requests': '/staff/void-requests',
  'void': '/staff/void-requests',
  'staff change password': '/staff/change-password',
  'staff audit trail': '/staff/audit-trail',
  'staff audit': '/staff/audit-trail',
  
  // Admin routes
  'admin': '/admin',
  'admin page': '/admin',
  'accounts': '/admin/accounts',
  'admin accounts': '/admin/accounts',
  'tax discounts': '/admin/tax-discounts',
  'tax': '/admin/tax-discounts',
  'inventory': '/admin/inventory',
  'admin inventory': '/admin/inventory',
  'branch': '/admin/branch',
  'branches': '/admin/branch',
  'admin sales': '/admin/sales',
  'audit trail': '/admin/audit-trail',
  'audit': '/admin/audit-trail',
};

const VoiceNavigator: React.FC<VoiceNavigatorProps> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [status, setStatus] = useState('Type mode recommended for Brave 🚀');
  const [position, setPosition] = useState({ 
    x: (window.innerWidth - 380) / 2, 
    y: (window.innerHeight - 400) / 2 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showManualInput, setShowManualInput] = useState(true); // Default to Type mode
  
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('Voice hindi available - Use Type mode');
      setShowManualInput(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('Nakikinig... Magsalita na!');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + ' ';
        } else {
          interimTranscript += transcriptText;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim().toLowerCase();
      setTranscript(fullTranscript);

      // Check if transcript matches any route
      if (finalTranscript) {
        const matchedRoute = findMatchingRoute(fullTranscript);
        if (matchedRoute) {
          setStatus(`Pupunta sa ${matchedRoute}...`);
          setTimeout(() => {
            navigate(matchedRoute);
            recognition.stop();
            setTranscript('');
            setStatus('Tapos na!');
          }, 500);
        } else {
          setStatus('Hindi ko maintindihan. Ulitin mo.');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMsg = 'May error: ';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Brave browser blocks voice. Use Type mode! 👇';
        setShowManualInput(true);
      } else if (event.error === 'no-speech') {
        errorMsg = 'Walang narinig. Subukan ulit o use Type mode.';
        setShowManualInput(true);
      } else if (event.error === 'network') {
        errorMsg = 'Brave blocks voice API. Use Type mode! ⌨️';
        setShowManualInput(true);
      } else if (event.error === 'aborted') {
        errorMsg = 'Cancelled. Use Type mode instead.';
        setShowManualInput(true);
      } else {
        errorMsg = 'Voice error. Better use Type mode! ⌨️';
        setShowManualInput(true);
      }
      
      setStatus(errorMsg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status.includes('Nakikinig')) {
        setStatus('I-click para magsalita');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setStatus('Voice blocked by Brave. Use Type mode! ⌨️');
      setShowManualInput(true);
    }
  }, [navigate, status]);

  const findMatchingRoute = (text: string): string | null => {
    const lowerText = text.toLowerCase().trim();
    
    // Direct match
    if (routeMapping[lowerText]) {
      return routeMapping[lowerText];
    }

    // Partial match - check if any keyword is in the transcript
    for (const [keyword, route] of Object.entries(routeMapping)) {
      if (lowerText.includes(keyword)) {
        return route;
      }
    }

    return null;
  };

  const requestMicrophonePermission = async () => {
    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      // If voice not supported, switch to manual input
      setShowManualInput(true);
      setStatus('Voice blocked by Brave. Use Type mode! ⌨️');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      setIsListening(false);
      setStatus('Tumigil');
      setTranscript('');
    } else {
      setTranscript('');
      setStatus('Requesting mic permission...');
      
      // Try to get microphone permission first
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        setStatus('Mic permission denied. Use Type mode! ⌨️');
        setShowManualInput(true);
        return;
      }
      
      setStatus('Starting voice...');
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Error starting recognition:', error);
        if (error.message && error.message.includes('already')) {
          setStatus('Already listening...');
        } else {
          setStatus('Brave blocks voice. Use Type mode! ⌨️');
          setShowManualInput(true);
        }
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const matchedRoute = findMatchingRoute(manualInput);
    if (matchedRoute) {
      setStatus(`Pupunta sa ${matchedRoute}...`);
      setTimeout(() => {
        navigate(matchedRoute);
        setManualInput('');
        setStatus('Tapos na!');
      }, 300);
    } else {
      setStatus('Hindi ko maintindihan. Subukan ulit.');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return; // Don't drag when clicking buttons
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-stone-50 dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 cursor-move select-none backdrop-blur-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '380px',
        minHeight: '240px',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header with drag handle */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-t-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <h3 className="text-white font-bold text-lg">Voice Navigator</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-stone-50 bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Control Buttons */}
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={toggleListening}
            className={`flex-1 max-w-[120px] h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
            }`}
            title="Voice navigation"
          >
            <FontAwesomeIcon
              icon={isListening ? faStop : faMicrophone}
              className="text-xl"
            />
            <span className="text-sm font-medium">{isListening ? 'Stop' : 'Voice'}</span>
          </button>

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className={`flex-1 max-w-[120px] h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg ${
              showManualInput
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            title="Type command"
          >
            <span className="text-xl">⌨️</span>
            <span className="text-sm font-medium">Type</span>
          </button>
        </div>

        {/* Manual Input Form */}
        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="w-full">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type: cashier, admin, sales..."
              className="w-full px-4 py-3 rounded-xl text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              autoFocus
            />
          </form>
        )}

        {/* Status */}
        <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-3 min-h-[48px] flex items-center justify-center">
          <p className="text-gray-700 dark:text-gray-200 text-sm font-medium text-center">{status}</p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-xl p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-blue-800 dark:text-blue-200 text-sm italic text-center">"{transcript}"</p>
          </div>
        )}

        {/* Instructions */}
        <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-gray-600 dark:text-gray-400 text-xs text-center leading-relaxed">
            {showManualInput 
              ? '⚡ Type keyword at press Enter (Fastest!)' 
              : '💡 Keywords: cashier, admin, sales, inventory'}
          </p>
          
          {/* Brave voice enable instructions */}
          <details className="mt-2">
            <summary className="text-blue-600 dark:text-blue-400 text-[11px] text-center cursor-pointer font-medium">
              🛡️ How to enable voice in Brave? (Click)
            </summary>
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-[10px] text-gray-700 dark:text-gray-300">
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Click sa Shield icon sa URL bar</li>
                <li>Click "Advanced View"</li>
                <li>Toggle OFF "Block fingerprinting"</li>
                <li>O kaya i-allow ang microphone permission</li>
                <li>Refresh page at subukan ulit</li>
              </ol>
              <p className="mt-2 text-center text-blue-600 dark:text-blue-400 font-medium">
                💡 O gamitin na lang Type mode - mas mabilis pa!
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default VoiceNavigator;
