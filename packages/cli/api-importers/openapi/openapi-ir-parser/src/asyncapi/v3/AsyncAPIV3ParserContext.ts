import { OpenAPIV3 } from "openapi-types";

import { AbstractAsyncAPIParserContext } from "../AbstractAsyncAPIParserContext";
import { WebsocketSessionExampleMessage } from "../getFernExamples";
import { AsyncAPIV3 } from "../v3";

export class AsyncAPIV3ParserContext extends AbstractAsyncAPIParserContext<AsyncAPIV3.DocumentV3> {
    public getExampleMessageReference(message: WebsocketSessionExampleMessage): string {
        return `#/channels/${message.channelId}/messages/${message.messageId}`;
    }

    public resolveParameterReference(parameter: OpenAPIV3.ReferenceObject): AsyncAPIV3.ChannelParameter {
        const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";

        if (
            this.document.components == null ||
            this.document.components.parameters == null ||
            !parameter.$ref.startsWith(PARAMETER_REFERENCE_PREFIX)
        ) {
            throw new Error(`Failed to resolve ${parameter.$ref}`);
        }
        const parameterKey = parameter.$ref.substring(PARAMETER_REFERENCE_PREFIX.length);
        const resolvedParameter = this.document.components.parameters[parameterKey];
        if (resolvedParameter == null) {
            throw new Error(`${parameter.$ref} is undefined`);
        }
        if ("$ref" in resolvedParameter) {
            return this.resolveParameterReference(resolvedParameter as OpenAPIV3.ReferenceObject);
        }
        return resolvedParameter as AsyncAPIV3.ChannelParameter;
    }

    // Resolve a message reference. Use 'shallow' to prevent resolving nested references.
    public resolveMessageReference(
        message: OpenAPIV3.ReferenceObject,
        shallow: boolean = false
    ): AsyncAPIV3.ChannelMessage {
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
            if ("$ref" in resolvedInChannel && !shallow) {
                return this.resolveMessageReference(resolvedInChannel as OpenAPIV3.ReferenceObject);
            } else {
                return {
                    ...resolvedInChannel,
                    name: messageKey
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
            ...resolvedInComponents,
            name: messageKey
        };
    }

    public isMessageWithPayload(msg: unknown): msg is AsyncAPIV3.ChannelMessage {
        return msg != null && typeof msg === "object" && "payload" in msg;
    }

    public isReferenceObject(msg: unknown): msg is OpenAPIV3.ReferenceObject {
        return msg != null && typeof msg === "object" && "$ref" in msg;
    }
}
