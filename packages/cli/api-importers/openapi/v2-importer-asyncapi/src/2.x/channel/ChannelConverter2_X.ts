import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { HttpHeader, PathParameter, QueryParameter, TypeDeclaration, WebSocketChannel } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIV2 } from "..";
import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { ParameterConverter } from "../../core/channel/ParameterConverter";

export declare namespace ChannelConverter2_X {
    export interface Args extends AbstractConverter.Args {
        channel: AsyncAPIV2.ChannelV2;
        channelPath: string;
    }

    export interface Output {
        channel: WebSocketChannel;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

export class ChannelConverter2_X extends AbstractConverter<AsyncAPIConverterContext, ChannelConverter2_X.Output> {
    private readonly channel: AsyncAPIV2.ChannelV2;
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
    }): Promise<ChannelConverter2_X.Output | undefined> {
        const pathParameters: PathParameter[] = [];
        const queryParameters: QueryParameter[] = [];
        const headers: HttpHeader[] = [];

        if (this.channel.parameters) {
            for (const [name, parameter] of Object.entries(this.channel.parameters ?? {})) {
                let parameterObject = parameter as OpenAPIV3_1.ParameterObject;
                if (context.isReferenceObject(parameter)) {
                    const resolvedReference = await context.resolveReference<OpenAPIV3_1.ParameterObject>(parameter);
                    if (resolvedReference.resolved) {
                        parameterObject = resolvedReference.value;
                    } else {
                        continue;
                    }
                }
                const parameterConverter = new ParameterConverter({
                    breadcrumbs: this.breadcrumbs,
                    parameter: {
                        ...parameterObject,
                        name,
                        in: "query"
                    }
                });
                const convertedParameter = await parameterConverter.convert({ context, errorCollector });
                if (convertedParameter != null) {
                    this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                    if (convertedParameter.type === "query") {
                        queryParameters.push(convertedParameter.parameter);
                    }
                }
            }
        }

        if (this.channel.bindings?.ws != null) {
            if (this.channel.bindings.ws.headers != null) {
                const required = this.channel.bindings.ws.headers.required ?? [];
                for (const [name, schema] of Object.entries(this.channel.bindings.ws.headers.properties ?? {})) {
                    let resolvedHeader = schema;
                    if (context.isReferenceObject(schema)) {
                        const resolved = await context.resolveReference<OpenAPIV3.SchemaObject>(schema);
                        if (!resolved.resolved) {
                            continue;
                        }
                        resolvedHeader = resolved.value;
                    }

                    const parameterConverter = new ParameterConverter({
                        breadcrumbs: [...this.breadcrumbs, name],
                        parameter: {
                            name,
                            in: "header",
                            required: required.includes(name),
                            schema: resolvedHeader
                        }
                    });

                    const convertedParameter = await parameterConverter.convert({ context, errorCollector });
                    if (convertedParameter != null && convertedParameter.type === "header") {
                        this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                        headers.push(convertedParameter.parameter);
                    }
                }
            }

            if (this.channel.bindings.ws.query != null) {
                const required = this.channel.bindings.ws.query.required ?? [];
                for (const [name, schema] of Object.entries(this.channel.bindings.ws.query.properties ?? {})) {
                    let resolvedQuery = schema;
                    if (context.isReferenceObject(schema)) {
                        const resolved = await context.resolveReference<OpenAPIV3.SchemaObject>(schema);
                        if (!resolved.resolved) {
                            continue;
                        }
                        resolvedQuery = resolved.value;
                    }

                    const parameterConverter = new ParameterConverter({
                        breadcrumbs: [...this.breadcrumbs, name],
                        parameter: {
                            name,
                            in: "query",
                            required: required.includes(name),
                            schema: resolvedQuery
                        }
                    });

                    const convertedParameter = await parameterConverter.convert({ context, errorCollector });
                    if (convertedParameter != null && convertedParameter.type === "query") {
                        this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                        queryParameters.push(convertedParameter.parameter);
                    }
                }
            }
        }

        return {
            channel: {
                name: context.casingsGenerator.generateName(this.channelPath),
                displayName: this.channelPath,
                baseUrl: this.channel.servers?.[0],
                path: {
                    head: this.channelPath,
                    parts: []
                },
                // TODO: Dynamically parse auth from channel
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
                docs: this.channel.description
            },
            inlinedTypes: this.inlinedTypes
        };
    }
}
