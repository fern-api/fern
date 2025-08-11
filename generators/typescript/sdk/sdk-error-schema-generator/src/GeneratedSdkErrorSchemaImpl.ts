import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Reference, Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkErrorSchema, SdkContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { ErrorDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedSdkErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        skipValidation: boolean;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedSdkErrorSchemaImpl
    extends AbstractGeneratedSchema<SdkContext>
    implements GeneratedSdkErrorSchema
{
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;
    private skipValidation: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        errorName,
        errorDeclaration,
        type,
        skipValidation,
        includeSerdeLayer
    }: GeneratedSdkErrorSchemaImpl.Init) {
        super({ typeName: errorName });
        this.errorDeclaration = errorDeclaration;
        this.type = type;
        this.skipValidation = skipValidation;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public writeToFile(context: SdkContext): void {
        // named errors are not generated - consumers should
        // (de)serialize the named type directly.
        // unknown request bodies don't need to be serialized.
        switch (this.type.type) {
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
        context: SdkContext,
        { referenceToBody }: { referenceToBody: ts.Expression }
    ): ts.Expression {
        if (!this.includeSerdeLayer) {
            return ts.factory.createAsExpression(referenceToBody, context.type.getReferenceToType(this.type).typeNode);
        }
        switch (this.type.type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.type, { isGeneratingSchema: false })
                    .parseOrThrow(referenceToBody, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipValidation,
                        breadcrumbsPrefix: ["response"],
                        omitUndefined: false
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
                    omitUndefined: false
                });
            default:
                assertNever(this.type);
        }
    }

    protected getReferenceToSchema(context: SdkContext): Reference {
        return context.sdkErrorSchema.getReferenceToSdkErrorSchema(this.errorDeclaration.name);
    }

    protected generateRawTypeDeclaration(context: SdkContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
            isExported: true
        });
    }

    protected getReferenceToParsedShape(context: SdkContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: SdkContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }
}
