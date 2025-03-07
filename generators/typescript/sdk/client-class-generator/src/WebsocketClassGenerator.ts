import { GeneratedWebsocketSocketClass } from "@fern-typescript/contexts";

import { IntermediateRepresentation, WebSocketChannel } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl";

export declare namespace WebsocketClassGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
    }

    export namespace generateWebsocketSocket {
        export interface Args {
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
        channel,
        serviceClassName,
        includeSerdeLayer
    }: WebsocketClassGenerator.generateWebsocketSocket.Args): GeneratedWebsocketSocketClass {
        return new GeneratedWebsocketSocketClassImpl({
            channel,
            serviceClassName,
            includeSerdeLayer
        });
    }
}
