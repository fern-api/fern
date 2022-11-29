import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorContext, GeneratedError } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { GeneratedErrorImpl } from "./GeneratedErrorImpl";

export declare namespace ErrorGenerator {
    export interface Init {
        useBrandedStringAliases: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ErrorGenerator {
    private typeGenerator: TypeGenerator<ErrorContext>;

    constructor({ useBrandedStringAliases }: ErrorGenerator.Init) {
        this.typeGenerator = new TypeGenerator({ useBrandedStringAliases });
    }

    public generateError({
        errorDeclaration,
        errorName,
    }: ErrorGenerator.generateError.Args): GeneratedError | undefined {
        if (errorDeclaration.typeV3 == null) {
            return undefined;
        }
        return new GeneratedErrorImpl({
            errorDeclaration,
            errorName,
            typeGenerator: this.typeGenerator,
        });
    }
}
