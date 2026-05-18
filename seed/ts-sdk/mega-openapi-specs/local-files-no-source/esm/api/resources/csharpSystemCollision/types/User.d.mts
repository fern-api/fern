export interface User {
    line1: string;
    line2?: (string | null) | undefined;
    city: string;
    state: string;
    zip: string;
    country: User.Country;
}
export declare namespace User {
    const Country: {
        readonly Usa: "USA";
    };
    type Country = (typeof Country)[keyof typeof Country];
}
