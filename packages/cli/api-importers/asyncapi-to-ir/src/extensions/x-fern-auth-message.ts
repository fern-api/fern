import { WebSocketAuthMessageConfig } from "@fern-api/ir-sdk";
import { AbstractExtension } from "@fern-api/v3-importer-commons";

import { AsyncAPIV2 } from "../2.x";
import { AsyncAPIV3 } from "../3.0";

export declare namespace AuthMessageExtension {
    export interface Args extends AbstractExtension.Args {
        channel: AsyncAPIV2.ChannelV2 | AsyncAPIV3.ChannelV3;
    }

    export interface AuthMessageConfig {
        "message-id": string;
        "token-property-path": string;
    }
}

export class AuthMessageExtension extends AbstractExtension<WebSocketAuthMessageConfig> {
    private readonly channel: AsyncAPIV3.ChannelV3 | AsyncAPIV2.ChannelV2;
    public readonly key = "x-fern-auth-message";

    constructor({ breadcrumbs, channel, context }: AuthMessageExtension.Args) {
        super({ breadcrumbs, context });
        this.channel = channel;
    }

    public convert(): WebSocketAuthMessageConfig | undefined {
        const extensionValue = this.getExtensionValue(this.channel) as
            | AuthMessageExtension.AuthMessageConfig
            | undefined;
        if (extensionValue == null) {
            return undefined;
        }

        const messageId = extensionValue["message-id"];
        const tokenPropertyPath = extensionValue["token-property-path"];

        if (typeof messageId !== "string" || typeof tokenPropertyPath !== "string") {
            return undefined;
        }

        return {
            messageId,
            tokenPropertyPath
        };
    }
}
