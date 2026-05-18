/**
 * Tests enum name and value can be
 * different.
 */
export declare const Operand: {
    readonly GreaterThan: ">";
    readonly EqualTo: "=";
    readonly LessThan: "less_than";
};
export type Operand = (typeof Operand)[keyof typeof Operand];
