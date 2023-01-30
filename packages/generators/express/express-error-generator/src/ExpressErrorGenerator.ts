import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ExpressErrorContext, GeneratedExpressError } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { GeneratedExpressErrorImpl } from "./GeneratedExpressErrorImpl";

export declare namespace ExpressErrorGenerator {
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

export class ExpressErrorGenerator {
    private typeGenerator: TypeGenerator<ExpressErrorContext>;

    constructor({ useBrandedStringAliases }: ExpressErrorGenerator.Init) {
        this.typeGenerator = new TypeGenerator({ useBrandedStringAliases });
    }

    public generateError({
        errorDeclaration,
        errorName,
    }: ExpressErrorGenerator.generateError.Args): GeneratedExpressError {
        return new GeneratedExpressErrorImpl({
            errorClassName: errorName,
            errorDeclaration,
            typeGenerator: this.typeGenerator,
        });
    }
}
