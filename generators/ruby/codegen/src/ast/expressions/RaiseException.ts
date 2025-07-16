import { Expression } from "./Expression";

export declare namespace RaiseException {
    export type Init = Omit<Expression, "leftSide" | "isAssignment">;
}
export class RaiseException extends Expression {
    constructor(params: RaiseException.Init) {
        super({ leftSide: "raise", isAssignment: false, ...params });
    }
}
