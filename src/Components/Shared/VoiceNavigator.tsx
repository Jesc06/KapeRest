import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faTimes } from '@fortawesome/free-solid-svg-icons';

interface VoiceNavigatorProps {
  onClose?: () => void;
  autoListen?: boolean;
  onListeningStart?: () => void;
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

const VoiceNavigator: React.FC<VoiceNavigatorProps> = ({ onClose, autoListen = false, onListeningStart }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [status, setStatus] = useState('Ready! Click mic or type command');
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

  // Text-to-Speech function
  const speak = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.1; // Slightly faster
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  // Get friendly name for route
  const getRouteName = (route: string): string => {
    const routeNames: { [key: string]: string } = {
      '/': 'Home',
      '/login': 'Login',
      '/register': 'Register',
      '/cashier': 'Cashier',
      '/cashier/buy-item': 'Buy Item',
      '/cashier/sales': 'Cashier Sales',
      '/cashier/change-password': 'Change Password',
      '/cashier/hold-items': 'Hold Items',
      '/cashier/purchases': 'Purchases',
      '/staff': 'Staff',
      '/staff/add-supplier': 'Add Supplier',
      '/staff/suppliers': 'Suppliers',
      '/staff/add-item': 'Add Item',
      '/staff/items': 'Items',
      '/staff/add-stocks': 'Add Stocks',
      '/staff/stocks': 'Stocks',
      '/staff/sales': 'Staff Sales',
      '/staff/purchases': 'Staff Purchases',
      '/staff/void-requests': 'Void Requests',
      '/staff/change-password': 'Staff Change Password',
      '/staff/audit-trail': 'Staff Audit Trail',
      '/admin': 'Admin',
      '/admin/accounts': 'Accounts',
      '/admin/tax-discounts': 'Tax Discounts',
      '/admin/inventory': 'Inventory',
      '/admin/branch': 'Branch',
      '/admin/sales': 'Admin Sales',
      '/admin/audit-trail': 'Audit Trail',
    };
    return routeNames[route] || route;
  };

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus('Voice not supported - Use Type mode');
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
          const routeName = getRouteName(matchedRoute);
          const message = `Going to ${routeName}`;
          setStatus(message);
          speak(message);
          setTimeout(() => {
            navigate(matchedRoute);
            recognition.stop();
            setTranscript('');
            setStatus('Done!');
          }, 1000);
        } else {
          const errorMessage = 'Command not recognized. Please try again.';
          setStatus(errorMessage);
          speak(errorMessage);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMsg = 'Error occurred';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Microphone blocked! Enable permission or use Type mode';
        setShowManualInput(true);
        speak('Microphone access denied. Please use type mode.');
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Try again or type command';
        speak('No speech detected.');
      } else if (event.error === 'network') {
        errorMsg = 'Network issue. Try Type mode instead';
        setShowManualInput(true);
        speak('Network error. Please use type mode.');
      } else if (event.error === 'aborted') {
        errorMsg = 'Cancelled. Click mic again or type';
      } else {
        errorMsg = 'Voice error. Use Type mode!';
        setShowManualInput(true);
        speak('Voice recognition error. Please use type mode.');
      }
      
      setStatus(errorMsg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status.includes('Nakikinig')) {
        setStatus('Click mic to speak or type command');
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
      setStatus('Voice setup failed. Use Type mode!');
      setShowManualInput(true);
    }
  }, [navigate, status]);

  // Auto-start listening when component mounts if autoListen is true
  useEffect(() => {
    if (autoListen && recognitionRef.current && !isListening) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        toggleListening();
        if (onListeningStart) {
          onListeningStart();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoListen]);

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
      setStatus('Voice not available. Use Type mode!');
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
        setStatus('Mic permission denied. Use Type mode!');
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
          setStatus('Cannot start voice. Use Type mode!');
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
      const routeName = getRouteName(matchedRoute);
      const message = `Going to ${routeName}`;
      setStatus(message);
      speak(message);
      setTimeout(() => {
        navigate(matchedRoute);
        setManualInput('');
        setStatus('Done!');
      }, 1000);
    } else {
      const errorMessage = 'Command not recognized. Please try again.';
      setStatus(errorMessage);
      speak(errorMessage);
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
      className="fixed z-50 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-orange-200 dark:border-orange-800/50 cursor-move select-none backdrop-blur-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        minHeight: '240px',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header with drag handle */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-t-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FontAwesomeIcon icon={faMicrophone} className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg tracking-tight">Voice Navigator</h3>
            <p className="text-orange-100 text-xs font-medium">Quick navigation</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 cursor-pointer group"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white text-sm group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Control Buttons */}
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={toggleListening}
            className={`flex-1 max-w-[140px] h-16 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-lg font-bold ${
              isListening
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse text-white border-2 border-red-400'
                : 'bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-2 border-orange-400 dark:border-orange-600'
            }`}
            title="Voice navigation"
          >
            <FontAwesomeIcon
              icon={isListening ? faStop : faMicrophone}
              className="text-2xl"
            />
            <span className="text-sm font-extrabold">{isListening ? 'Stop' : 'Voice'}</span>
          </button>

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className={`flex-1 max-w-[140px] h-16 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-lg font-bold border-2 ${
              showManualInput
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-amber-400 dark:border-amber-600'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600'
            }`}
            title="Type command"
          >
            <span className="text-sm font-extrabold">TYPE</span>
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
              className="w-full px-5 py-4 rounded-xl text-sm font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 border-2 border-stone-200 dark:border-stone-700 transition-all"
              autoFocus
            />
          </form>
        )}

        {/* Status */}
        <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 rounded-xl p-4 min-h-[56px] flex items-center justify-center border-2 border-orange-200 dark:border-orange-800/50">
          <p className="text-stone-700 dark:text-stone-200 text-sm font-bold text-center">{status}</p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-xl p-4 border-2 border-orange-300 dark:border-orange-700 shadow-inner">
            <p className="text-orange-900 dark:text-orange-100 text-sm font-bold italic text-center">"{transcript}"</p>
          </div>
        )}

        {/* Instructions */}
        <div className="w-full border-t-2 border-orange-200 dark:border-orange-800/50 pt-4">
          <p className="text-stone-600 dark:text-stone-400 text-xs text-center font-semibold leading-relaxed">
            {showManualInput 
              ? 'Type keyword and press Enter (Fastest!)' 
              : 'Keywords: cashier, admin, sales, inventory'}
          </p>
          
          {/* Brave voice enable instructions */}
          <details className="mt-3">
            <summary className="text-orange-600 dark:text-orange-400 text-[11px] text-center cursor-pointer font-bold hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
              How to enable voice in Brave? (Click)
            </summary>
            <div className="mt-3 p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg text-[10px] text-stone-700 dark:text-stone-300 border-2 border-orange-200 dark:border-orange-800/50">
              <ol className="list-decimal list-inside space-y-1.5 text-left font-medium">
                <li>Click sa Shield icon sa URL bar</li>
                <li>Click "Advanced View"</li>
                <li>Toggle OFF "Block fingerprinting"</li>
                <li>O kaya i-allow ang microphone permission</li>
                <li>Refresh page at subukan ulit</li>
              </ol>
              <p className="mt-3 text-center text-orange-600 dark:text-orange-400 font-bold text-[11px]">
                Tip: O gamitin na lang Type mode - mas mabilis pa!
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default VoiceNavigator;
