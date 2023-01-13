import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ResolvedTypeReference, Type, TypeReference } from "@fern-fern/ir-model/types";
import { ErrorSchemaContext, GeneratedErrorSchema, GeneratedTypeSchema } from "@fern-typescript/contexts";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { ts } from "ts-morph";

export declare namespace GeneratedErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        typeSchemaGenerator: TypeSchemaGenerator<ErrorSchemaContext>;
    }
}

export class GeneratedErrorSchemaImpl implements GeneratedErrorSchema {
    private errorName: string;
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;
    private typeSchemaGenerator: TypeSchemaGenerator<ErrorSchemaContext>;

    constructor({ errorName, errorDeclaration, type, typeSchemaGenerator }: GeneratedErrorSchemaImpl.Init) {
        this.errorName = errorName;
        this.errorDeclaration = errorDeclaration;
        this.type = type;
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
            shape: Type.alias({
                aliasOf: this.type,
                // TODO do we need a real value for this?
                resolvedType: ResolvedTypeReference.unknown(),
            }),
            getGeneratedType: () => generatedError.getAsGeneratedType(),
            getReferenceToGeneratedType: () => context.error.getReferenceToError(this.errorDeclaration.name),
            getReferenceToGeneratedTypeSchema: (context) =>
                context.errorSchema.getReferenceToErrorSchema(this.errorDeclaration.name),
        });
    }
}
