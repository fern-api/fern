import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedWebsocketTypeSchema, WebsocketTypeSchemaContext } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { WebsocketTypeSchemaGenerator } from "@fern-typescript/websocket-type-schema-generator";
import { SourceFile } from "ts-morph";

import { Name, WebSocketChannel, WebSocketMessageBodyReference } from "@fern-fern/ir-sdk/api";

import { WebsocketTypeSchemaDeclarationReferencer } from "../../declaration-referencers/WebsocketTypeSchemaDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace WebsocketTypeSchemaContextImpl {
    export interface Init {
        websocketTypeSchemaGenerator: WebsocketTypeSchemaGenerator;
        websocketTypeSchemaDeclarationReferencer: WebsocketTypeSchemaDeclarationReferencer;
        packageResolver: PackageResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class WebsocketTypeSchemaContextImpl implements WebsocketTypeSchemaContext {
    private websocketTypeSchemaGenerator: WebsocketTypeSchemaGenerator;
    private websocketTypeSchemaDeclarationReferencer: WebsocketTypeSchemaDeclarationReferencer;
    private packageResolver: PackageResolver;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        importsManager,
        packageResolver,
        sourceFile,
        websocketTypeSchemaDeclarationReferencer,
        websocketTypeSchemaGenerator
    }: WebsocketTypeSchemaContextImpl.Init) {
        this.websocketTypeSchemaGenerator = websocketTypeSchemaGenerator;
        this.websocketTypeSchemaDeclarationReferencer = websocketTypeSchemaDeclarationReferencer;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.packageResolver = packageResolver;
    }

    public getGeneratedWebsocketResponseTypeSchema(
        packageId: PackageId,
        channel: WebSocketChannel,
        receiveMessages: WebSocketMessageBodyReference[]
    ): GeneratedWebsocketTypeSchema {
        return this.websocketTypeSchemaGenerator.generateInlinedWebsocketMessageBodySchema({
            packageId,
            channel,
            receiveMessages,
            typeName: this.websocketTypeSchemaDeclarationReferencer.getExportedName({
                packageId,
                channel
            })
        });
    }

    public getReferenceToWebsocketResponseType(packageId: PackageId, channelName: Name): Reference {
        const channel = this.packageResolver.getWebSocketChannelDeclaration(packageId);
        if (channel == null) {
            throw new Error(`Channel ${channelName.originalName} does not exist`);
        }
        return this.websocketTypeSchemaDeclarationReferencer.getReferenceToWebsocketResponseType({
            name: { packageId, channel },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false })
        });
    }
}
