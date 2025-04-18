import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Reference, Zurg, getSchemaOptions, getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressErrorSchema } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { ErrorDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedExpressErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
    }
}

export class GeneratedExpressErrorSchemaImpl
    extends AbstractGeneratedSchema<ExpressContext>
    implements GeneratedExpressErrorSchema
{
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;

    constructor({
        errorName,
        errorDeclaration,
        type,
        includeSerdeLayer,
        allowExtraFields
    }: GeneratedExpressErrorSchemaImpl.Init) {
        super({ typeName: errorName });
        this.errorDeclaration = errorDeclaration;
        this.type = type;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
    }

    public writeToFile(context: ExpressContext): void {
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

    public serializeBody(
        context: ExpressContext,
        { referenceToBody }: { referenceToBody: ts.Expression }
    ): ts.Expression {
        if (!this.includeSerdeLayer) {
            return referenceToBody;
        }

        switch (this.type.type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.type, { isGeneratingSchema: false })
                    .jsonOrThrow(referenceToBody, {
                        ...getSchemaOptions({
                            allowExtraFields: this.allowExtraFields,
                            omitUndefined: false
                        })
                    });
            case "unknown":
                return referenceToBody;
            case "primitive":
            case "container":
                return this.getReferenceToZurgSchema(context).jsonOrThrow(referenceToBody, {
                    ...getSchemaOptions({
                        allowExtraFields: this.allowExtraFields,
                        omitUndefined: false
                    })
                });
            default:
                assertNever(this.type);
        }
    }

    protected getReferenceToSchema(context: ExpressContext): Reference {
        return context.expressErrorSchema.getReferenceToExpressErrorSchema(this.errorDeclaration.name);
    }

    protected generateRawTypeDeclaration(context: ExpressContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
            isExported: true
        });
    }

    protected getReferenceToParsedShape(context: ExpressContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: ExpressContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }
}
