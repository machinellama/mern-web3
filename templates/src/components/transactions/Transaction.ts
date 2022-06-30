export interface Transaction {
  amount: number;
  created: string;
  from: string;
  gasFee: number;
  id?: number | string,
  network: string;
  raw?: any;
  to: string;
  transactionId: string;
  userId?: number | string;
}
