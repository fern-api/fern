export interface Level1Level2Address {
    line1: string;
    line2?: (string | null) | undefined;
    city: string;
    state: string;
    zip: string;
    country: Level1Level2Address.Country;
}
export declare namespace Level1Level2Address {
    const Country: {
        readonly Usa: "USA";
    };
    type Country = (typeof Country)[keyof typeof Country];
}
