interface UniSat {
    requestAccounts: () => Promise<string[]>;
    getBalance: () => Promise<{ total: number; confirmed: number; unconfirmed: number }>;
    disconnect: () => Promise<void>;
  }
  
  interface Window {
    unisat?: UniSat;
  }