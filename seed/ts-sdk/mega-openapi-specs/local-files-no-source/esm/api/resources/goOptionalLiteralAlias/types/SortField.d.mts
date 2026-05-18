/** A sort field that only allows the value "DEFAULT" */
export declare const SortField: {
    readonly Default: "DEFAULT";
};
export type SortField = (typeof SortField)[keyof typeof SortField];
