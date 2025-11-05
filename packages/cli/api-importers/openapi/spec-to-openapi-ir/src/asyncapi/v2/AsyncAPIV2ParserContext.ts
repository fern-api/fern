import { OpenAPIV3 } from "openapi-types";

import { AbstractAsyncAPIParserContext } from "../AbstractAsyncAPIParserContext";
import { WebsocketSessionExampleMessage } from "../getFernExamples";
import { AsyncAPIV2 } from "../v2";

export class AsyncAPIV2ParserContext extends AbstractAsyncAPIParserContext<AsyncAPIV2.DocumentV2> {
    public getExampleMessageReference(message: WebsocketSessionExampleMessage): string {
        return `#/components/messages/${message.messageId}`;
    }

    public resolveMessageReference(message: OpenAPIV3.ReferenceObject): AsyncAPIV2.MessageV2 {
        const MESSAGE_REFERENCE_PREFIX = "#/components/messages/";
        const components = this.document.components;

        if (components == null || components.messages == null || !message.$ref.startsWith(MESSAGE_REFERENCE_PREFIX)) {
            throw new Error(`Failed to resolve message reference: ${message.$ref} in v2 components`);
        }

        const messageKey = message.$ref.substring(MESSAGE_REFERENCE_PREFIX.length);
        const resolvedMessage = components.messages[messageKey];
        if (resolvedMessage == null) {
            throw new Error(`${message.$ref} is undefined`);
        }
        return resolvedMessage as AsyncAPIV2.MessageV2;
    }
}
