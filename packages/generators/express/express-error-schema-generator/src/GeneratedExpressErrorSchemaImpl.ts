import { assertNever } from "@fern-api/core-utils";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode, Reference, Zurg } from "@fern-typescript/commons";
import { ExpressErrorSchemaContext, GeneratedExpressErrorSchema } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedExpressErrorSchemaImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
    }
}

export class GeneratedExpressErrorSchemaImpl
    extends AbstractGeneratedSchema<ExpressErrorSchemaContext>
    implements GeneratedExpressErrorSchema
{
    private errorDeclaration: ErrorDeclaration;
    private type: TypeReference;

    constructor({ errorName, errorDeclaration, type }: GeneratedExpressErrorSchemaImpl.Init) {
        super({ typeName: errorName });
        this.errorDeclaration = errorDeclaration;
        this.type = type;
    }

    public writeToFile(context: ExpressErrorSchemaContext): void {
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

    public serializeBody(
        context: ExpressErrorSchemaContext,
        { referenceToBody }: { referenceToBody: ts.Expression }
    ): ts.Expression {
        switch (this.type._type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.type, { isGeneratingSchema: false })
                    .jsonOrThrow(referenceToBody, {
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        unrecognizedObjectKeys: "strip",
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                    });
            case "unknown":
                return referenceToBody;
            case "primitive":
            case "container":
                return this.getReferenceToZurgSchema(context).jsonOrThrow(referenceToBody, {
                    allowUnrecognizedEnumValues: false,
                    allowUnrecognizedUnionMembers: false,
                    unrecognizedObjectKeys: "strip",
                    skipValidation: false,
                    breadcrumbsPrefix: [],
                });
            default:
                assertNever(this.type);
        }
    }

    protected getReferenceToSchema(context: ExpressErrorSchemaContext): Reference {
        return context.expressErrorSchema.getReferenceToExpressErrorSchema(this.errorDeclaration.name);
    }

    protected generateRawTypeDeclaration(context: ExpressErrorSchemaContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
        });
    }

    protected getReferenceToParsedShape(context: ExpressErrorSchemaContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: ExpressErrorSchemaContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }
}
