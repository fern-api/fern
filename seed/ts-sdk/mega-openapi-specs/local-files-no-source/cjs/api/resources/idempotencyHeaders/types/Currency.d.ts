export declare const Currency: {
    readonly Usd: "USD";
    readonly Yen: "YEN";
};
export type Currency = (typeof Currency)[keyof typeof Currency];
