import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorSchemaContext, GeneratedErrorSchema } from "@fern-typescript/sdk-declaration-handler";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { TypeSchemaContextImpl } from "./TypeSchemaContextImpl";

export declare namespace GeneratedErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        typeSchemaGenerator: TypeSchemaGenerator;
    }
}

export class GeneratedErrorSchemaImpl implements GeneratedErrorSchema {
    private errorName: string;
    private typeSchemaGenerator: TypeSchemaGenerator;

    constructor({ errorName, typeSchemaGenerator }: GeneratedErrorSchemaImpl.Init) {
        this.errorName = errorName;
        this.typeSchemaGenerator = typeSchemaGenerator;
    }

    public writeToFile(context: ErrorSchemaContext): void {
        const generatedError = context.getErrorBeingGenerated();
        this.typeSchemaGenerator
            .generateTypeSchema({
                typeName: this.errorName,
                typeDeclaration: generatedError.getEquivalentTypeDeclaration(),
            })
            .writeToFile(new TypeSchemaContextImpl({ errorSchemaContext: context }));
    }
}
