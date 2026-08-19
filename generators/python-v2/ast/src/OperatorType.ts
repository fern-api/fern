export type OperatorType =
    | "or"
    | "and"
    | "add"
    | "subtract"
    | "multiple"
    | "divide"
    | "modulo"
    | "leftShift"
    | "rightShift";

export const OperatorType = {
    Or: "or",
    And: "and",
    Add: "add",
    Subtract: "subtract",
    Multiply: "multiple",
    Divide: "divide",
    Modulo: "modulo",
    LeftShift: "leftShift",
    RightShift: "rightShift"
} as const;
