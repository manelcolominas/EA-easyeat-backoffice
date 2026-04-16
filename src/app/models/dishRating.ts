export interface IDishRating {
    _id?: string;
    customer_id:   string;
    dish_id:       string;
    restaurant_id: string;
    rating:        number;
    deletedAt?:    Date | null;
    createdAt?:    Date;
    updatedAt?:    Date;
}