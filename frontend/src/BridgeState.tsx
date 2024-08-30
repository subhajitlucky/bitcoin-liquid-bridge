import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BridgeState: React.FC = () => {
  const [state, setState] = useState({ lockedBitcoin: 0, mintedLBTC: 0 });

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await axios.get('http://localhost:3001/bridge-state');
        setState(response.data);
      } catch (error) {
        console.error('Error fetching bridge state:', error);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Bridge State</h2>
      <p className="text-sm text-gray-600">Locked Bitcoin:</p>
      <p className="font-bold mb-2">{state.lockedBitcoin} BTC</p>
      <p className="text-sm text-gray-600">Minted L-BTC:</p>
      <p className="font-bold">{state.mintedLBTC} L-BTC</p>
    </div>
  );
};

export default BridgeState;
