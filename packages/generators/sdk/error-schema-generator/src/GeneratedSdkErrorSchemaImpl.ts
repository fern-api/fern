import { assertNever } from "@fern-api/core-utils";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { GeneratedSdkErrorSchema, SdkErrorSchemaContext } from "@fern-typescript/contexts";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { GeneratedAliasTypeSchemaImpl } from "@fern-typescript/type-schema-generator";

export declare namespace GeneratedSdkErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        SdkErrorGenerator: SdkErrorGenerator;
    }
}

export class GeneratedSdkErrorSchemaImpl
    extends GeneratedAliasTypeSchemaImpl<SdkErrorSchemaContext>
    implements GeneratedSdkErrorSchema
{
    constructor({ errorName, errorDeclaration, type, SdkErrorGenerator }: GeneratedSdkErrorSchemaImpl.Init) {
        super({
            typeName: errorName,
            shape: type,
            getGeneratedType: () => {
                const generatedSdkError = SdkErrorGenerator.generateError({ errorName, errorDeclaration });
                if (generatedSdkError == null) {
                    throw new Error("Error was not generated");
                }
                return generatedSdkError.generateErrorBody();
            },
            getReferenceToGeneratedType: (context) => {
                const GeneratedSdkError = SdkErrorGenerator.generateError({ errorName, errorDeclaration });
                if (GeneratedSdkError == null) {
                    throw new Error("Error was not generated");
                }
                switch (GeneratedSdkError.type) {
                    case "class":
                        return context.type.getReferenceToType(type).typeNode;
                    case "type":
                        return context.error.getReferenceToError(errorDeclaration.name).getTypeNode();
                    default:
                        assertNever(GeneratedSdkError);
                }
            },
            getReferenceToGeneratedTypeSchema: (context) =>
                context.sdkErrorSchema.getReferenceToSdkErrorSchema(errorDeclaration.name),
        });
    }
}
