export declare const OpenEnumType: {
    readonly OptionA: "OPTION_A";
    readonly OptionB: "OPTION_B";
    readonly OptionC: "OPTION_C";
};
export type OpenEnumType = (typeof OpenEnumType)[keyof typeof OpenEnumType];
