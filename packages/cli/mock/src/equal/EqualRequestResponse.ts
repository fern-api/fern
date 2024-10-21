export type EqualResponse = IsEqual | NotEqual;

export interface IsEqual {
    type: "equal";
}

export interface NotEqual {
    type: "notEqual";
    location: "header" | "query" | "path" | "body";
    parameter: string[];
    actualValue: unknown;
    expectedValue: unknown;
}
