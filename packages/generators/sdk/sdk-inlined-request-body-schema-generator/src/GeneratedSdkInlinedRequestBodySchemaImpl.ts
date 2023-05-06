import { HttpEndpoint, InlinedRequestBody } from "@fern-fern/ir-model/http";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode, PackageId, Reference, Zurg } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema, SdkInlinedRequestBodySchemaContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedSdkInlinedRequestBodySchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        inlinedRequestBody: InlinedRequestBody;
    }
}

export class GeneratedSdkInlinedRequestBodySchemaImpl
    extends AbstractGeneratedSchema<SdkInlinedRequestBodySchemaContext>
    implements GeneratedSdkInlinedRequestBodySchema
{
    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private inlinedRequestBody: InlinedRequestBody;

    constructor({
        packageId,
        endpoint,
        inlinedRequestBody,
        ...superInit
    }: GeneratedSdkInlinedRequestBodySchemaImpl.Init) {
        super(superInit);
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.inlinedRequestBody = inlinedRequestBody;
    }

    public writeToFile(context: SdkInlinedRequestBodySchemaContext): void {
        this.writeSchemaToFile(context);
    }

    public serializeRequest(
        referenceToParsedRequest: ts.Expression,
        context: SdkInlinedRequestBodySchemaContext
    ): ts.Expression {
        return this.getReferenceToZurgSchema(context).jsonOrThrow(referenceToParsedRequest, {
            unrecognizedObjectKeys: "strip",
            allowUnrecognizedEnumValues: false,
            allowUnrecognizedUnionMembers: false,
            skipValidation: false,
        });
    }

    protected getReferenceToSchema(context: SdkInlinedRequestBodySchemaContext): Reference {
        return context.sdkInlinedRequestBodySchema.getReferenceToInlinedRequestBody(this.packageId, this.endpoint.name);
    }

    protected generateRawTypeDeclaration(context: SdkInlinedRequestBodySchemaContext, module: ModuleDeclaration): void {
        module.addInterface({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            properties: this.inlinedRequestBody.properties.map((property) => {
                const type = context.typeSchema.getReferenceToRawType(property.valueType);
                return {
                    name: `"${property.name.wireValue}"`,
                    type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                    hasQuestionToken: type.isOptional,
                };
            }),
            extends: this.inlinedRequestBody.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            ),
        });
    }

    protected getReferenceToParsedShape(context: SdkInlinedRequestBodySchemaContext): ts.TypeNode {
        const referenceToRequestWrapper = context.requestWrapper.getReferenceToRequestWrapper(
            this.packageId,
            this.endpoint.name
        );
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.packageId,
            this.endpoint.name
        );
        const nonBodyKeys = generatedRequestWrapper.getNonBodyKeys();
        if (nonBodyKeys.length === 0) {
            return referenceToRequestWrapper;
        } else {
            return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                referenceToRequestWrapper,
                ts.factory.createUnionTypeNode(
                    nonBodyKeys.map((nonBodyKey) =>
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(nonBodyKey.propertyName))
                    )
                ),
            ]);
        }
    }

    protected buildSchema(context: SdkInlinedRequestBodySchemaContext): Zurg.Schema {
        let schema = context.base.coreUtilities.zurg.object(
            this.inlinedRequestBody.properties.map((property) => ({
                key: {
                    parsed: context.requestWrapper
                        .getGeneratedRequestWrapper(this.packageId, this.endpoint.name)
                        .getInlinedRequestBodyPropertyKey(property),
                    raw: property.name.wireValue,
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType),
            }))
        );

        for (const extension of this.inlinedRequestBody.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension, { isGeneratingSchema: true }));
        }

        return schema;
    }
}
