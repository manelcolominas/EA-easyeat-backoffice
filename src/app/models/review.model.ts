export interface IReview {
    _id?: string;
    customer_id: string;        // reference to Customer
    restaurant_id: string;    // reference to Restaurant
    date: Date;
    ratings?: {
        foodQuality?: number;
        staffService?: number;
        cleanliness?: number;
        environment?: number;
    };
    comment?: string;
    photos?: string[];
    likes?: number;
    extraPoints?: number;             // optional points awarded for feedback
}
