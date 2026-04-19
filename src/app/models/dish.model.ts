export interface IDish {
    _id?: string;
    restaurant_id: string;
    name: string;
    description?: string;
    section: 'Starters' | 'Mains' | 'Desserts' | 'Drinks' | 'Sides' | 'Specials';
    price: number;
    images?: string[];
    active: boolean;

    availableAt?: string[]; //No se que coi és això (ServicePeriod), però de moment poso que és string

    ingredients?: string[];
    allergens?: ('gluten' | 'shellfish' | 'nuts' | 'dairy' | 'eggs' | 'soy' | 'fish' | 'sesame' | 'mustard' | 'celery' | 'lupins' | 'molluscs' | 'sulphites')[];

    dietaryFlags?: ('vegan' | 'vegetarian' | 'gluten-free' | 'halal' | 'kosher' | 'dairy-free' | 'nut-free')[];

    flavorProfile?: ('spicy' | 'mild' | 'sweet' | 'sour' | 'salty' | 'bitter' | 'umami' | 'smoky' | 'rich' | 'light' | 'creamy' | 'tangy' | 'fresh' | 'hearty' | 'nutty' )[];
    cuisineTags?: string[];

    portionSize?: 'small' | 'medium' | 'large' | 'sharing';
    avgRating: number;
    ratingsCount : number;
}
