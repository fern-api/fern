export declare const BasicType: {
    readonly Primitive: "primitive";
    readonly Literal: "literal";
};
export type BasicType = (typeof BasicType)[keyof typeof BasicType];
