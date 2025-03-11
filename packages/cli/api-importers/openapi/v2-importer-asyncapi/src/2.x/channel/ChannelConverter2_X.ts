import { OpenAPIV3_1 } from "openapi-types";

import { HttpHeader, PathParameter, QueryParameter, TypeDeclaration, WebSocketChannel } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { ParameterConverter } from "../../core/channel/ParameterConverter";

export declare namespace ChannelConverter2_X {
    export interface Args extends AbstractConverter.Args {
        channel: OpenAPIV3_1.PathItemObject;
        channelPath: string;
    }
}

export class ChannelConverter2_X extends AbstractConverter<AsyncAPIConverterContext, WebSocketChannel | undefined> {
    private readonly channel: OpenAPIV3_1.PathItemObject;
    private readonly channelPath: string;
    protected inlinedTypes: Record<string, TypeDeclaration> = {};

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
    }): Promise<WebSocketChannel | undefined> {
        const pathParameters: PathParameter[] = [];
        const queryParameters: QueryParameter[] = [];
        const headers: HttpHeader[] = [];

        if (this.channel.parameters) {
            for (let parameter of Object.values(this.channel.parameters ?? {})) {
                if (context.isReferenceObject(parameter)) {
                    const resolvedReference = await context.resolveReference<OpenAPIV3_1.ParameterObject>(parameter);
                    if (resolvedReference.resolved) {
                        parameter = resolvedReference.value;
                    } else {
                        continue;
                    }
                }
                const parameterConverter = new ParameterConverter({
                    breadcrumbs: this.breadcrumbs,
                    parameter
                });
                const convertedParameter = await parameterConverter.convert({ context, errorCollector });
                if (convertedParameter != null) {
                    this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                    switch (convertedParameter.type) {
                        case "path":
                            pathParameters.push(convertedParameter.parameter);
                            break;
                        case "query":
                            queryParameters.push(convertedParameter.parameter);
                            break;
                        case "header":
                            headers.push(convertedParameter.parameter);
                            break;
                    }
                }
            }
        }
        return {
            name: context.casingsGenerator.generateName(this.channelPath),
            displayName: this.channelPath,
            baseUrl: undefined,
            path: {
                head: this.channelPath,
                parts: []
            },
            auth: false,
            headers,
            queryParameters,
            pathParameters,
            messages: [],
            examples: [],
            availability: await context.getAvailability({
                node: this.channel,
                breadcrumbs: this.breadcrumbs,
                errorCollector
            }),
            docs: undefined
        };
    }
}
