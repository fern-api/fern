import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { PackageId, Reference, Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressInlinedRequestBodySchema } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { HttpEndpoint, InlinedRequestBody } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedExpressInlinedRequestBodySchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        inlinedRequestBody: InlinedRequestBody;
        includeSerdeLayer: boolean;
        skipRequestValidation: boolean;
    }
}

export class GeneratedExpressInlinedRequestBodySchemaImpl
    extends AbstractGeneratedSchema<ExpressContext>
    implements GeneratedExpressInlinedRequestBodySchema
{
    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private inlinedRequestBody: InlinedRequestBody;
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
                    name: `"${property.name.wireValue}"`,
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
                        .getPropertyKey(property),
                    raw: property.name.wireValue
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
