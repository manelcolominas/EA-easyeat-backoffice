export interface IReview {
  _id?: string;

  customer_id: string;

  restaurant_id: string | {
    _id: string;
    profile: { name: string };
  };

  dish_id?: string;
  dishRatings?: {
    dish_id: string;
    rating: number;
  }[];

  date: string | Date;
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
