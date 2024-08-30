interface Bitcoin {
    request: (method: string, ...params: any[]) => Promise<any>;
  }
  
  interface Window {
    bitcoin?: Bitcoin;
  }