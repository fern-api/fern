import type * as SeedApi from "../../../index.js";
export interface BadRequestErrorBody {
    errorName?: BadRequestErrorBody.ErrorName | undefined;
    content?: SeedApi.errorProperty.PropertyBasedErrorTestBody | undefined;
}
export declare namespace BadRequestErrorBody {
    const ErrorName: {
        readonly PropertyBasedErrorTest: "PropertyBasedErrorTest";
    };
    type ErrorName = (typeof ErrorName)[keyof typeof ErrorName];
}
