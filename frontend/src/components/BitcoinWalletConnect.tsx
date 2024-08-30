import React, { useState } from 'react';
import { FaBitcoin, FaWallet, FaUnlink } from 'react-icons/fa';

interface WalletInfo {
  address: string;
  balance: number;
}

interface BitcoinWalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;  // Add this line
  connectedAddress: string | null;
}

declare global {
  interface Window {
    unisat: any;
  }
}

const BitcoinWalletConnect: React.FC<BitcoinWalletConnectProps> = ({ onConnect, onDisconnect, connectedAddress }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkWalletAvailability = () => {
    return typeof window.unisat !== 'undefined';
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    if (!checkWalletAvailability()) {
      setError('UniSat wallet is not detected. Please install the extension and refresh the page.');
      setIsConnecting(false);
      return;
    }

    try {
      const accounts = await window.unisat.requestAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found in the wallet');
      }

      const address = accounts[0];
      const balance = await window.unisat.getBalance();

      setWalletInfo({ 
        address, 
        balance: balance.total / 1e8 // Convert satoshis to BTC
      });
      onConnect(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.unisat.disconnect();
      setWalletInfo(null);
      onConnect('');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-yellow-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-yellow-500 flex items-center">
          <FaBitcoin className="mr-2" /> Bitcoin Wallet
        </h2>
        <span className="text-sm text-gray-400">UniSat</span>
      </div>
      {connectedAddress ? (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Connected Address</p>
            <p className="font-mono text-yellow-400 text-sm break-all">
              {connectedAddress}
            </p>
          </div>
          {walletInfo && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Balance</p>
              <p className="text-2xl font-bold text-green-400">
                {walletInfo.balance.toFixed(8)} BTC
              </p>
            </div>
          )}
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
          >
            <FaUnlink className="mr-2" /> Disconnect Wallet
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg mb-4 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <FaWallet className="mr-2" /> Connect Bitcoin Wallet
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          {!checkWalletAvailability() && (
            <p className="text-yellow-400 text-sm mt-2 bg-yellow-900 bg-opacity-20 p-3 rounded-lg">
              UniSat wallet not detected. Please install the extension and refresh the page.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BitcoinWalletConnect;