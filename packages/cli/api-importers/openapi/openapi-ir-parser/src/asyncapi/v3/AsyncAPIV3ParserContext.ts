import { OpenAPIV3 } from "openapi-types";

import { AbstractAsyncAPIParserContext } from "../AbstractAsyncAPIParserContext";
import { WebsocketSessionExampleMessage } from "../getFernExamples";
import { AsyncAPIV3 } from "../v3";

export class AsyncAPIV3ParserContext extends AbstractAsyncAPIParserContext<AsyncAPIV3.DocumentV3> {
    public getExampleMessageReference(message: WebsocketSessionExampleMessage): string {
        return `#/channels/${message.channelId}/messages/${message.messageId}`;
    }

    public resolveMessageReference(message: OpenAPIV3.ReferenceObject): AsyncAPIV3.ChannelMessage {
        const CHANNELS_PATH_PART = "#/channels/";
        const MESSAGE_REFERENCE_PREFIX = "#/components/messages/";

        if (message.$ref.startsWith(CHANNELS_PATH_PART)) {
            const parts = message.$ref.split("/");
            const channelPath = parts[2];
            const messageKey = parts[4];

            if (channelPath == null || messageKey == null || !this.document.channels?.[channelPath]) {
                throw new Error(`Failed to resolve message reference ${message.$ref} in channel ${channelPath}`);
            }

            const channel = this.document.channels[channelPath] as AsyncAPIV3.ChannelV3;
            const resolvedInChannel = (channel as AsyncAPIV3.ChannelV3).messages?.[messageKey];
            if (resolvedInChannel == null) {
                throw new Error(`${message.$ref} is undefined`);
            }
            if ("$ref" in resolvedInChannel) {
                return this.resolveMessageReference(resolvedInChannel as OpenAPIV3.ReferenceObject);
            } else {
                return {
                    name: messageKey,
                    ...resolvedInChannel
                };
            }
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

    public isMessageWithPayload(msg: unknown): msg is AsyncAPIV3.ChannelMessage {
        return msg != null && typeof msg === "object" && "payload" in msg;
    }

    public isReferenceObject(msg: unknown): msg is OpenAPIV3.ReferenceObject {
        return msg != null && typeof msg === "object" && "$ref" in msg;
    }
}
