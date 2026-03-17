export interface IRestaurant {
    _id?: string;
    profile: {
        name: string;
        description?: string;
        rating?: number;
        category?: string[];
        timetable?: {
            monday?: [{ open: string, close: string }];
            tuesday?: [{ open: string, close: string }];
            wednesday?: [{ open: string, close: string }];
            thursday?: [{ open: string, close: string }];
            friday?: [{ open: string, close: string }];
            saturday?: [{ open: string, close: string }];
            sunday?: [{ open: string, close: string }];
        };
        image?: string[];
        contact?: {
            phone?: string;
            email?: string;
        };
        location: {
            city: string;
            address: string;
            googlePlaceId?: string;
            coordinates: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: [number, number]; // [longitude, latitude]
            };
        };
    };
    employees?: string[];
    dishes?: string[];
    rewards?: string[];
    statistics?: string;
    badges?: string[];
}
