import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";

import { GeneratedWebsocketResponseSchemaImpl } from "./GeneratedWebsocketResponseSchemaImpl.js";

export declare namespace WebsocketTypeSchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        omitUndefined: boolean;
        skipResponseValidation: boolean;
    }

    export namespace GeneratedWebsocketMessageBodySchema {
        export interface Args {
            packageId: PackageId;
            channel: FernIr.WebSocketChannel;
            receiveMessages: FernIr.WebSocketMessageBodyReference[];
            typeName: string;
        }
    }
}

export class WebsocketTypeSchemaGenerator {
    private includeSerdeLayer: boolean;
    private omitUndefined: boolean;
    private skipResponseValidation: boolean;

    constructor({ includeSerdeLayer, omitUndefined, skipResponseValidation }: WebsocketTypeSchemaGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.omitUndefined = omitUndefined;
        this.skipResponseValidation = skipResponseValidation;
    }

    public generateInlinedWebsocketMessageBodySchema({
        packageId,
        channel,
        receiveMessages,
        typeName
    }: WebsocketTypeSchemaGenerator.GeneratedWebsocketMessageBodySchema.Args): GeneratedWebsocketResponseSchemaImpl {
        return new GeneratedWebsocketResponseSchemaImpl({
            packageId,
            channel,
            receiveMessages,
            typeName,
            includeSerdeLayer: this.includeSerdeLayer,
            omitUndefined: this.omitUndefined,
            skipResponseValidation: this.skipResponseValidation
        });
    }
}
