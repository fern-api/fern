import { ImportsManager } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

import { IntermediateRepresentation, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl";

export declare namespace WebsocketSocketGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
    }

    export namespace generateWebsocketSocket {
        export interface Args {
            channelId: WebSocketChannelId;
            serviceClassName: string;
            importsManager: ImportsManager;
        }
    }
}

export class WebsocketSocketGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private packageResolver: PackageResolver;

    constructor({ intermediateRepresentation, errorResolver, packageResolver }: WebsocketSocketGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.packageResolver = packageResolver;
    }

    public generateWebsocketSocket({
        channelId,
        serviceClassName,
        importsManager
    }: WebsocketSocketGenerator.generateWebsocketSocket.Args): GeneratedSdkClientClass {
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
