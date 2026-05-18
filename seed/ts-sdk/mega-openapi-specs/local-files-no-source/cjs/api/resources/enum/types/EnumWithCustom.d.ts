export declare const EnumWithCustom: {
    readonly Safe: "safe";
    readonly Custom: "Custom";
};
export type EnumWithCustom = (typeof EnumWithCustom)[keyof typeof EnumWithCustom];
