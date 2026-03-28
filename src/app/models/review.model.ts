export interface IReview {
  _id?: string;

  customer_id: {
    _id: string;
    name: string;
  };

  restaurant_id: {
    _id: string;
    name: string;
  };

  date: string; 
  globalRating: number;

  ratings?: {
    foodQuality?: number;
    staffService?: number;
    cleanliness?: number;
    environment?: number;
  };

  comment?: string;
  likes?: number;

   deleted?: boolean;
}