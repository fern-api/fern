import { GeneratedExpressError } from "@fern-typescript/contexts";

import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";

import { GeneratedExpressErrorImpl } from "./GeneratedExpressErrorImpl";

export declare namespace ExpressErrorGenerator {
    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ExpressErrorGenerator {
    public generateError({
        errorDeclaration,
        errorName
    }: ExpressErrorGenerator.generateError.Args): GeneratedExpressError {
        return new GeneratedExpressErrorImpl({
            errorClassName: errorName,
            errorDeclaration
        });
    }
}
