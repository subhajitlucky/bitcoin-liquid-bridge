import { BitcoinService } from '../services/BitcoinService';
import { LiquidService } from '../services/LiquidService';

export class Bridge {
  private bitcoinService: BitcoinService;
  private liquidService: LiquidService;
  private bridgeAddress: string;
  private bridgePrivateKey: string;

  constructor(isTestnet: boolean = false) {
    this.bitcoinService = new BitcoinService(isTestnet);
    this.liquidService = new LiquidService(isTestnet);
    const { address, privateKey } = this.bitcoinService.generateAddress();
    this.bridgeAddress = address;
    this.bridgePrivateKey = privateKey;
  }

  async lockBitcoin(fromAddress: string, amount: number, liquidAddress: string): Promise<string> {
    // 1. Create a Bitcoin transaction to lock funds
    const txHex = await this.bitcoinService.createTransaction(fromAddress, this.bridgeAddress, amount, '');
    const txId = await this.bitcoinService.broadcastTransaction(txHex);

    // 2. Mint equivalent L-BTC on Liquid
    const assetHash = '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d'; // L-BTC asset hash
    const liquidTxHex = await this.liquidService.createTransaction(this.bridgeAddress, liquidAddress, amount, this.bridgePrivateKey, assetHash);
    const liquidTxId = await this.liquidService.broadcastTransaction(liquidTxHex);

    return liquidTxId;
  }

  async unlockBitcoin(liquidAddress: string, amount: number, bitcoinAddress: string): Promise<string> {
    // 1. Burn L-BTC on Liquid
    const assetHash = '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d'; // L-BTC asset hash
    const liquidTxHex = await this.liquidService.createTransaction(liquidAddress, this.bridgeAddress, amount, '', assetHash);
    const liquidTxId = await this.liquidService.broadcastTransaction(liquidTxHex);

    // 2. Release Bitcoin from the bridge address
    const txHex = await this.bitcoinService.createTransaction(this.bridgeAddress, bitcoinAddress, amount, this.bridgePrivateKey);
    const txId = await this.bitcoinService.broadcastTransaction(txHex);

    return txId;
  }
}