export type OperatorType =
    | "or"
    | "and"
    | "add"
    | "subtract"
    | "multiple"
    | "divide"
    | "modulo"
    | "leftShift"
    | "rightShift"
    | "eq"
    | "notEq"
    | "lt"
    | "gt"
    | "ltE"
    | "gtE"
    | "in"
    | "notIn"
    | "is"
    | "isNot";

export const OperatorType = {
    Or: "or",
    And: "and",
    Add: "add",
    Subtract: "subtract",
    Multiply: "multiple",
    Divide: "divide",
    Modulo: "modulo",
    LeftShift: "leftShift",
    RightShift: "rightShift",
    Eq: "eq",
    NotEq: "notEq",
    Lt: "lt",
    Gt: "gt",
    LtE: "ltE",
    GtE: "gtE",
    In: "in",
    NotIn: "notIn",
    Is: "is",
    IsNot: "isNot"
} as const;
