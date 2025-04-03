import { TypeDeclaration, WebSocketChannel } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";
import { FernExamplesExtension, WebsocketSessionExtensionExample } from "../extensions/x-fern-examples";

export declare namespace ChannelConverter {
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

export abstract class ChannelConverter<TChannel> extends AbstractConverter<
    AsyncAPIConverterContext,
    ChannelConverter.Output
> {
    protected readonly channel: TChannel;
    protected readonly channelPath: string;
    protected readonly group: string[] | undefined;
    protected inlinedTypes: Record<string, TypeDeclaration> = {};

    constructor({ breadcrumbs, channel, channelPath, group }: ChannelConverter.Args<TChannel>) {
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
    }): Promise<ChannelConverter.Output | undefined>;

    protected convertExamples({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): WebsocketSessionExtensionExample[] {
        const fernExamplesExtension = new FernExamplesExtension({
            breadcrumbs: this.breadcrumbs,
            channel: this.channel as object
        });
        const fernExamples = fernExamplesExtension.convert({ context, errorCollector });
        if (fernExamples == null) {
            return [];
        }
        return fernExamples;
    }

    protected transformToValidPath(path: string): string {
        if (!path.startsWith("/")) {
            return "/" + path;
        }
        return path;
    }
}
