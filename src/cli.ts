import readline from 'readline';
import { Bridge } from './bridge/Bridge';
import { BitcoinService } from './services/BitcoinService';
import { LiquidService } from './services/LiquidService';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const isTestnet = true;
const bridge = new Bridge(isTestnet);
const network = isTestnet ? 'testnet' : 'mainnet';
const bitcoinService = new BitcoinService(network);
const liquidService = new LiquidService(network);

function promptUser() {
  rl.question('Choose an action:\n1. Lock Bitcoin\n2. Unlock Bitcoin\n3. Generate Bitcoin Address\n4. Generate Liquid Address\n5. Exit\n', async (choice) => {
    switch (choice) {
      case '1':
        await lockBitcoin();
        break;
      case '2':
        await unlockBitcoin();
        break;
      case '3':
        generateBitcoinAddress();
        break;
      case '4':
        generateLiquidAddress();
        break;
      case '5':
        rl.close();
        return;
      default:
        console.log('Invalid choice. Please try again.');
    }
    promptUser();
  });
}

async function lockBitcoin() {
  const btcAddress = await new Promise<string>(resolve => {
    rl.question('Enter Bitcoin address: ', (address) => resolve(address));
  });
  const liquidAddress = await new Promise<string>(resolve => {
    rl.question('Enter Liquid address: ', (address) => resolve(address));
  });
  const amount = await new Promise<number>(resolve => {
    rl.question('Enter amount to lock: ', (amount) => resolve(parseFloat(amount)));
  });

  try {
    const liquidTxId = await bridge.lockBitcoin(btcAddress, amount, liquidAddress);
    console.log(`Locked ${amount} BTC and minted L-BTC. Liquid Transaction ID: ${liquidTxId}`);
  } catch (error) {
    console.error('Error locking Bitcoin:', error);
  }
}

async function unlockBitcoin() {
  const liquidAddress = await new Promise<string>(resolve => {
    rl.question('Enter Liquid address: ', (address) => resolve(address));
  });
  const btcAddress = await new Promise<string>(resolve => {
    rl.question('Enter Bitcoin address: ', (address) => resolve(address));
  });
  const amount = await new Promise<number>(resolve => {
    rl.question('Enter amount to unlock: ', (amount) => resolve(parseFloat(amount)));
  });

  try {
    const btcTxId = await bridge.unlockBitcoin(liquidAddress, amount, btcAddress);
    console.log(`Burned L-BTC and unlocked ${amount} BTC. Bitcoin Transaction ID: ${btcTxId}`);
  } catch (error) {
    console.error('Error unlocking Bitcoin:', error);
  }
}

function generateBitcoinAddress() {
  const { address, privateKey } = bitcoinService.generateAddress();
  console.log(`Generated Bitcoin Address: ${address}`);
  console.log(`Private Key: ${privateKey}`);
}

function generateLiquidAddress() {
  const { address, privateKey } = liquidService.generateAddress();
  console.log(`Generated Liquid Address: ${address}`);
  console.log(`Private Key: ${privateKey}`);
}

console.log('Welcome to the Bitcoin-Liquid Bridge CLI');
promptUser();