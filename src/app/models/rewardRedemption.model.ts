export interface IRewardRedemption {
    _id?: string;
    customer_id: string;
    restaurant_id: string;
    reward_id: string;
    employee_id: string;
    pointsUsed: number;
    status: string;
    redeemedAt: Date;
    notes?: string;
}
