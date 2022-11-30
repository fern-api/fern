import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorSchemaContext, GeneratedErrorSchema } from "@fern-typescript/sdk-declaration-handler";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";

export declare namespace GeneratedErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        typeSchemaGenerator: TypeSchemaGenerator<ErrorSchemaContext>;
    }
}

export class GeneratedErrorSchemaImpl implements GeneratedErrorSchema {
    private errorName: string;
    private errorDeclaration: ErrorDeclaration;
    private typeSchemaGenerator: TypeSchemaGenerator<ErrorSchemaContext>;

    constructor({ errorName, errorDeclaration, typeSchemaGenerator }: GeneratedErrorSchemaImpl.Init) {
        this.errorName = errorName;
        this.errorDeclaration = errorDeclaration;
        this.typeSchemaGenerator = typeSchemaGenerator;
    }

    public writeToFile(context: ErrorSchemaContext): void {
        const generatedError = context.error.getGeneratedError(this.errorDeclaration.name);
        if (generatedError == null) {
            throw new Error("Error was not generated");
        }
        this.typeSchemaGenerator
            .generateTypeSchema({
                typeName: this.errorName,
                shape: this.errorDeclaration.type,
                getGeneratedType: () => generatedError.getAsGeneratedType(),
                getReferenceToGeneratedType: () => context.error.getReferenceToError(this.errorDeclaration.name),
            })
            .writeToFile(context);
    }
}
