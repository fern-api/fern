import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedSdkError, SdkErrorContext } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
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
            return new GeneratedSdkErrorClassImpl({
                errorClassName: errorName,
                errorDeclaration,
                typeGenerator: this.typeGenerator,
            });
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
