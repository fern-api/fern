import { PackageId, Reference } from "@fern-typescript/commons";

import { Name, WebSocketMessageBody } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketTypeSchema } from "./GeneratedWebsocketTypeSchema";

export interface WebsocketTypeSchemaContext {
    getGeneratedWebsocketTypeSchema: (
        packageId: PackageId,
        channelName: Name,
        messageBody: WebSocketMessageBody
    ) => GeneratedWebsocketTypeSchema;
    getReferenceToWebsocketTypeSchema: (packageId: PackageId, channelName: Name) => Reference;
}
