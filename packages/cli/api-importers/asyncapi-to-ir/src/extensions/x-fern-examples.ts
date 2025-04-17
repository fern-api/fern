import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";
import { WebsocketSessionExtensionExamplesSchema } from "../schemas/ExampleSchema";

export interface WebsocketSessionExampleMessage {
    type: string;
    channelId?: string;
    messageId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
}

export interface WebsocketSessionExtensionExample {
    summary?: string;
    description?: string;
    queryParameters?: Record<string, string>;
    headers?: Record<string, string>;
    messages: WebsocketSessionExampleMessage[];
}

export declare namespace FernExamplesExtension {
    export interface Args extends AbstractConverter.AbstractArgs {
        channel: object;
    }

    export type Output = WebsocketSessionExtensionExample[];
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly channel: object;
    public readonly key = "x-fern-examples";

    constructor({ breadcrumbs, channel }: FernExamplesExtension.Args) {
        super({ breadcrumbs: breadcrumbs ?? [] });
        this.channel = channel;
    }

    public convert({ errorCollector }: { errorCollector: ErrorCollector }): FernExamplesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.channel);
        if (extensionValue == null) {
            return undefined;
        }

        const result = WebsocketSessionExtensionExamplesSchema.safeParse(extensionValue);
        if (!result.success) {
            errorCollector.collect({
                message: `Invalid x-fern-examples extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        return result.data.map((example) => ({
            summary: example.summary,
            description: example.description,
            queryParameters: example.queryParameters,
            headers: example.headers,
            messages: example.messages.map((message) => ({
                type: message.type,
                channelId: message.channelId,
                messageId: message.messageId,
                value: message.value
            }))
        }));
    }
}
