import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [receivedData, setReceivedData] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    // Initialize WebView bridge
    const initBridge = () => {
      // Check if running in React Native WebView
      if (window.ReactNativeWebView) {
        setIsConnected(true);
        addLog('Bridge initialized successfully', 'info');

        // Send ready signal to React Native
        sendToReactNative('__WEBVIEW_READY__', { ready: true });
        sendToReactNative('webPageLoaded', {
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      } else {
        addLog('WARNING: Not running in React Native WebView', 'error');
      }
    };

    // Set up message listeners for React Native
    const setupListeners = () => {
      // Listen for user data
      window.onReactNativeMessage('userData', (data) => {
        addLog('Received userData: ' + JSON.stringify(data), 'received');
        setReceivedData({
          title: 'User Data',
          content: [
            { label: 'Name', value: data.name || 'N/A' },
            { label: 'Timestamp', value: data.timestamp || 'N/A' }
          ]
        });
      });

      // Listen for user identity
      window.onReactNativeMessage('userIdentity', (data) => {
        addLog('Received userIdentity', 'received');
        if (data.isLoggedIn && data.user) {
          setReceivedData({
            title: 'User Identity - Logged In',
            content: [
              { label: 'Name', value: data.user.name },
              { label: 'Email', value: data.user.email },
              { label: 'Phone', value: data.user.phone },
              { label: 'User ID', value: data.user.userId }
            ]
          });
        } else {
          setReceivedData({
            title: 'User Identity - Guest',
            content: [
              { label: 'Guest ID', value: data.guestUserId }
            ]
          });
        }
      });

      // Listen for trigger action
      window.onReactNativeMessage('triggerAction', (data) => {
        addLog('Received action: ' + data.action, 'received');
        setReceivedData({
          title: 'Action Triggered',
          content: [
            { label: 'Action', value: data.action },
            { label: 'Promo Code', value: data.promoCode || 'N/A' }
          ]
        });
      });

      // Listen for state request
      window.onReactNativeMessage('getState', () => {
        addLog('State requested, sending response...', 'received');
        sendToReactNative('stateResponse', {
          currentPage: window.location.href,
          scrollY: window.scrollY,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        });
      });
    };

    initBridge();
    setupListeners();
  }, []);

  const addLog = (message, type = 'info') => {
    setMessages(prev => [{
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 20)); // Keep last 20 messages
  };

  const sendToReactNative = (type, payload) => {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      const message = {
        type,
        payload,
        timestamp: Date.now()
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
      addLog('Sent to RN: ' + type, 'sent');
    } else {
      addLog('ERROR: Bridge not available', 'error');
    }
  };

  // Test functions
  const sendCartUpdate = () => {
    sendToReactNative('webCartUpdated', {
      itemCount: 5,
      totalPrice: 2499.99,
      timestamp: new Date().toISOString()
    });
  };

  const sendButtonClick = () => {
    sendToReactNative('webButtonClicked', {
      buttonName: 'Test Button',
      buttonId: 'test-btn-' + Date.now()
    });
  };

  const requestAppState = () => {
    sendToReactNative('getState', {
      requestedAt: new Date().toISOString()
    });
  };

  const sendCustomEvent = () => {
    setMessageCount(prev => prev + 1);
    sendToReactNative('customWebEvent', {
      message: 'Hello from WebView!',
      count: messageCount + 1,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-title">
          <h1>🔗 WebView Bridge Test</h1>
          <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '✅ Connected' : '❌ Not Connected'}
          </span>
        </div>
        <p className="subtitle">Bidirectional communication with React Native</p>

        {/* Send to React Native Section */}
        <div className="card">
          <h2>Send to React Native</h2>
          <div className="button-group">
            <button onClick={sendCartUpdate} disabled={!isConnected}>
              📦 Send Cart Update (5 items)
            </button>
            <button onClick={sendButtonClick} disabled={!isConnected}>
              🔘 Send Button Click Event
            </button>
            <button onClick={requestAppState} disabled={!isConnected}>
              📊 Request App State
            </button>
            <button onClick={sendCustomEvent} disabled={!isConnected}>
              ✨ Send Custom Event
            </button>
          </div>
        </div>

        {/* Received Data Section */}
        <div className="card">
          <h2>Received from React Native</h2>
          <div className="info-box">
            {receivedData ? (
              <>
                <strong>{receivedData.title}</strong>
                {receivedData.content.map((item, idx) => (
                  <div key={idx} className="data-row">
                    <span className="label">{item.label}:</span>
                    <span className="value">{item.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <p>Waiting for messages from React Native...</p>
            )}
          </div>
        </div>

        {/* Message Log Section */}
        <div className="card">
          <h2>📝 Message Log</h2>
          <div className="message-log">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <span className="time">{msg.time}</span>
                  <span className="text">{msg.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
