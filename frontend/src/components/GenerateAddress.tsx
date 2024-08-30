import React, { useState } from 'react';
import axios from 'axios';

const GenerateAddress: React.FC = () => {
  const [network, setNetwork] = useState('bitcoin');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/generate-address/${network}`);
      setResult(`Generated ${network.charAt(0).toUpperCase() + network.slice(1)} Address: ${response.data.address}\nPrivate Key: ${response.data.privateKey}`);
    } catch (error) {
      setResult(`Error generating ${network} address`);
    }
  };

  return (
    <div>
      <h2>Generate Address</h2>
      <select value={network} onChange={(e) => setNetwork(e.target.value)}>
        <option value="bitcoin">Bitcoin</option>
        <option value="liquid">Liquid</option>
      </select>
      <button onClick={handleGenerate}>Generate Address</button>
      {result && <pre>{result}</pre>}
    </div>
  );
};

export default GenerateAddress;