import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass } from "@fern-typescript/contexts";

import { GeneratedWebsocketSocketClassImpl } from "./GeneratedWebsocketSocketClassImpl.js";

export declare namespace WebsocketClassGenerator {
    export interface Init {
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        skipResponseValidation: boolean;
    }

    export namespace generateWebsocketSocket {
        export interface Args {
            packageId: PackageId;
            channel: FernIr.WebSocketChannel;
            serviceClassName: string;
            includeSerdeLayer: boolean;
        }
    }
}

export class WebsocketClassGenerator {
    private intermediateRepresentation: FernIr.IntermediateRepresentation;
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
