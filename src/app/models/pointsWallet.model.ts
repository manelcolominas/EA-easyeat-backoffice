export interface IPointsWallet {
    _id?: string;
    customer_id: string;    // reference to Customer
    restaurant_id: string;  // reference to Restaurant
    points: number;
}
