import { assertNever } from "@fern-api/core-utils";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { ErrorSchemaContext, GeneratedErrorSchema } from "@fern-typescript/contexts";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { GeneratedAliasTypeSchemaImpl } from "@fern-typescript/type-schema-generator";

export declare namespace GeneratedErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        errorGenerator: ErrorGenerator;
    }
}

export class GeneratedErrorSchemaImpl
    extends GeneratedAliasTypeSchemaImpl<ErrorSchemaContext>
    implements GeneratedErrorSchema
{
    constructor({ errorName, errorDeclaration, type, errorGenerator }: GeneratedErrorSchemaImpl.Init) {
        super({
            typeName: errorName,
            shape: type,
            getGeneratedType: () => {
                const generatedError = errorGenerator.generateError({ errorName, errorDeclaration });
                if (generatedError == null) {
                    throw new Error("Error was not generated");
                }
                return generatedError.generateErrorBody();
            },
            getReferenceToGeneratedType: (context) => {
                const generatedError = errorGenerator.generateError({ errorName, errorDeclaration });
                if (generatedError == null) {
                    throw new Error("Error was not generated");
                }
                switch (generatedError.type) {
                    case "class":
                        return context.type.getReferenceToType(type).typeNode;
                    case "type":
                        return context.error.getReferenceToError(errorDeclaration.name).getTypeNode();
                    default:
                        assertNever(generatedError);
                }
            },
            getReferenceToGeneratedTypeSchema: (context) =>
                context.errorSchema.getReferenceToErrorSchema(errorDeclaration.name),
        });
    }
}
