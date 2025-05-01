export interface Establishment {
    id?: string;
    name: string;
    category: string;
    address: string;
    description?: string;
    photos?: File | null;
    clientName?: string;
    clientEmail?: string;
  }
  
  export interface Promotion {
    id?: string;
    title: string;
    startDate: string;
    endDate: string;
    reduction: number;
    conditions?: string;
    image?: File | null;
  }
  
  export interface Event {
    target: HTMLInputElement;
    id?: string;
    name: string;
    date: string;
    time: string;
    type: string;
    description?: string;
    capacity: number;
    image?: File | null;
  }
  
  export interface Payment {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    pack: string;
    amount: number;
  }