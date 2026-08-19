import { FernIr } from "@fern-fern/ir-sdk";
import { NpmPackage, PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedWebsocketSocketClass } from "./GeneratedWebsocketSocketClass.js";

export interface WebsocketClassContext {
    getGeneratedWebsocketSocketClass: (
        packageId: PackageId,
        channelId: FernIr.WebSocketChannelId,
        channel: FernIr.WebSocketChannel
    ) => GeneratedWebsocketSocketClass;
    getReferenceToWebsocketSocketClass: (
        packageId: PackageId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
}
