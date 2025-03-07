import { NpmPackage, PackageId, Reference } from "@fern-typescript/commons";

import { WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketSocketClass } from "./GeneratedWebsocketSocketClass";

export interface WebsocketClassContext {
    getGeneratedWebsocketSocketClass: (
        channelId: WebSocketChannelId,
        channel: WebSocketChannel,
        packageId: PackageId
    ) => GeneratedWebsocketSocketClass;
    getReferenceToWebsocketSocketClass: (
        packageId: PackageId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
}
