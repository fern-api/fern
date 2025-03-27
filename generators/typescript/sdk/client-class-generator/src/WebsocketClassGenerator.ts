import { PackageId } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass } from "@fern-typescript/contexts";

import { IntermediateRepresentation, WebSocketChannel } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl";

export declare namespace WebsocketClassGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
    }

    export namespace generateWebsocketSocket {
        export interface Args {
            packageId: PackageId;
            channel: WebSocketChannel;
            serviceClassName: string;
            includeSerdeLayer: boolean;
        }
    }
}

export class WebsocketClassGenerator {
    private intermediateRepresentation: IntermediateRepresentation;

    constructor({ intermediateRepresentation }: WebsocketClassGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
    }

    public generateWebsocketSocket({
        packageId,
        channel,
        serviceClassName,
        includeSerdeLayer
    }: WebsocketClassGenerator.generateWebsocketSocket.Args): GeneratedWebsocketSocketClass {
        return new GeneratedWebsocketSocketClassImpl({
            packageId,
            channel,
            serviceClassName,
            includeSerdeLayer
        });
    }
}
