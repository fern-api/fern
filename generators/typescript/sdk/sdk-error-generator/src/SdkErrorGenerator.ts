import { GeneratedSdkError } from "@fern-typescript/contexts";

import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkErrorClassImpl } from "./GeneratedSdkErrorClassImpl";

export declare namespace SdkErrorGenerator {
    export interface Init {
        neverThrowErrors: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class SdkErrorGenerator {
    private neverThrowErrors: boolean;

    constructor({ neverThrowErrors }: SdkErrorGenerator.Init) {
        this.neverThrowErrors = neverThrowErrors;
    }

    public generateError({
        errorDeclaration,
        errorName
    }: SdkErrorGenerator.generateError.Args): GeneratedSdkError | undefined {
        if (this.neverThrowErrors) {
            return undefined;
        }

        return new GeneratedSdkErrorClassImpl({
            errorClassName: errorName,
            errorDeclaration
        });
    }
}
