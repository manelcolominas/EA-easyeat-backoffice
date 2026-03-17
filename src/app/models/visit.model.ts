export interface IVisit {
    _id?: string;
    customer_id: string;            // reference to Customer
    restaurant_id: string;          // reference to Restaurant
    date: Date;
    pointsEarned?: number;
    billAmount?: number;
}
