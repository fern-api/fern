import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedWebsocketTypeSchema } from "./GeneratedWebsocketTypeSchema.js";

export interface WebsocketTypeSchemaContext {
    getGeneratedWebsocketResponseTypeSchema: (
        packageId: PackageId,
        channel: FernIr.WebSocketChannel,
        receiveMessages: FernIr.WebSocketMessageBodyReference[]
    ) => GeneratedWebsocketTypeSchema;
    getReferenceToWebsocketResponseType: (packageId: PackageId, channelName: FernIr.NameOrString) => Reference;
}
