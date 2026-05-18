export interface Level1Address {
    line1: string;
    line2?: (string | null) | undefined;
    city: string;
    state: string;
    zip: string;
    country: Level1Address.Country;
}
export declare namespace Level1Address {
    const Country: {
        readonly Usa: "USA";
    };
    type Country = (typeof Country)[keyof typeof Country];
}
