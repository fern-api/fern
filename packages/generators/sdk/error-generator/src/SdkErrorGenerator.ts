import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedSdkError, SdkErrorContext } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { GeneratedNoBodySdkErrorClassImpl } from "./GeneratedNoBodySdkErrorClassImpl";
import { GeneratedSdkErrorClassImpl } from "./GeneratedSdkErrorClassImpl";
import { GeneratedSdkErrorTypeImpl } from "./GeneratedSdkErrorTypeImpl";

export declare namespace SdkErrorGenerator {
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

export class SdkErrorGenerator {
    private typeGenerator: TypeGenerator<SdkErrorContext>;
    private neverThrowErrors: boolean;

    constructor({ useBrandedStringAliases, neverThrowErrors }: SdkErrorGenerator.Init) {
        this.typeGenerator = new TypeGenerator({ useBrandedStringAliases });
        this.neverThrowErrors = neverThrowErrors;
    }

    public generateError({
        errorDeclaration,
        errorName,
    }: SdkErrorGenerator.generateError.Args): GeneratedSdkError | undefined {
        if (!this.neverThrowErrors) {
            return errorDeclaration.type != null
                ? new GeneratedSdkErrorClassImpl({
                      errorClassName: errorName,
                      errorDeclaration,
                      type: errorDeclaration.type,
                      typeGenerator: this.typeGenerator,
                  })
                : new GeneratedNoBodySdkErrorClassImpl({ errorClassName: errorName, errorDeclaration });
        }
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedSdkErrorTypeImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            typeGenerator: this.typeGenerator,
        });
    }
}
