'use client';

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';

type Mode = 'mock' | 'live';

// Define types inline since we're loading SDK via script
interface VerificationSession {
  id: string;
  provider: string;
  providerSessionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface VerificationEvent {
  type: string;
  data: {
    [key: string]: unknown;
    error?: string;
    message?: string;
  };
}

interface EventLog {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('mock');
  const [sdkKey, setSdkKey] = useState('');
  const [docvToken, setDocvToken] = useState('89b904e8-c2b7-4af4-8126-b905ca98520a');
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api');
  const [isVerifying, setIsVerifying] = useState(false);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const vecuIDVRef = useRef<any>(null);
  const currentSessionRef = useRef<VerificationSession | null>(null);
  const eventCounterRef = useRef(0);

  const logEvent = (message: string, type: EventLog['type'] = 'info') => {
    eventCounterRef.current += 1;
    const newEvent: EventLog = {
      id: Date.now() + eventCounterRef.current, // Combine timestamp with counter for uniqueness
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const startVerification = async () => {
    if (!sdkKey.trim()) {
      alert('Please enter your Socure SDK Key');
      return;
    }
    if (!docvToken.trim()) {
      alert('Please enter a docvTransactionToken');
      return;
    }

    try {
      setIsVerifying(true);
      logEvent('Initializing VECU IDV SDK...');
      
      // Set mock mode
      (window as Window & { MOCK_MODE?: boolean }).MOCK_MODE = mode === 'mock';
      
      // Wait for SDK to be loaded
      if (!sdkLoaded || !(window as any).VecuIDV) {
        logEvent('SDK not loaded yet. Please wait...', 'error');
        return;
      }
      
      const VecuIDV = (window as any).VecuIDV.VecuIDV;
      
      // Initialize SDK
      vecuIDVRef.current = new VecuIDV({
        apiKey: mode === 'mock' ? 'test-api-key' : 'your-real-api-key',
        apiUrl: apiUrl,
        environment: 'development',
        providers: {
          socure: {
            publicKey: sdkKey,
            environment: 'sandbox',
            qrCode: true
          }
        }
      });
      
      // Subscribe to events
      vecuIDVRef.current.on('*', (event: VerificationEvent) => {
        logEvent(`Event: ${event.type} - ${JSON.stringify(event.data)}`);
      });
      
      vecuIDVRef.current.on('verification:completed', (event: VerificationEvent) => {
        logEvent('Verification completed successfully!', 'success');
        console.log('Verification result:', event.data);
      });
      
      vecuIDVRef.current.on('verification:failed', (event: VerificationEvent) => {
        logEvent(`Verification failed: ${event.data.error}`, 'error');
      });
      
      vecuIDVRef.current.on('error', (event: VerificationEvent) => {
        logEvent(`Error: ${event.data.message}`, 'error');
      });
      
      // Skip SDK initialization to avoid backend requirement
      logEvent('Skipping VECU SDK init - working directly with Socure');
      
      // Force the SDK to be initialized without calling the backend
      vecuIDVRef.current.initialized = true;
      
      // Create a minimal session for testing with real Socure SDK
      const testSessionData: VerificationSession = {
        id: 'test-session-' + Date.now(),
        provider: 'socure',
        providerSessionId: docvToken,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store the session in the SDK's active sessions
      vecuIDVRef.current.activeSessions.set(testSessionData.id, testSessionData);
      
      logEvent(`Using Socure ${mode === 'mock' ? 'mock' : 'real SDK'} with token: ${docvToken.substring(0, 8)}...`);
      
      // Load the Socure provider
      logEvent('Loading Socure provider...');
      const provider = await vecuIDVRef.current.providerLoader.load('socure');
      logEvent('Socure provider loaded');
      
      // Initialize the verification UI directly with the provider
      const container = document.querySelector('#verification-container');
      if (!container) {
        throw new Error('Verification container not found');
      }
      
      await provider.initializeVerification({
        sessionId: testSessionData.id,
        token: docvToken,
        container: container as HTMLElement,
        mode: 'embedded',
        config: {
          publicKey: sdkKey,
          qrCode: true
        }
      });
      
      logEvent('Socure verification UI initialized');
      currentSessionRef.current = testSessionData;
      
      logEvent('Verification UI started - waiting for user interaction');
      
    } catch (error) {
      logEvent(`Error: ${(error as Error).message}`, 'error');
      console.error('Verification error:', error);
      setIsVerifying(false);
    }
  };

  const stopVerification = async () => {
    logEvent('Stopping verification...');
    
    try {
      // Clean up the provider if it exists
      if (vecuIDVRef.current) {
        const provider = vecuIDVRef.current.providerRegistry?.get('socure');
        if (provider) {
          provider.destroy();
          logEvent('Socure provider destroyed');
        }
        
        // Clear active sessions without API calls
        vecuIDVRef.current.activeSessions.clear();
        vecuIDVRef.current.destroy();
        vecuIDVRef.current = null;
        logEvent('SDK destroyed');
      }
    } catch (error) {
      logEvent(`Error cleaning up: ${(error as Error).message}`, 'error');
    }
    
    // Reset UI
    setIsVerifying(false);
    const container = document.getElementById('verification-container');
    if (container) {
      container.innerHTML = 'Verification UI will appear here';
    }
    
    logEvent('Verification stopped');
  };
  
  // Log mode changes
  useEffect(() => {
    logEvent(`Switched to ${mode} mode`);
  }, [mode]);

  return (
    <>
      <Script 
        src="/lib/vecu-idv-web-sdk/dist/index.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          setSdkLoaded(true);
          logEvent('VECU IDV SDK loaded successfully');
        }}
        onError={() => {
          logEvent('Failed to load VECU IDV SDK', 'error');
        }}
      />
      <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8">Test Socure Integration</h1>
          
          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Test</h3>
            <ol className="list-decimal list-inside text-gray-900 space-y-2">
              <li>Enter your Socure SDK Key (public key like sdk_sandbox_xxxxx)</li>
              <li>The docvTransactionToken is pre-filled with your test token</li>
              <li>Choose Mock Mode for UI testing or Live Mode for real integration</li>
              <li>Click &quot;Start Verification&quot; to test the flow</li>
            </ol>
          </div>

          {/* Configuration */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Configuration</h2>
            
            {/* Mode Toggle */}
            <div className="mb-6 flex gap-6">
              <label className="flex items-center text-gray-900 font-medium">
                <input
                  type="radio"
                  name="mode"
                  value="mock"
                  checked={mode === 'mock'}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="mr-2"
                />
                Mock Mode (UI Testing)
              </label>
              <label className="flex items-center text-gray-900 font-medium">
                <input
                  type="radio"
                  name="mode"
                  value="live"
                  checked={mode === 'live'}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="mr-2"
                />
                Live Mode (Real Integration)
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="sdk-key" className="block font-semibold text-gray-700 mb-2">
                  Socure SDK Key (Public)
                </label>
                <input
                  type="text"
                  id="sdk-key"
                  value={sdkKey}
                  onChange={(e) => setSdkKey(e.target.value)}
                  placeholder="sdk_sandbox_xxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Your Socure public SDK key (starts with sdk_)
                </div>
              </div>

              <div>
                <label htmlFor="docv-token" className="block font-semibold text-gray-700 mb-2">
                  DocV Transaction Token
                </label>
                <input
                  type="text"
                  id="docv-token"
                  value={docvToken}
                  onChange={(e) => setDocvToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-sm text-gray-600 mt-1">
                  The docvTransactionToken from your backend API
                </div>
              </div>

              <div>
                <label htmlFor="api-url" className="block font-semibold text-gray-700 mb-2">
                  Backend API URL
                </label>
                <input
                  type="text"
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Your backend API endpoint (only used in Live Mode)
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8">
            {!isVerifying ? (
              <button
                onClick={startVerification}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Start Verification
              </button>
            ) : (
              <button
                onClick={stopVerification}
                className="bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Stop Verification
              </button>
            )}
          </div>

          {/* Verification Container */}
          <div
            id="verification-container"
            className={`min-h-[600px] border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-lg ${
              isVerifying ? 'border-transparent' : 'border-gray-300'
            }`}
          >
            {!isVerifying && 'Verification UI will appear here'}
          </div>

          {/* Event Log */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Log</h3>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`px-3 py-2 rounded text-sm font-mono border-l-4 ${
                    event.type === 'error'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : event.type === 'success'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-blue-500 text-gray-700'
                  }`}
                >
                  [{event.timestamp}] {event.message}
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-gray-400 text-sm">No events yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}