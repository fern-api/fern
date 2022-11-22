import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedErrorSchema } from "@fern-typescript/sdk-declaration-handler";
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
    private typeSchemaGenerator: TypeSchemaGenerator;

    constructor() {
        this.typeSchemaGenerator = new TypeSchemaGenerator();
    }

    public generateErrorSchema({
        errorDeclaration,
        errorName,
    }: ErrorSchemaGenerator.generateError.Args): GeneratedErrorSchema | undefined {
        if (errorDeclaration.type._type === "alias" && errorDeclaration.type.aliasOf._type === "void") {
            return undefined;
        }
        return new GeneratedErrorSchemaImpl({
            errorDeclaration,
            errorName,
            typeSchemaGenerator: this.typeSchemaGenerator,
        });
    }
}
