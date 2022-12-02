import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import {
    ErrorSchemaContext,
    GeneratedErrorSchema,
    GeneratedTypeSchema,
} from "@fern-typescript/sdk-declaration-handler";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { ts } from "ts-morph";

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
        return this.getGeneratedTypeSchema(context).writeToFile(context);
    }

    public getReferenceToRawShape(context: ErrorSchemaContext): ts.TypeNode {
        return this.getGeneratedTypeSchema(context).getReferenceToRawShape(context);
    }

    private getGeneratedTypeSchema(context: ErrorSchemaContext): GeneratedTypeSchema<ErrorSchemaContext> {
        const generatedError = context.error.getGeneratedError(this.errorDeclaration.name);
        if (generatedError == null) {
            throw new Error("Error was not generated");
        }
        return this.typeSchemaGenerator.generateTypeSchema({
            typeName: this.errorName,
            shape: this.errorDeclaration.type,
            getGeneratedType: () => generatedError.getAsGeneratedType(),
            getReferenceToGeneratedType: () => context.error.getReferenceToError(this.errorDeclaration.name),
            getReferenceToGeneratedTypeSchema: (context) =>
                context.errorSchema.getReferenceToErrorSchema(this.errorDeclaration.name),
        });
    }
}
