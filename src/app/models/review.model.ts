export interface IReview {
  _id?: string;

  customer_id: string;
  restaurant_id: string;
  dish_id?: string;

  globalRating: number;
  dishRating?: number;

  images: string[];

  ratings?: {
    foodQuality?: number;
    staffService?: number;
    cleanliness?: number;
    environment?: number;
  };

  comment?: string;
  likes?: number;

  deletedAt?: string | null;
  deleted?: boolean;

  createdAt?: string;
  updatedAt?: string;
}