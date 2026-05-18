export declare const ComplexType: {
    readonly Object: "object";
    readonly Union: "union";
    readonly Unknown: "unknown";
};
export type ComplexType = (typeof ComplexType)[keyof typeof ComplexType];
