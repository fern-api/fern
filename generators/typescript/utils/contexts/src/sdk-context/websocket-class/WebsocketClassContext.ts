import { NpmPackage, PackageId, Reference } from "@fern-typescript/commons";

import { WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk";

import { GeneratedWebsocketSocketClass } from "./GeneratedWebsocketSocketClass";

export interface WebsocketClassContext {
    getGeneratedWebsocketSocketClass: (
        packageId: PackageId,
        channelId: WebSocketChannelId,
        channel: WebSocketChannel
    ) => GeneratedWebsocketSocketClass;
    getReferenceToWebsocketSocketClass: (
        packageId: PackageId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
}
