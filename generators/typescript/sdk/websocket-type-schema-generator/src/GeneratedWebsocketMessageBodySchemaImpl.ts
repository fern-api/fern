import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { PackageId, Reference, Zurg, getSchemaOptions, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema, SdkContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { InlinedRequestBodyProperty, InlinedWebSocketMessageBody, WebSocketChannel } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedWebsocketMessageBodySchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        channel: WebSocketChannel;
        messageBody: InlinedWebSocketMessageBody;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
    }
}

export class GeneratedWebsocketMessageBodySchemaImpl
    extends AbstractGeneratedSchema<SdkContext>
    implements GeneratedSdkInlinedRequestBodySchema
{
    private packageId: PackageId;
    private channel: WebSocketChannel;
    private messageBody: InlinedWebSocketMessageBody;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;
    private omitUndefined: boolean;

    constructor({
        packageId,
        channel,
        messageBody,
        includeSerdeLayer,
        allowExtraFields,
        omitUndefined,
        ...superInit
    }: GeneratedWebsocketMessageBodySchemaImpl.Init) {
        super(superInit);
        this.packageId = packageId;
        this.channel = channel;
        this.messageBody = messageBody;
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
                allowExtraFields: false,
                omitUndefined: this.omitUndefined
            })
        });
    }

    protected getReferenceToSchema(context: SdkContext): Reference {
        return context.sdkInlinedRequestBodySchema.getReferenceToInlinedRequestBody(this.packageId, this.channel.name);
    }

    protected generateRawTypeDeclaration(context: SdkContext, module: ModuleDeclaration): void {
        const nonLiteralProperties = this.getAllNonLiteralPropertiesFromInlinedRequest({
            context,
            inlinedRequestBody: this.messageBody
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
            extends: this.messageBody.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            ),
            isExported: true
        });
    }

    protected getReferenceToParsedShape(context: SdkContext): ts.TypeNode {
        const referenceToRequestWrapper = context.requestWrapper.getReferenceToRequestWrapper(
            this.packageId,
            this.channel.name
        );
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.packageId,
            this.channel.name
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
            inlinedRequestBody: this.messageBody
        });
        let schema = context.coreUtilities.zurg.object(
            nonLiteralProperties.map((property) => ({
                key: {
                    parsed: context.requestWrapper
                        .getGeneratedRequestWrapper(this.packageId, this.channel.name)
                        .getInlinedRequestBodyPropertyKey(property),
                    raw: property.name.wireValue
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType)
            }))
        );

        for (const extension of this.messageBody.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension, { isGeneratingSchema: true }));
        }

        return schema;
    }

    private getAllNonLiteralPropertiesFromInlinedRequest({
        context,
        inlinedRequestBody
    }: {
        context: SdkContext;
        inlinedRequestBody: InlinedWebSocketMessageBody;
    }): InlinedRequestBodyProperty[] {
        return inlinedRequestBody.properties.filter((property) => {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            const isLiteral = resolvedType.type === "container" && resolvedType.container.type === "literal";
            return !isLiteral;
        });
    }
}
