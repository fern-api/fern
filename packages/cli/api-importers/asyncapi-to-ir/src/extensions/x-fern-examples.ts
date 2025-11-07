import { AbstractConverter, AbstractExtension } from "@fern-api/v3-importer-commons";

import { WebsocketSessionExtensionExamplesSchema } from "../schemas/ExampleSchema";

export interface WebsocketSessionExampleMessage {
    type: string;
    channelId?: string;
    messageId: string;
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
        baseDir?: string;
    }

    export type Output = WebsocketSessionExtensionExample[];
}

export class FernExamplesExtension extends AbstractExtension<FernExamplesExtension.Output> {
    private readonly channel: object;
    private readonly baseDir: string | undefined;
    public readonly key = "x-fern-examples";

    constructor({ breadcrumbs, channel, context, baseDir }: FernExamplesExtension.Args) {
        super({ breadcrumbs: breadcrumbs ?? [], context });
        this.channel = channel;
        this.baseDir = baseDir;
    }

    public convert(): FernExamplesExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.channel);
        if (extensionValue == null) {
            return undefined;
        }

        const result = WebsocketSessionExtensionExamplesSchema.safeParse(extensionValue);
        if (!result.success) {
            this.context.errorCollector.collect({
                message: `Invalid x-fern-examples extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        return result.data.map((example) => ({
            summary: example.summary,
            description: example.description,
            queryParameters: example["query-parameters"],
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
