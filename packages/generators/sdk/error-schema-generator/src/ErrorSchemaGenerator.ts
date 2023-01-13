import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorSchemaContext, GeneratedErrorSchema } from "@fern-typescript/contexts";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { GeneratedErrorSchemaImpl } from "./GeneratedErrorSchemaImpl";

export declare namespace ErrorSchemaGenerator {
    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ErrorSchemaGenerator {
    private typeSchemaGenerator: TypeSchemaGenerator<ErrorSchemaContext>;

    constructor() {
        this.typeSchemaGenerator = new TypeSchemaGenerator();
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
            typeSchemaGenerator: this.typeSchemaGenerator,
        });
    }
}
