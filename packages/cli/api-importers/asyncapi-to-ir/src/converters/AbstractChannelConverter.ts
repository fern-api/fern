import { TypeDeclaration, WebSocketChannel } from "@fern-api/ir-sdk";
import { FernIr } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";
import { FernExamplesExtension } from "../extensions/x-fern-examples";

export declare namespace AbstractChannelConverter {
    export interface Args<TChannel> extends AbstractConverter.Args {
        channel: TChannel;
        channelPath: string;
        group: string[] | undefined;
    }

    export interface Output {
        channel: WebSocketChannel;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

export abstract class AbstractChannelConverter<TChannel> extends AbstractConverter<
    AsyncAPIConverterContext,
    AbstractChannelConverter.Output
> {
    protected readonly channel: TChannel;
    protected readonly channelPath: string;
    protected readonly group: string[] | undefined;
    protected inlinedTypes: Record<string, TypeDeclaration> = {};

    constructor({ breadcrumbs, channel, channelPath, group }: AbstractChannelConverter.Args<TChannel>) {
        super({ breadcrumbs });
        this.channel = channel;
        this.channelPath = channelPath;
        this.group = group;
    }

    public abstract convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<AbstractChannelConverter.Output | undefined>;

    protected convertExamples({
        pathHead,
        baseUrl,
        context,
        errorCollector
    }: {
        pathHead: string;
        baseUrl: string | undefined;
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): FernIr.dynamic.WebSocketSessionSnippet[] {
        const fernExamplesExtension = new FernExamplesExtension({
            breadcrumbs: this.breadcrumbs,
            channel: this.channel as object
        });
        const fernExamples = fernExamplesExtension.convert({ context, errorCollector });
        if (fernExamples == null) {
            return [];
        }
        return fernExamples.map((example) => {
            return {
                channel: {
                    method: "GET",
                    path: pathHead
                },
                baseUrl: undefined,
                environment: baseUrl,
                auth: undefined,
                pathParameters: undefined,
                queryParameters: example.queryParameters,
                headers: example.headers,
                messages: example.messages
            };
        });
    }

    protected transformToValidPath(path: string): string {
        if (!path.startsWith("/")) {
            return "/" + path;
        }
        return path;
    }
}
