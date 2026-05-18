export declare const Shape: {
    readonly Square: "SQUARE";
    readonly Circle: "CIRCLE";
    readonly Triangle: "TRIANGLE";
};
export type Shape = (typeof Shape)[keyof typeof Shape];
