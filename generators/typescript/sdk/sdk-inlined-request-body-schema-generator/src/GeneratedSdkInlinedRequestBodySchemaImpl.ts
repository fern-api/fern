import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { PackageId, Reference, Zurg, getSchemaOptions, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema, SdkContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { HttpEndpoint, InlinedRequestBody, InlinedRequestBodyProperty } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedSdkInlinedRequestBodySchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        inlinedRequestBody: InlinedRequestBody;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
    }
}

export class GeneratedSdkInlinedRequestBodySchemaImpl
    extends AbstractGeneratedSchema<SdkContext>
    implements GeneratedSdkInlinedRequestBodySchema
{
    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private inlinedRequestBody: InlinedRequestBody;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;
    private omitUndefined: boolean;

    constructor({
        packageId,
        endpoint,
        inlinedRequestBody,
        includeSerdeLayer,
        allowExtraFields,
        omitUndefined,
        ...superInit
    }: GeneratedSdkInlinedRequestBodySchemaImpl.Init) {
        super(superInit);
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.inlinedRequestBody = inlinedRequestBody;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.omitUndefined = omitUndefined;
    }

    public writeToFile(context: SdkContext): void {
        this.writeSchemaToFile(context);
    }

    public serializeRequest(referenceToParsedRequest: ts.Expression, context: SdkContext): ts.Expression {
        if (!this.includeSerdeLayer) {
            return referenceToParsedRequest;
        }
        return this.getReferenceToZurgSchema(context).jsonOrThrow(referenceToParsedRequest, {
            ...getSchemaOptions({
                allowExtraFields: this.allowExtraFields ?? this.inlinedRequestBody.extraProperties,
                omitUndefined: this.omitUndefined
            })
        });
    }

    protected getReferenceToSchema(context: SdkContext): Reference {
        return context.sdkInlinedRequestBodySchema.getReferenceToInlinedRequestBody(this.packageId, this.endpoint.name);
    }

    protected generateRawTypeDeclaration(context: SdkContext, module: ModuleDeclaration): void {
        const nonLiteralProperties = this.getAllNonLiteralPropertiesFromInlinedRequest({
            context,
            inlinedRequestBody: this.inlinedRequestBody
        });
        module.addInterface({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            properties: nonLiteralProperties.map((property) => {
                const type = context.typeSchema.getReferenceToRawType(property.valueType);
                return {
                    name: `"${property.name.wireValue}"`,
                    type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                    hasQuestionToken: type.isOptional
                };
            }),
            extends: this.inlinedRequestBody.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            ),
            isExported: true
        });
    }

    protected getReferenceToParsedShape(context: SdkContext): ts.TypeNode {
        const referenceToRequestWrapper = context.requestWrapper.getReferenceToRequestWrapper(
            this.packageId,
            this.endpoint.name
        );
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.packageId,
            this.endpoint.name
        );
        const nonBodyKeys = generatedRequestWrapper.getNonBodyKeys(context);
        if (nonBodyKeys.length === 0) {
            return referenceToRequestWrapper;
        } else {
            return ts.factory.createTypeReferenceNode("Omit", [
                referenceToRequestWrapper,
                ts.factory.createUnionTypeNode(
                    nonBodyKeys.map((nonBodyKey) =>
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(nonBodyKey.propertyName))
                    )
                )
            ]);
        }
    }

    protected buildSchema(context: SdkContext): Zurg.Schema {
        const nonLiteralProperties = this.getAllNonLiteralPropertiesFromInlinedRequest({
            context,
            inlinedRequestBody: this.inlinedRequestBody
        });
        let schema = context.coreUtilities.zurg.object(
            nonLiteralProperties.map((property) => ({
                key: {
                    parsed: context.requestWrapper
                        .getGeneratedRequestWrapper(this.packageId, this.endpoint.name)
                        .getInlinedRequestBodyPropertyKey(property),
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

    private getAllNonLiteralPropertiesFromInlinedRequest({
        context,
        inlinedRequestBody
    }: {
        context: SdkContext;
        inlinedRequestBody: InlinedRequestBody;
    }): InlinedRequestBodyProperty[] {
        return inlinedRequestBody.properties.filter((property) => {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            const isLiteral = resolvedType.type === "container" && resolvedType.container.type === "literal";
            return !isLiteral;
        });
    }
}
