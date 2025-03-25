import { PackageId } from "@fern-typescript/commons";

import { WebSocketChannel, WebSocketMessageBodyReference } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketResponseSchemaImpl } from "./GeneratedWebsocketResponseSchemaImpl";

export declare namespace WebsocketTypeSchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        omitUndefined: boolean;
    }

    export namespace GeneratedWebsocketMessageBodySchema {
        export interface Args {
            packageId: PackageId;
            channel: WebSocketChannel;
            receiveMessages: WebSocketMessageBodyReference[];
            typeName: string;
        }
    }
}

export class WebsocketTypeSchemaGenerator {
    private includeSerdeLayer: boolean;
    private omitUndefined: boolean;

    constructor({ includeSerdeLayer, omitUndefined }: WebsocketTypeSchemaGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.omitUndefined = omitUndefined;
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
            omitUndefined: this.omitUndefined
        });
    }
}
