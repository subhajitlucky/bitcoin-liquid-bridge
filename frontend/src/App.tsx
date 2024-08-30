import React, { useState } from 'react';
import LockBitcoin from './components/LockBitcoin';
import UnlockBitcoin from './components/UnlockBitcoin';
import GenerateAddress from './components/GenerateAddress';
import BitcoinWalletConnect from './components/BitcoinWalletConnect';
import BridgeState from './BridgeState';

function App() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setConnectedAddress(address);
  };

  const handleWalletDisconnect = () => {
    setConnectedAddress(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-5 text-center text-gray-800">Bitcoin-Liquid Bridge</h1>
          <BitcoinWalletConnect 
            onConnect={handleWalletConnect} 
            onDisconnect={handleWalletDisconnect}
            connectedAddress={connectedAddress}
          />
          <BridgeState />
          {connectedAddress && (
            <div className="flex justify-center space-x-4 mt-6">
              <button onClick={() => setActiveComponent('lock')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">Lock Bitcoin</button>
              <button onClick={() => setActiveComponent('unlock')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">Unlock Bitcoin</button>
              <button onClick={() => setActiveComponent('generate')} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-300">Generate Address</button>
            </div>
          )}
          <div className="mt-8">
            {activeComponent === 'lock' && <LockBitcoin connectedAddress={connectedAddress} />}
            {activeComponent === 'unlock' && <UnlockBitcoin connectedAddress={connectedAddress} />}
            {activeComponent === 'generate' && <GenerateAddress />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;