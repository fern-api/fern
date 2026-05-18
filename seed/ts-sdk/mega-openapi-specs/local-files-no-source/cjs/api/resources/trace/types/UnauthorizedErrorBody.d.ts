export interface UnauthorizedErrorBody {
    errorName?: UnauthorizedErrorBody.ErrorName | undefined;
}
export declare namespace UnauthorizedErrorBody {
    const ErrorName: {
        readonly UnauthorizedError: "UnauthorizedError";
    };
    type ErrorName = (typeof ErrorName)[keyof typeof ErrorName];
}
