import { NpmPackage, PackageId, Reference } from "@fern-typescript/commons";

import { WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketClientClass } from "./GeneratedWebsocketClientClass";
import { GeneratedWebsocketSocketClass } from "./GeneratedWebsocketSocketClass";

export interface WebsocketClassContext {
    getGeneratedWebsocketClientClass: (
        channelId: WebSocketChannelId,
        channel: WebSocketChannel
    ) => GeneratedWebsocketClientClass;
    getGeneratedWebsocketSocketClass: (
        channelId: WebSocketChannelId,
        channel: WebSocketChannel,
        packageId: PackageId
    ) => GeneratedWebsocketSocketClass;
    getReferenceToWebsocketClientClass: (
        channelId: WebSocketChannelId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
    getReferenceToWebsocketSocketClass: (
        channelId: WebSocketChannelId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
}
