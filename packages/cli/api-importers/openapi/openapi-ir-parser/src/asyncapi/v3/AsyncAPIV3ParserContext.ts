import { OpenAPIV3 } from "openapi-types";

import { AbstractAsyncAPIParserContext } from "../AbstractAsyncAPIParserContext";
import { AsyncAPIV3 } from "../v3";

export class AsyncAPIV3ParserContext extends AbstractAsyncAPIParserContext<AsyncAPIV3.DocumentV3> {
    public resolveMessageReference(message: OpenAPIV3.ReferenceObject): AsyncAPIV3.MessageV3 {
        const CHANNELS_PATH_PART = "#/channels/";
        const MESSAGE_REFERENCE_PREFIX = "#/components/messages/";

        if (message.$ref.startsWith(CHANNELS_PATH_PART)) {
            const parts = message.$ref.split("/");
            const channelPath = parts[2];
            const messageKey = parts[4];

            if (channelPath == null || messageKey == null || !this.document.channels?.[channelPath]) {
                throw new Error(`Failed to resolve message reference ${message.$ref} in channel ${channelPath}`);
            }

            const channel = this.document.channels[channelPath] as AsyncAPIV3.Channel;
            const resolvedInChannel = (channel as AsyncAPIV3.Channel).messages?.[messageKey];
            if (resolvedInChannel == null) {
                throw new Error(`${message.$ref} is undefined`);
            }
            return {
                name: messageKey,
                ...resolvedInChannel
            };
        }

        const components = this.document.components;
        if (!message.$ref.startsWith(MESSAGE_REFERENCE_PREFIX) || !components?.messages) {
            throw new Error(`Failed to resolve message reference: ${message.$ref} in v3 components`);
        }

        const messageKey = message.$ref.substring(MESSAGE_REFERENCE_PREFIX.length);
        const resolvedInComponents = components.messages[messageKey];
        if (resolvedInComponents == null) {
            throw new Error(`${message.$ref} is undefined`);
        }

        return {
            name: messageKey,
            ...resolvedInComponents
        };
    }
}
