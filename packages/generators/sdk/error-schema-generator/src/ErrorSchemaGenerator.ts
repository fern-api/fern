import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedErrorSchema } from "@fern-typescript/contexts";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { GeneratedErrorSchemaImpl } from "./GeneratedErrorSchemaImpl";

export declare namespace ErrorSchemaGenerator {
    export interface Init {
        errorGenerator: ErrorGenerator;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ErrorSchemaGenerator {
    private errorGenerator: ErrorGenerator;

    constructor({ errorGenerator }: ErrorSchemaGenerator.Init) {
        this.errorGenerator = errorGenerator;
    }

    public generateErrorSchema({
        errorDeclaration,
        errorName,
    }: ErrorSchemaGenerator.generateError.Args): GeneratedErrorSchema | undefined {
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedErrorSchemaImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            errorGenerator: this.errorGenerator,
        });
    }
}
