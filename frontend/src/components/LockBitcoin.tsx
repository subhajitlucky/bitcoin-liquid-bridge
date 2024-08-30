import React, { useState } from 'react';
import axios from 'axios';


interface LockBitcoinProps {
  connectedAddress: string | null;
}

const LockBitcoin: React.FC<LockBitcoinProps> = ({ connectedAddress }) => {
  const [liquidAddress, setLiquidAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [token, setToken] = useState(''); // Add this line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!connectedAddress) {
      setError('Please connect a Bitcoin wallet first');
      setIsLoading(false);
      return;
    }

    if (!liquidAddress) {
      setError('Please enter a Liquid address');
      setIsLoading(false);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setIsLoading(false);
      return;
    }

    try {
      // Retrieve the token from wherever it's stored (e.g., localStorage)
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        throw new Error('Authentication token not found');
      }
      setToken(storedToken);

      const response = await axios.post('/api/lock-bitcoin', 
        { 
          btcAddress: connectedAddress,
          liquidAddress, 
          amount: parseFloat(amount) 
        },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      setResult(`Successfully locked ${amount} BTC and minted ${response.data.mintedAmount} L-BTC. Transaction ID: ${response.data.btcTxId}`);
    } catch (err) {
      console.error('Error locking Bitcoin:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error: ${err.response.data.error || err.response.data.message || err.message}`);
      } else {
        setError('Error locking Bitcoin. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lock Bitcoin</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="liquidAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Liquid Address
          </label>
          <input
            id="liquidAddress"
            type="text"
            placeholder="Enter Liquid address"
            value={liquidAddress}
            onChange={(e) => setLiquidAddress(e.target.value)}
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (BTC)
          </label>
          <input
            id="amount"
            type="number"
            step="0.00000001"
            min="0"
            placeholder="Enter amount to lock"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          />
        </div>
        <button 
          type="submit" 
          disabled={!connectedAddress || isLoading}
          className={`w-full px-4 py-2 text-white font-semibold rounded-md ${
            !connectedAddress || isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75'
          }`}
        >
          {isLoading ? 'Processing...' : 'Lock Bitcoin'}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {result}
        </div>
      )}
    </div>
  );
};

export default LockBitcoin;