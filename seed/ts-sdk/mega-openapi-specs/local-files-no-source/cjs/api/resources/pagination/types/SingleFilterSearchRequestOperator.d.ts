export declare const SingleFilterSearchRequestOperator: {
    readonly EqualTo: "=";
    readonly NotEquals: "!=";
    readonly In: "IN";
    readonly Nin: "NIN";
    readonly LessThan: "<";
    readonly GreaterThan: ">";
    readonly "": "~";
};
export type SingleFilterSearchRequestOperator = (typeof SingleFilterSearchRequestOperator)[keyof typeof SingleFilterSearchRequestOperator];
