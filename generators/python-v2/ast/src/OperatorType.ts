export type OperatorType = "or" | "and" | "leftShift" | "rightShift";

export const OperatorType = {
    Or: "or",
    And: "and",
    LeftShift: "leftShift",
    RightShift: "rightShift"
} as const;
