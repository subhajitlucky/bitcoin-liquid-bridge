import { BitcoinService } from './BitcoinService';
import { LiquidService } from './LiquidService';
import { RedisClientType } from 'redis';
import { logger } from '../utils/logger';

export class BridgeService {
  constructor(
    private bitcoinService: BitcoinService,
    private liquidService: LiquidService,
    private redisClient: RedisClientType
  ) {}

  async lockBitcoin(btcAddress: string, liquidAddress: string, amount: number) {
    logger.info(`Locking ${amount} BTC from ${btcAddress} to ${liquidAddress}`);
    
    // Verify Bitcoin balance
    const btcBalance = await this.bitcoinService.getBalance(btcAddress);
    if (btcBalance < amount) {
      throw new Error('Insufficient Bitcoin balance');
    }

    // Lock Bitcoin
    const btcTxId = await this.bitcoinService.sendToMultisig(btcAddress, amount, this.bitcoinService.getMultisigAddress());

    // Mint L-BTC
    const liquidTxId = await this.liquidService.mintLBTC(liquidAddress, amount);

    // Update bridge state
    await this.updateBridgeState(amount, 'lock');

    return { btcTxId, liquidTxId };
  }

  async unlockBitcoin(liquidAddress: string, btcAddress: string, amount: number) {
    logger.info(`Unlocking ${amount} BTC from ${liquidAddress} to ${btcAddress}`);

    // Verify L-BTC balance
    const lbtcAssetId = await this.liquidService.getLBTCAssetId();
    const lbtcBalance = await this.liquidService.getBalance(liquidAddress, lbtcAssetId);
    if (lbtcBalance < amount) {
      throw new Error('Insufficient L-BTC balance');
    }

    // Burn L-BTC
    const liquidTxId = await this.liquidService.burnLBTC(liquidAddress, amount);

    // Unlock Bitcoin
    const btcTxId = await this.bitcoinService.sendFromMultisig(btcAddress, amount);

    // Update bridge state
    await this.updateBridgeState(amount, 'unlock');

    return { liquidTxId, btcTxId };
  }

  private async updateBridgeState(amount: number, action: 'lock' | 'unlock') {
    const key = 'bridge_state';
    const state = await this.redisClient.hGetAll(key);
    const lockedBitcoin = parseFloat(state.lockedBitcoin || '0');
    const mintedLBTC = parseFloat(state.mintedLBTC || '0');

    if (action === 'lock') {
      await this.redisClient.hSet(key, {
        lockedBitcoin: lockedBitcoin + amount,
        mintedLBTC: mintedLBTC + amount
      });
    } else {
      await this.redisClient.hSet(key, {
        lockedBitcoin: lockedBitcoin - amount,
        mintedLBTC: mintedLBTC - amount
      });
    }
  }

  async getBridgeState() {
    const state = await this.redisClient.hGetAll('bridge_state');
    return {
      lockedBitcoin: parseFloat(state.lockedBitcoin || '0'),
      mintedLBTC: parseFloat(state.mintedLBTC || '0')
    };
  }
}
