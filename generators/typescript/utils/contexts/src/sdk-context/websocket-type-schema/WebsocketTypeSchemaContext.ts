import { Name, WebSocketChannel, WebSocketMessageBodyReference } from "@fern-api/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedWebsocketTypeSchema } from "./GeneratedWebsocketTypeSchema";

export interface WebsocketTypeSchemaContext {
    getGeneratedWebsocketResponseTypeSchema: (
        packageId: PackageId,
        channel: WebSocketChannel,
        receiveMessages: WebSocketMessageBodyReference[]
    ) => GeneratedWebsocketTypeSchema;
    getReferenceToWebsocketResponseType: (packageId: PackageId, channelName: Name) => Reference;
}
