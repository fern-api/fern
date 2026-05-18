import type * as SeedApi from "../../../index.js";
export interface NotFoundErrorBody {
    errorName?: NotFoundErrorBody.ErrorName | undefined;
    content?: SeedApi.trace.PlaylistIdNotFoundErrorBody | undefined;
}
export declare namespace NotFoundErrorBody {
    const ErrorName: {
        readonly PlaylistIdNotFoundError: "PlaylistIdNotFoundError";
    };
    type ErrorName = (typeof ErrorName)[keyof typeof ErrorName];
}
