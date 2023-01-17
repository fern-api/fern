import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorContext, GeneratedError } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { GeneratedErrorClassImpl } from "./GeneratedErrorClassImpl";
import { GeneratedErrorTypeImpl } from "./GeneratedErrorTypeImpl";
import { GeneratedNoBodyErrorClassImpl } from "./GeneratedNoBodyErrorClassImpl";

export declare namespace ErrorGenerator {
    export interface Init {
        useBrandedStringAliases: boolean;
        neverThrowErrors: boolean;
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
    private neverThrowErrors: boolean;

    constructor({ useBrandedStringAliases, neverThrowErrors }: ErrorGenerator.Init) {
        this.typeGenerator = new TypeGenerator({ useBrandedStringAliases });
        this.neverThrowErrors = neverThrowErrors;
    }

    public generateError({
        errorDeclaration,
        errorName,
    }: ErrorGenerator.generateError.Args): GeneratedError | undefined {
        if (!this.neverThrowErrors) {
            return errorDeclaration.type != null
                ? new GeneratedErrorClassImpl({
                      errorClassName: errorName,
                      errorDeclaration,
                      type: errorDeclaration.type,
                      typeGenerator: this.typeGenerator,
                  })
                : new GeneratedNoBodyErrorClassImpl({ errorClassName: errorName, errorDeclaration });
        }
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedErrorTypeImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            typeGenerator: this.typeGenerator,
        });
    }
}
