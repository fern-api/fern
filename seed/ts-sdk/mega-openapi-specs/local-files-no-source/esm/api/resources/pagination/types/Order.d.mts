export declare const Order: {
    readonly Asc: "asc";
    readonly Desc: "desc";
};
export type Order = (typeof Order)[keyof typeof Order];
