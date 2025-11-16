import { FernIr, WebSocketChannel } from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v3-importer-commons";

import { AsyncAPIConverter } from "../AsyncAPIConverter";
import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";
import { FernExamplesExtension } from "../extensions/x-fern-examples";

export declare namespace AbstractChannelConverter {
    export interface Args<TChannel> extends AsyncAPIConverter.AbstractArgs {
        websocketGroup: string[] | undefined;
        channel: TChannel;
        channelPath: string;
    }

    export interface Output {
        channel: WebSocketChannel;
        audiences: string[];
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export abstract class AbstractChannelConverter<TChannel> extends AbstractConverter<
    AsyncAPIConverterContext,
    AbstractChannelConverter.Output
> {
    protected readonly channel: TChannel;
    protected readonly channelPath: string;
    protected inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};
    protected websocketGroup: string[] | undefined;

    constructor({
        context,
        breadcrumbs,
        websocketGroup,
        channel,
        channelPath
    }: AbstractChannelConverter.Args<TChannel>) {
        super({ context, breadcrumbs });
        this.websocketGroup = websocketGroup;
        this.channel = channel;
        this.channelPath = channelPath;
    }

    public abstract convert(): AbstractChannelConverter.Output | undefined;

    protected convertExamples({
        fullPath,
        baseUrl,
        asyncApiVersion
    }: {
        fullPath: string;
        baseUrl: string | undefined;
        asyncApiVersion: "v2" | "v3";
    }): Record<string, FernIr.V2WebSocketSessionExample> {
        const fernExamplesExtension = new FernExamplesExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            channel: this.channel as object,
            baseDir: this.context.documentBaseDir
        });
        const fernExamples = fernExamplesExtension.convert();
        if (fernExamples == null) {
            return {};
        }
        return Object.fromEntries(
            fernExamples.map((example, index) => {
                return [
                    index.toString(),
                    {
                        channel: {
                            method: "GET",
                            path: fullPath
                        },
                        baseUrl: fullPath,
                        environment: baseUrl,
                        auth: undefined,
                        pathParameters: {},
                        queryParameters: example.queryParameters,
                        headers: example.headers,
                        messages: example.messages.map((message) => ({
                            type: asyncApiVersion === "v2" ? message.type : message.messageId,
                            body: message.value
                        }))
                    }
                ];
            })
        );
    }

    protected transformToValidPath(path: string): string {
        if (!path.startsWith("/")) {
            return "/" + path;
        }
        return path;
    }
}
