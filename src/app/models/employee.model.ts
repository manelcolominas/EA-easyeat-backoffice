export interface IEmployee {
    _id?: string;
    restaurant_id: string;
    profile: {
        name: string;
        email?: string;
        phone?: string;
        passwordHash: string;
        role: string;
    };
    active: boolean;
}
