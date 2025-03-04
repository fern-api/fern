import { ImportsManager, NpmPackage, PackageId, Reference } from "@fern-typescript/commons";
import {
    GeneratedWebsocketClientClass,
    GeneratedWebsocketSocketClass,
    WebsocketClassContext
} from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { WebsocketClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SourceFile } from "ts-morph";

import { WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { WebsocketClientDeclarationReferencer } from "../../declaration-referencers/WebsocketClientDeclarationReferencer";
import { WebsocketSocketDeclarationReferencer } from "../../declaration-referencers/WebsocketSocketDeclarationReferencer";

export declare namespace WebsocketContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        websocketClientDeclarationReferencer: WebsocketClientDeclarationReferencer;
        websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
        websocketGenerator: WebsocketClassGenerator;
        includeSerdeLayer: boolean;
        packageResolver: PackageResolver;
    }
}

export class WebsocketContextImpl implements WebsocketClassContext {
    public sourceFile: SourceFile;
    public importsManager: ImportsManager;
    public websocketClientDeclarationReferencer: WebsocketClientDeclarationReferencer;
    public websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
    public websocketGenerator: WebsocketClassGenerator;
    public includeSerdeLayer: boolean;

    constructor({
        sourceFile,
        importsManager,
        websocketClientDeclarationReferencer,
        websocketSocketDeclarationReferencer,
        websocketGenerator,
        includeSerdeLayer
    }: WebsocketContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.websocketClientDeclarationReferencer = websocketClientDeclarationReferencer;
        this.websocketSocketDeclarationReferencer = websocketSocketDeclarationReferencer;
        this.websocketGenerator = websocketGenerator;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getGeneratedWebsocketClientClass(
        channelId: WebSocketChannelId,
        channel: WebSocketChannel
    ): GeneratedWebsocketClientClass {
        return this.websocketGenerator.generateWebsocketClient({
            channelId,
            channel,
            importsManager: this.importsManager,
            serviceClassName: this.websocketClientDeclarationReferencer.getExportedName(channelId)
        });
    }

    public getGeneratedWebsocketSocketClass(
        channelId: WebSocketChannelId,
        channel: WebSocketChannel,
        packageId: PackageId
    ): GeneratedWebsocketSocketClass {
        return this.websocketGenerator.generateWebsocketSocket({
            channelId,
            channel,
            packageId,
            importsManager: this.importsManager,
            serviceClassName: this.websocketSocketDeclarationReferencer.getExportedName(channelId),
            includeSerdeLayer: this.includeSerdeLayer
        });
    }

    public getReferenceToWebsocketClientClass(
        channelId: WebSocketChannelId,
        { importAlias, npmPackage }: { importAlias?: string; npmPackage?: NpmPackage } = {}
    ): Reference {
        if (npmPackage != null) {
            return this.websocketClientDeclarationReferencer.getReferenceToWebsocket({
                name: channelId,
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                importStrategy: { type: "fromPackage", packageName: npmPackage.packageName }
            });
        }
        return this.websocketClientDeclarationReferencer.getReferenceToWebsocket({
            name: channelId,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias }
        });
    }

    public getReferenceToWebsocketSocketClass(
        channelId: WebSocketChannelId,
        { importAlias, npmPackage }: { importAlias?: string; npmPackage?: NpmPackage } = {}
    ): Reference {
        if (npmPackage != null) {
            return this.websocketSocketDeclarationReferencer.getReferenceToWebsocketSocket({
                name: channelId,
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                importStrategy: { type: "fromPackage", packageName: npmPackage.packageName }
            });
        }
        return this.websocketSocketDeclarationReferencer.getReferenceToWebsocketSocket({
            name: channelId,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias }
        });
    }
}
