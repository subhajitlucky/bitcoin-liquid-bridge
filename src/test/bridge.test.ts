import { Bridge } from '../bridge/Bridge';
import { BitcoinService } from '../services/BitcoinService';
import { LiquidService } from '../services/LiquidService';

const bridge = new Bridge(true); // Use testnet
const bitcoinService = new BitcoinService(true);
const liquidService = new LiquidService(true);

(async () => {
  console.log('Testing Bitcoin to Liquid bridge...');
  const { address: btcAddress, privateKey: btcPrivateKey } = bitcoinService.generateAddress();
  const { address: liquidAddress } = liquidService.generateAddress();

  console.log(`Bitcoin Address: ${btcAddress}`);
  console.log(`Liquid Address: ${liquidAddress}`);

  const amount = 0.001;
  const liquidTxId = await bridge.lockBitcoin(btcAddress, amount, liquidAddress);
  console.log(`Locked ${amount} BTC and minted L-BTC. Liquid Transaction ID: ${liquidTxId}`);

  console.log('\nTesting Liquid to Bitcoin bridge...');
  const { address: newBtcAddress } = bitcoinService.generateAddress();
  console.log(`New Bitcoin Address: ${newBtcAddress}`);

  const btcTxId = await bridge.unlockBitcoin(liquidAddress, amount, newBtcAddress);
  console.log(`Burned L-BTC and unlocked ${amount} BTC. Bitcoin Transaction ID: ${btcTxId}`);
})();