import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient, RedisClientType } from 'redis';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { v4 as uuidv4 } from 'uuid';
import { Bridge } from './bridge/Bridge';
import { BitcoinService } from './services/BitcoinService';
import { LiquidService } from './services/LiquidService';
import { BridgeService } from './services/BridgeService';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Redis client for caching
const redisClient: RedisClientType = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Services
const bitcoinService = new BitcoinService(process.env.BITCOIN_NODE_URL || 'http://localhost:18332');
const liquidService = new LiquidService(process.env.LIQUID_NODE_URL || 'http://localhost:18884');

// Modify the BridgeService constructor call
const bridgeService = new BridgeService(bitcoinService, liquidService, redisClient);

// Move this line after the BridgeService instantiation
const bridge = new Bridge(true); // Use testnet

const ECPair = ECPairFactory(ecc);

// Simulated wallet
let connectedWallet: { address: string; privateKey: string } | null = null;

// Routes
app.post('/connect-wallet', (req, res) => {
  const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks.testnet });
  connectedWallet = { address: address!, privateKey: keyPair.toWIF() };
  res.json({ address: connectedWallet.address, balance: Math.random() * 10 });
});

app.post('/disconnect-wallet', (req, res) => {
  connectedWallet = null;
  res.sendStatus(200);
});

app.post('/api/lock-bitcoin', AuthMiddleware.authenticate, async (req, res, next) => {
  try {
    const { btcAddress, liquidAddress, amount } = req.body;
    if (!connectedWallet || connectedWallet.address !== btcAddress) {
      return res.status(400).json({ error: 'Wallet not connected or address mismatch' });
    }
    const result = await bridgeService.lockBitcoin(btcAddress, liquidAddress, amount);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/unlock-bitcoin', AuthMiddleware.authenticate, async (req, res, next) => {
  try {
    const { liquidAddress, btcAddress, amount } = req.body;
    if (!connectedWallet || connectedWallet.address !== btcAddress) {
      return res.status(400).json({ error: 'Wallet not connected or address mismatch' });
    }
    const result = await bridgeService.unlockBitcoin(liquidAddress, btcAddress, amount);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/bridge-state', async (req, res, next) => {
  try {
    const state = await bridgeService.getBridgeState();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

app.get('/generate-address/:network', (req, res) => {
  const { network } = req.params;
  let address, privateKey;

  if (network === 'bitcoin') {
    ({ address, privateKey } = bitcoinService.generateAddress());
  } else if (network === 'liquid') {
    ({ address, privateKey } = liquidService.generateAddress());
  } else {
    return res.status(400).json({ error: 'Invalid network' });
  }

  res.json({ address, privateKey });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});