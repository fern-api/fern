import { WebSocketChannel, WebSocketMessageBodyReference } from "@fern-fern/ir-sdk/api";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getSchemaOptions, getTextOfTsNode, PackageId, Reference, Zurg } from "@fern-typescript/commons";
import { GeneratedWebsocketTypeSchema, SdkContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

export declare namespace GeneratedWebsocketResponseSchemaImpl {
    export interface Init extends AbstractGeneratedSchema.Init {
        packageId: PackageId;
        channel: WebSocketChannel;
        receiveMessages: WebSocketMessageBodyReference[];
        includeSerdeLayer: boolean;
        omitUndefined: boolean;
        skipResponseValidation: boolean;
    }
}

export class GeneratedWebsocketResponseSchemaImpl
    extends AbstractGeneratedSchema<SdkContext>
    implements GeneratedWebsocketTypeSchema
{
    private packageId: PackageId;
    private channel: WebSocketChannel;
    private receiveMessages: WebSocketMessageBodyReference[];
    private includeSerdeLayer: boolean;
    private omitUndefined: boolean;
    private skipResponseValidation: boolean;

    constructor({
        packageId,
        channel,
        receiveMessages,
        includeSerdeLayer,
        omitUndefined,
        skipResponseValidation,
        ...superInit
    }: GeneratedWebsocketResponseSchemaImpl.Init) {
        super(superInit);
        this.packageId = packageId;
        this.channel = channel;
        this.receiveMessages = receiveMessages;
        this.includeSerdeLayer = includeSerdeLayer;
        this.omitUndefined = omitUndefined;
        this.skipResponseValidation = skipResponseValidation;
    }

    public writeToFile(context: SdkContext): void {
        this.writeSchemaToFile(context);
    }

    public deserializeResponse(referenceToRawResponse: ts.Expression, context: SdkContext): ts.Expression {
        if (!this.includeSerdeLayer) {
            return referenceToRawResponse;
        }
        return this.getReferenceToZurgSchema(context).parse(referenceToRawResponse, {
            ...getSchemaOptions({
                allowExtraFields: true,
                skipValidation: this.skipResponseValidation,
                omitUndefined: this.omitUndefined
            })
        });
    }

    protected getReferenceToSchema(context: SdkContext): Reference {
        return context.websocketTypeSchema.getReferenceToWebsocketResponseType(this.packageId, this.channel.name);
    }
    protected generateRawTypeDeclaration(context: SdkContext, module: ModuleDeclaration): void {
        const rawTypes = this.receiveMessages.map((message) =>
            getTextOfTsNode(context.typeSchema.getReferenceToRawType(message.bodyType).typeNode)
        );

        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            isExported: true,
            type: rawTypes.length > 0 ? rawTypes.join(" | ") : "never"
        });
    }

    protected getReferenceToParsedShape(context: SdkContext): ts.TypeNode {
        if (this.receiveMessages.length === 0) {
            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
        }
        return ts.factory.createUnionTypeNode(
            this.receiveMessages.map((message) => context.type.getReferenceToType(message.bodyType).typeNode)
        );
    }

    protected buildSchema(context: SdkContext): Zurg.Schema {
        if (this.receiveMessages.length === 0) {
            context.logger.warn(
                `WebSocket channel ${this.channel.name} has no receive messages defined. Generating a never schema.`
            );
            return context.coreUtilities.zurg.never();
        }
        return context.coreUtilities.zurg.undiscriminatedUnion(
            this.receiveMessages.map((message) => context.typeSchema.getSchemaOfTypeReference(message.bodyType))
        );
    }
}
