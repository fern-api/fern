import type * as SeedApi from "../../../index.js";
export interface CreateProblemError extends SeedApi.trace.GenericCreateProblemError {
    _type: CreateProblemError.Type;
}
export declare namespace CreateProblemError {
    const Type: {
        readonly Generic: "generic";
    };
    type Type = (typeof Type)[keyof typeof Type];
}
