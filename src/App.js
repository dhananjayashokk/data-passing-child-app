import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [outfitData, setOutfitData] = useState(null);

  useEffect(() => {
    // Read URL parameters
    const params = new URLSearchParams(window.location.search);

    const data = {
      topId: params.get('topId'),
      topName: params.get('topName'),
      bottomId: params.get('bottomId'),
      bottomName: params.get('bottomName'),
      accessoryId: params.get('accessoryId'),
      accessoryName: params.get('accessoryName'),
      totalPrice: params.get('totalPrice')
    };

    // Only set data if at least one parameter exists
    if (Object.values(data).some(val => val !== null)) {
      setOutfitData(data);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Child App - Data Receiver</h1>

        {outfitData ? (
          <div className="data-display">
            <h2>Received Outfit Data:</h2>
            <div className="data-card">
              <div className="data-item">
                <span className="label">Top:</span>
                <span className="value">{outfitData.topName} (ID: {outfitData.topId})</span>
              </div>
              <div className="data-item">
                <span className="label">Bottom:</span>
                <span className="value">{outfitData.bottomName} (ID: {outfitData.bottomId})</span>
              </div>
              <div className="data-item">
                <span className="label">Accessory:</span>
                <span className="value">{outfitData.accessoryName} (ID: {outfitData.accessoryId})</span>
              </div>
              <div className="data-item total-price">
                <span className="label">Total Price:</span>
                <span className="value">₹{outfitData.totalPrice}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No outfit data received yet.</p>
            <p className="instruction">Navigate from the Shuffle Web App to see data here.</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
