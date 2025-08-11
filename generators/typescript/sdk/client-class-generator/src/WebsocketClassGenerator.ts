import { PackageId } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass } from "@fern-typescript/contexts";

import { IntermediateRepresentation, WebSocketChannel } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl";

export declare namespace WebsocketClassGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        skipResponseValidation: boolean;
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
    private retainOriginalCasing: boolean;
    private omitUndefined: boolean;
    private skipResponseValidation: boolean;

    constructor({
        intermediateRepresentation,
        retainOriginalCasing,
        omitUndefined,
        skipResponseValidation
    }: WebsocketClassGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.skipResponseValidation = skipResponseValidation;
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
            includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            skipResponseValidation: this.skipResponseValidation
        });
    }
}
