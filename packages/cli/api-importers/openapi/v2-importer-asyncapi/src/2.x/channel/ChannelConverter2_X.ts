import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";

export declare namespace ChannelConverter2_X {
    export interface Args extends AbstractConverter.Args {
        channel: OpenAPIV3_1.PathItemObject;
        channelPath: string;
    }
}

export class ChannelConverter2_X extends AbstractConverter<AsyncAPIConverterContext, void> {
    private readonly channel: OpenAPIV3_1.PathItemObject;
    private readonly channelPath: string;

    constructor({ breadcrumbs, channel, channelPath }: ChannelConverter2_X.Args) {
        super({ breadcrumbs });
        this.channel = channel;
        this.channelPath = channelPath;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<void> {}
}
