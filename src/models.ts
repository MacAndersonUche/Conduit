export interface Account {
  id: string;             
  name?: string;          
  direction: "debit" | "credit";
  balance: number;         // Updated only via Entries
}

export interface Transaction {
  id: string;             
  name?: string;          
  entries: Entry[];       
}

export interface Entry {
  id: string;             
  transactionId: string;  
  accountId: string;      
  direction: "debit" | "credit";
  amount: number;         
}
