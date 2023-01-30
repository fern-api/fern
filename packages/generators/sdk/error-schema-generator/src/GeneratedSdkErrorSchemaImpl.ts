import { assertNever } from "@fern-api/core-utils";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { GeneratedSdkErrorSchema, SdkErrorSchemaContext } from "@fern-typescript/contexts";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { GeneratedAliasTypeSchemaImpl } from "@fern-typescript/type-schema-generator";
import { ts } from "ts-morph";

export declare namespace GeneratedSdkErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        sdkErrorGenerator: SdkErrorGenerator;
    }
}

export class GeneratedSdkErrorSchemaImpl implements GeneratedSdkErrorSchema {
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;
    private generatedAliasSchema: GeneratedAliasTypeSchemaImpl<SdkErrorSchemaContext> | undefined;

    constructor({ errorName, errorDeclaration, type, sdkErrorGenerator }: GeneratedSdkErrorSchemaImpl.Init) {
        this.errorDeclaration = errorDeclaration;
        this.type = type;

        // named errors are not generated - consumers should
        // (de)serialize the named type directly.
        // unknown request bodies don't need to be serialized.
        switch (type._type) {
            case "named":
            case "unknown":
                break;
            case "container":
            case "primitive":
                this.generatedAliasSchema = new GeneratedAliasTypeSchemaImpl<SdkErrorSchemaContext>({
                    typeName: errorName,
                    shape: type,
                    getGeneratedType: () => {
                        const generatedSdkError = sdkErrorGenerator.generateError({ errorName, errorDeclaration });
                        if (generatedSdkError == null) {
                            throw new Error("Error was not generated");
                        }
                        return generatedSdkError.generateErrorBody();
                    },
                    getReferenceToGeneratedType: (context) => {
                        const GeneratedSdkError = sdkErrorGenerator.generateError({ errorName, errorDeclaration });
                        if (GeneratedSdkError == null) {
                            throw new Error("Error was not generated");
                        }
                        switch (GeneratedSdkError.type) {
                            case "class":
                                return context.type.getReferenceToType(type).typeNode;
                            case "type":
                                return context.sdkError.getReferenceToError(errorDeclaration.name).getTypeNode();
                            default:
                                assertNever(GeneratedSdkError);
                        }
                    },
                    getReferenceToGeneratedTypeSchema: (context) =>
                        context.sdkErrorSchema.getReferenceToSdkErrorSchema(errorDeclaration.name),
                });
                break;
            default:
                assertNever(type);
        }
    }

    public writeToFile(context: SdkErrorSchemaContext): void {
        this.generatedAliasSchema?.writeToFile(context);
    }

    public deserializeBody(
        context: SdkErrorSchemaContext,
        { referenceToBody }: { referenceToBody: ts.Expression }
    ): ts.Expression {
        switch (this.type._type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.type, { isGeneratingSchema: false })
                    .parse(
                        ts.factory.createAsExpression(
                            referenceToBody,
                            context.typeSchema.getReferenceToRawNamedType(this.type).getTypeNode()
                        )
                    );
            case "unknown":
                return referenceToBody;
            case "primitive":
            case "container":
                if (this.generatedAliasSchema == null) {
                    throw new Error("Cannot get reference to raw shape because generated alias schema does not exist.");
                }
                return context.sdkErrorSchema
                    .getSchemaOfError(this.errorDeclaration.name)
                    .parse(
                        ts.factory.createAsExpression(
                            referenceToBody,
                            this.generatedAliasSchema.getReferenceToRawShape(context)
                        )
                    );
            default:
                assertNever(this.type);
        }
    }
}
