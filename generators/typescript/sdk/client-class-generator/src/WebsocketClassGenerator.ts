import { ImportsManager, PackageId } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

import { IntermediateRepresentation, WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl";

export declare namespace WebsocketClassGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        requireDefaultEnvironment: boolean;
    }

    export namespace generateWebsocketSocket {
        export interface Args {
            channelId: WebSocketChannelId;
            channel: WebSocketChannel;
            packageId: PackageId;
            serviceClassName: string;
            importsManager: ImportsManager;
            includeSerdeLayer: boolean;
        }
    }
}

export class WebsocketClassGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private packageResolver: PackageResolver;
    private requireDefaultEnvironment: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        packageResolver,
        requireDefaultEnvironment
    }: WebsocketClassGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.packageResolver = packageResolver;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
    }

    public generateWebsocketSocket({
        channelId,
        channel,
        packageId,
        serviceClassName,
        importsManager,
        includeSerdeLayer
    }: WebsocketClassGenerator.generateWebsocketSocket.Args): GeneratedWebsocketSocketClass {
        return new GeneratedWebsocketSocketClassImpl({
            importsManager,
            intermediateRepresentation: this.intermediateRepresentation,
            channelId,
            channel,
            packageId,
            packageResolver: this.packageResolver,
            serviceClassName,
            errorResolver: this.errorResolver,
            includeSerdeLayer
        });
    }
}
