import React, { useState } from 'react';
import axios from 'axios';

interface UnlockBitcoinProps {
  connectedAddress: string | null;
}

const UnlockBitcoin: React.FC<UnlockBitcoinProps> = ({ connectedAddress }) => {
  const [liquidAddress, setLiquidAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      setResult('Please connect a Bitcoin wallet first');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/unlock-bitcoin', {
        liquidAddress,
        btcAddress: connectedAddress,
        amount: parseFloat(amount)
      });
      setResult(`Burned L-BTC and unlocked ${amount} BTC. Bitcoin Transaction ID: ${response.data.btcTxId}`);
    } catch (error) {
      setResult('Error unlocking Bitcoin');
    }
  };

  return (
    <div>
      <h2>Unlock Bitcoin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Liquid Address"
          value={liquidAddress}
          onChange={(e) => setLiquidAddress(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit" disabled={!connectedAddress}>Unlock Bitcoin</button>
      </form>
      {result && <p>{result}</p>}
    </div>
  );
};

export default UnlockBitcoin;