import { ExportsManager, ImportsManager, NpmPackage, PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass, WebsocketClassContext } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { WebsocketClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SourceFile } from "ts-morph";

import { SubpackageId, WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk";

import { WebsocketSocketDeclarationReferencer } from "../../declaration-referencers/WebsocketSocketDeclarationReferencer";

export declare namespace WebsocketContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
        websocketGenerator: WebsocketClassGenerator;
        includeSerdeLayer: boolean;
        packageResolver: PackageResolver;
    }
}

export class WebsocketContextImpl implements WebsocketClassContext {
    public sourceFile: SourceFile;
    public importsManager: ImportsManager;
    public exportsManager: ExportsManager;
    public websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
    public websocketGenerator: WebsocketClassGenerator;
    public includeSerdeLayer: boolean;

    constructor({
        sourceFile,
        importsManager,
        exportsManager,
        websocketSocketDeclarationReferencer,
        websocketGenerator,
        includeSerdeLayer
    }: WebsocketContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.websocketSocketDeclarationReferencer = websocketSocketDeclarationReferencer;
        this.websocketGenerator = websocketGenerator;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getGeneratedWebsocketSocketClass(
        packageId: PackageId,
        channelId: WebSocketChannelId,
        channel: WebSocketChannel
    ): GeneratedWebsocketSocketClass {
        return this.websocketGenerator.generateWebsocketSocket({
            packageId,
            channel,
            serviceClassName: this.websocketSocketDeclarationReferencer.getExportedName(channelId),
            includeSerdeLayer: this.includeSerdeLayer
        });
    }

    public getReferenceToWebsocketSocketClass(
        packageId: PackageId,
        { importAlias, npmPackage }: { importAlias?: string; npmPackage?: NpmPackage } = {}
    ): Reference {
        let subpackageId: SubpackageId | undefined;
        if (packageId.isRoot) {
            throw new Error("Cannot get reference to websocket socket class for root package");
        } else {
            subpackageId = packageId.subpackageId;
        }
        if (npmPackage != null) {
            return this.websocketSocketDeclarationReferencer.getReferenceToWebsocketSocket({
                name: subpackageId,
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                exportsManager: this.exportsManager,
                importStrategy: { type: "fromPackage", packageName: npmPackage.packageName }
            });
        }
        return this.websocketSocketDeclarationReferencer.getReferenceToWebsocketSocket({
            name: subpackageId,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            importStrategy: { type: "direct", alias: importAlias }
        });
    }
}
