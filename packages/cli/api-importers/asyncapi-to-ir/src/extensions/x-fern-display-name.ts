import { AbstractExtension } from "@fern-api/v3-importer-commons";

import { AsyncAPIV2 } from "../2.x/index.js";
import { AsyncAPIV3 } from "../3.0/index.js";

export declare namespace DisplayNameExtension {
    export interface Args extends AbstractExtension.Args {
        node:
            | AsyncAPIV2.ChannelV2
            | AsyncAPIV3.ChannelV3
            | AsyncAPIV2.PublishEvent
            | AsyncAPIV2.SubscribeEvent
            | AsyncAPIV3.Operation;
    }
}

export class DisplayNameExtension extends AbstractExtension<string> {
    private readonly node:
        | AsyncAPIV3.ChannelV3
        | AsyncAPIV2.ChannelV2
        | AsyncAPIV2.PublishEvent
        | AsyncAPIV2.SubscribeEvent
        | AsyncAPIV3.Operation;
    public readonly key = "x-fern-display-name";

    constructor({ breadcrumbs, node, context }: DisplayNameExtension.Args) {
        super({ breadcrumbs, context });
        this.node = node;
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.node);
        if (extensionValue == null || typeof extensionValue !== "string") {
            return undefined;
        }

        return extensionValue;
    }
}
