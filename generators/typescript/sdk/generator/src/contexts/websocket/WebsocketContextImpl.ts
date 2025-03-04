import { ImportsManager, NpmPackage, Reference } from "@fern-typescript/commons";
import {
    GeneratedWebsocketClientClass,
    GeneratedWebsocketSocketClass,
    WebsocketClientClassContext
} from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { WebsocketClientGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SourceFile } from "ts-morph";

import { WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { WebsocketClientDeclarationReferencer } from "../../declaration-referencers/WebsocketClientDeclarationReferencer";
import { WebsocketSocketDeclarationReferencer } from "../../declaration-referencers/WebsocketSocketDeclarationReferencer";

export declare namespace WebsocketContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        websocketClientDeclarationReferencer: WebsocketClientDeclarationReferencer;
        websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
        websocketGenerator: WebsocketClientGenerator;
        packageResolver: PackageResolver;
    }
}

export class WebsocketContextImpl implements WebsocketClientClassContext {
    public sourceFile: SourceFile;
    public importsManager: ImportsManager;
    public websocketClientDeclarationReferencer: WebsocketClientDeclarationReferencer;
    public websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
    public websocketGenerator: WebsocketClientGenerator;

    constructor({
        sourceFile,
        importsManager,
        websocketClientDeclarationReferencer,
        websocketSocketDeclarationReferencer,
        websocketGenerator
    }: WebsocketContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.websocketClientDeclarationReferencer = websocketClientDeclarationReferencer;
        this.websocketSocketDeclarationReferencer = websocketSocketDeclarationReferencer;
        this.websocketGenerator = websocketGenerator;
    }

    public getGeneratedWebsocketClientClass(channelId: WebSocketChannelId): GeneratedWebsocketClientClass {
        return this.websocketGenerator.generateWebsocketClient({
            channelId,
            importsManager: this.importsManager,
            serviceClassName: this.websocketClientDeclarationReferencer.getExportedName(channelId)
        });
    }

    public getGeneratedWebsocketSocketClass(channelId: WebSocketChannelId): GeneratedWebsocketSocketClass {
        return this.websocketGenerator.generateWebsocketSocket({
            channelId,
            importsManager: this.importsManager,
            serviceClassName: this.websocketSocketDeclarationReferencer.getExportedName(channelId)
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
