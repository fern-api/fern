import { assertNever } from "@fern-api/core-utils";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode, Reference, Zurg } from "@fern-typescript/commons";
import { GeneratedSdkErrorSchema, SdkErrorSchemaContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedSdkErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
    }
}

export class GeneratedSdkErrorSchemaImpl
    extends AbstractGeneratedSchema<SdkErrorSchemaContext>
    implements GeneratedSdkErrorSchema
{
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;

    constructor({ errorName, errorDeclaration, type }: GeneratedSdkErrorSchemaImpl.Init) {
        super({ typeName: errorName });
        this.errorDeclaration = errorDeclaration;
        this.type = type;
    }

    public writeToFile(context: SdkErrorSchemaContext): void {
        // named errors are not generated - consumers should
        // (de)serialize the named type directly.
        // unknown request bodies don't need to be serialized.
        switch (this.type._type) {
            case "primitive":
            case "container":
                this.writeSchemaToFile(context);
                break;
            // named requests bodies are not generated - consumers should
            // (de)serialize the named type directly.
            // unknown request bodies don't need to be serialized.
            case "named":
            case "unknown":
                break;
            default:
                assertNever(this.type);
        }
    }

    public deserializeBody(
        context: SdkErrorSchemaContext,
        { referenceToBody }: { referenceToBody: ts.Expression }
    ): ts.Expression {
        switch (this.type._type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.type, { isGeneratingSchema: false })
                    .parseOrThrow(
                        ts.factory.createAsExpression(
                            referenceToBody,
                            context.typeSchema.getReferenceToRawNamedType(this.type).getTypeNode()
                        ),
                        {
                            allowUnknownKeys: true,
                        }
                    );
            case "unknown":
                return referenceToBody;
            case "primitive":
            case "container":
                return this.getReferenceToZurgSchema(context).parseOrThrow(
                    ts.factory.createAsExpression(referenceToBody, this.getReferenceToRawShape(context))
                );
            default:
                assertNever(this.type);
        }
    }

    protected getReferenceToSchema(context: SdkErrorSchemaContext): Reference {
        return context.sdkErrorSchema.getReferenceToSdkErrorSchema(this.errorDeclaration.name);
    }

    protected generateRawTypeDeclaration(context: SdkErrorSchemaContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
        });
    }

    protected getReferenceToParsedShape(context: SdkErrorSchemaContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: SdkErrorSchemaContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }
}
