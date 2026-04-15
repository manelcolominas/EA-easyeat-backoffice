export interface ITopDishInfo {
  dishId: string;
  name: string;
  averageRating: number;
  totalRatings: number;
}

export interface IRestaurantTopDishResponse {
  restaurantId: string;
  restaurantName: string;
  topDish: ITopDishInfo | null;
}
