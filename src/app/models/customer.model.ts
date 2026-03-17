export interface ICustomer {
    _id?: string;
    name: string;
    email: string;
    password: string;
    profilePictures?: string[];
    pointsWallet?: string[];
    visitHistory?: string[];
    favoriteRestaurants?: string[];
    badges?: string[];
    reviews?: string[];
}
