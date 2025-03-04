import { NpmPackage, Reference } from "@fern-typescript/commons";

import { WebSocketChannelId } from "@fern-fern/ir-sdk/api";

import { GeneratedWebsocketClientClass } from "./GeneratedWebsocketClientClass";

export interface WebsocketClientClassContext {
    getGeneratedWebsocketClientClass: (channelId: WebSocketChannelId) => GeneratedWebsocketClientClass;
    getReferenceToWebsocketClientClass: (
        channelId: WebSocketChannelId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
}
