import { PackageId } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema } from "@fern-typescript/contexts";

import { WebSocketChannel, WebSocketMessageBody } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketMessageBodySchemaImpl } from "./GeneratedWebsocketMessageBodySchemaImpl";

export declare namespace WebsocketTypeSchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        omitUndefined: boolean;
    }

    export namespace GeneratedWebsocketMessageBodySchema {
        export interface Args {
            packageId: PackageId;
            channel: WebSocketChannel;
            messageBody: WebSocketMessageBody;
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
        messageBody,
        typeName
    }: WebsocketTypeSchemaGenerator.GeneratedWebsocketMessageBodySchema.Args): GeneratedSdkInlinedRequestBodySchema {
        if (messageBody.type !== "inlinedBody") {
            throw new Error("Request is not inlined");
        }
        return new GeneratedWebsocketMessageBodySchemaImpl({
            packageId,
            channel,
            messageBody,
            typeName,
            includeSerdeLayer: this.includeSerdeLayer,
            allowExtraFields: false,
            omitUndefined: this.omitUndefined
        });
    }
}
