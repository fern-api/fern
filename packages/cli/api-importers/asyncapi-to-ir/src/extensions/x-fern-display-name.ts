import { AbstractExtension } from "@fern-api/v2-importer-commons"

import { AsyncAPIV2 } from "../2.x"
import { AsyncAPIV3 } from "../3.0"

export declare namespace DisplayNameExtension {
    export interface Args extends AbstractExtension.Args {
        channel: AsyncAPIV2.ChannelV2 | AsyncAPIV3.ChannelV3
    }
}

export class DisplayNameExtension extends AbstractExtension<string> {
    private readonly channel: AsyncAPIV3.ChannelV3 | AsyncAPIV2.ChannelV2
    public readonly key = "x-fern-display-name"

    constructor({ breadcrumbs, channel, context }: DisplayNameExtension.Args) {
        super({ breadcrumbs, context })
        this.channel = channel
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.channel)
        if (extensionValue == null || typeof extensionValue !== "string") {
            return undefined
        }

        return extensionValue
    }
}
