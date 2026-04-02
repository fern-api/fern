import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getPropertyKey, getTextOfTsNode, getWireValue, PackageId, Reference, Zurg } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedExpressInlinedRequestBodySchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        inlinedRequestBody: FernIr.InlinedRequestBody;
        includeSerdeLayer: boolean;
        skipRequestValidation: boolean;
    }
}

export class GeneratedExpressInlinedRequestBodySchemaImpl
    extends AbstractGeneratedSchema<ExpressContext>
    implements GeneratedExpressInlinedRequestBodySchema
{
    private packageId: PackageId;
    private endpoint: FernIr.HttpEndpoint;
    private inlinedRequestBody: FernIr.InlinedRequestBody;
    private includeSerdeLayer: boolean;
    private skipRequestValidation: boolean;

    constructor({
        packageId,
        endpoint,
        inlinedRequestBody,
        includeSerdeLayer,
        skipRequestValidation,
        ...superInit
    }: GeneratedExpressInlinedRequestBodySchemaImpl.Init) {
        super(superInit);
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.inlinedRequestBody = inlinedRequestBody;
        this.includeSerdeLayer = includeSerdeLayer;
        this.skipRequestValidation = skipRequestValidation;
    }

    public writeToFile(context: ExpressContext): void {
        this.writeSchemaToFile(context);
    }

    public deserializeRequest(referenceToRawRequest: ts.Expression, context: ExpressContext): ts.Expression {
        if (!this.includeSerdeLayer) {
            return referenceToRawRequest;
        }
        if (this.skipRequestValidation) {
            return this.getReferenceToZurgSchema(context).parse(referenceToRawRequest, {
                unrecognizedObjectKeys: "passthrough",
                allowUnrecognizedEnumValues: true,
                allowUnrecognizedUnionMembers: true,
                skipValidation: true,
                breadcrumbsPrefix: [],
                omitUndefined: false
            });
        }
        return this.getReferenceToZurgSchema(context).parse(referenceToRawRequest, {
            unrecognizedObjectKeys: "fail",
            allowUnrecognizedEnumValues: false,
            allowUnrecognizedUnionMembers: false,
            skipValidation: false,
            breadcrumbsPrefix: [],
            omitUndefined: false
        });
    }

    protected getReferenceToSchema(context: ExpressContext): Reference {
        return context.expressInlinedRequestBodySchema.getReferenceToInlinedRequestBody(
            this.packageId,
            this.endpoint.name
        );
    }

    protected generateRawTypeDeclaration(context: ExpressContext, module: ModuleDeclaration): void {
        module.addInterface({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            isExported: true,
            properties: this.inlinedRequestBody.properties.map((property) => {
                const type = context.typeSchema.getReferenceToRawType(property.valueType);
                return {
                    name: getPropertyKey(getWireValue(property.name)),
                    type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                    hasQuestionToken: type.isOptional
                };
            }),
            extends: this.inlinedRequestBody.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            )
        });
    }

    protected getReferenceToParsedShape(context: ExpressContext): ts.TypeNode {
        return context.expressInlinedRequestBody
            .getReferenceToInlinedRequestBodyType(this.packageId, this.endpoint.name)
            .getTypeNode();
    }

    protected buildSchema(context: ExpressContext): Zurg.Schema {
        let schema = context.coreUtilities.zurg.object(
            this.inlinedRequestBody.properties.map((property) => ({
                key: {
                    parsed: context.expressInlinedRequestBody
                        .getGeneratedInlinedRequestBody(this.packageId, this.endpoint.name)
                        .getPropertyKey(property, context),
                    raw: getWireValue(property.name)
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType)
            }))
        );

        for (const extension of this.inlinedRequestBody.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension, { isGeneratingSchema: true }));
        }

        return schema;
    }
}
