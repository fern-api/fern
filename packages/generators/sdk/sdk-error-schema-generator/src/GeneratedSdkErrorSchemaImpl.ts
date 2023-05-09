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
        skipValidation: boolean;
    }
}

export class GeneratedSdkErrorSchemaImpl
    extends AbstractGeneratedSchema<SdkErrorSchemaContext>
    implements GeneratedSdkErrorSchema
{
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;
    private skipValidation: boolean;

    constructor({ errorName, errorDeclaration, type, skipValidation }: GeneratedSdkErrorSchemaImpl.Init) {
        super({ typeName: errorName });
        this.errorDeclaration = errorDeclaration;
        this.type = type;
        this.skipValidation = skipValidation;
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
                    .parseOrThrow(referenceToBody, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipValidation,
                        breadcrumbsPrefix: ["response"],
                    });
            case "unknown":
                return referenceToBody;
            case "primitive":
            case "container":
                return this.getReferenceToZurgSchema(context).parseOrThrow(referenceToBody, {
                    allowUnrecognizedEnumValues: true,
                    allowUnrecognizedUnionMembers: true,
                    unrecognizedObjectKeys: "passthrough",
                    skipValidation: this.skipValidation,
                    breadcrumbsPrefix: ["response"],
                });
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
