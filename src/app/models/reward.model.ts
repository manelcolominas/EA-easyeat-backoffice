export interface IReward {
    _id?: string;
    restaurant_id: string;   // reference to Restaurant
    name: string;
    description: string;
    pointsRequired?: number;
    active: boolean;
    expiry?: Date;
    timesRedeemed?: number;
}
