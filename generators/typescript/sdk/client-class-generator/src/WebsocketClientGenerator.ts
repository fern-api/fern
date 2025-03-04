import { ImportsManager } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

import { IntermediateRepresentation, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketClientClassImpl } from "./GeneratedWebsocketClientClassImpl";
import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl";

export declare namespace WebsocketClientGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        requireDefaultEnvironment: boolean;
    }

    export namespace generateWebsocketClient {
        export interface Args {
            channelId: WebSocketChannelId;
            serviceClassName: string;
            importsManager: ImportsManager;
        }
    }

    export namespace generateWebsocketSocket {
        export interface Args {
            channelId: WebSocketChannelId;
            serviceClassName: string;
            importsManager: ImportsManager;
        }
    }
}

export class WebsocketClientGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private packageResolver: PackageResolver;
    private requireDefaultEnvironment: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        packageResolver,
        requireDefaultEnvironment
    }: WebsocketClientGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.packageResolver = packageResolver;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
    }

    public generateWebsocketClient({
        channelId,
        serviceClassName,
        importsManager
    }: WebsocketClientGenerator.generateWebsocketClient.Args): GeneratedSdkClientClass {
        return new GeneratedWebsocketClientClassImpl({
            importsManager,
            intermediateRepresentation: this.intermediateRepresentation,
            channelId,
            packageResolver: this.packageResolver,
            serviceClassName,
            errorResolver: this.errorResolver,
            requireDefaultEnvironment: this.requireDefaultEnvironment
        });
    }

    public generateWebsocketSocket({
        channelId,
        serviceClassName,
        importsManager
    }: WebsocketClientGenerator.generateWebsocketSocket.Args): GeneratedSdkClientClass {
        return new GeneratedWebsocketSocketClassImpl({
            importsManager,
            intermediateRepresentation: this.intermediateRepresentation,
            channelId,
            packageResolver: this.packageResolver,
            serviceClassName,
            errorResolver: this.errorResolver
        });
    }
}
