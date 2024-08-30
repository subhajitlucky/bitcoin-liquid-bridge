import { LiquidService } from '../services/LiquidService';

const liquidService = new LiquidService(true); // Use testnet

console.log('Generating Liquid address...');
const { address, privateKey } = liquidService.generateAddress();
console.log(`Address: ${address}`);
console.log(`Private Key: ${privateKey}`);

console.log('\nTesting other methods (placeholders)...');
(async () => {
  const assetHash = '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d'; // Example L-BTC asset hash
  const balance = await liquidService.getBalance(address, assetHash);
  console.log(`Balance: ${balance}`);

  const txHex = await liquidService.createTransaction(address, 'ex1qjwmdyh5xv9c29pnc9n30dhcpa0uyh8gk5x5eef', 0.001, privateKey, assetHash);
  console.log(`Transaction Hex: ${txHex}`);

  const txId = await liquidService.broadcastTransaction(txHex);
  console.log(`Transaction ID: ${txId}`);
})();