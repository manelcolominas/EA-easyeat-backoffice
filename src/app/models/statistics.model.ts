export interface IStatistics {
    _id?: string;
    restaurant_id: string;
    totalPointsGiven?: number;
    loyalCustomers?: number;
    mostRequestedRewards?: string[];
    averagePointsPerVisit?: number;
}
