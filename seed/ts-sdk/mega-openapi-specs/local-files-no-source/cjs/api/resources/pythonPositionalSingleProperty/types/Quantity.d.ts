export interface Quantity {
    quantity: number;
    type: Quantity.Type;
}
export declare namespace Quantity {
    const Type: {
        readonly Quantity: "QUANTITY";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
