import { BitcoinService } from '../services/BitcoinService';

const bitcoinService = new BitcoinService(true); // Use testnet

console.log('Generating Bitcoin address...');
const { address, privateKey } = bitcoinService.generateAddress();
console.log(`Address: ${address}`);
console.log(`Private Key: ${privateKey}`);

console.log('\nTesting other methods (placeholders)...');
(async () => {
  const balance = await bitcoinService.getBalance(address);
  console.log(`Balance: ${balance}`);

  const txHex = await bitcoinService.createTransaction(address, 'mzFqr5UZNPPeFuAMBJMhA1ggad7EdMDpBJ', 0.001, privateKey);
  console.log(`Transaction Hex: ${txHex}`);

  const txId = await bitcoinService.broadcastTransaction(txHex);
  console.log(`Transaction ID: ${txId}`);
})();