export declare const Status: {
    readonly Known: "Known";
    readonly Unknown: "Unknown";
};
export type Status = (typeof Status)[keyof typeof Status];
