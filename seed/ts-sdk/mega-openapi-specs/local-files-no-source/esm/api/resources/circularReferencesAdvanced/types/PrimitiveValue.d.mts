export declare const PrimitiveValue: {
    readonly String: "STRING";
    readonly Number: "NUMBER";
};
export type PrimitiveValue = (typeof PrimitiveValue)[keyof typeof PrimitiveValue];
