export interface IReview {
  _id?: string;

  customer_id: string;

  restaurant_id: string | {
    _id: string;
    name?: string;
    profile?: { name: string };
  };

  date: string | Date;
  globalRating: number;
  images: string[];

  ratings?: {
    foodQuality?: number;
    staffService?: number;
    cleanliness?: number;
    environment?: number;
  };

  comment?: string;
  likes?: number;

  deleted?: boolean;

  createdAt?: string;
  updatedAt?: string;
}
