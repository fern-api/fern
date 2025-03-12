import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import {
    FernIr,
    HttpHeader,
    PathParameter,
    QueryParameter,
    TypeDeclaration,
    WebSocketChannel,
    WebSocketMessage
} from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIV2 } from "..";
import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { ParameterConverter } from "../../core/channel/ParameterConverter";
import { SchemaConverter } from "../../core/schema/SchemaConverter";

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
            await this.convertQueryParameters({
                context,
                errorCollector,
                queryParameters
            });
        }

        if (this.channel.bindings?.ws != null) {
            await this.convertHeaders({
                context,
                errorCollector,
                headers
            });

            await this.convertBindingQueryParameters({
                context,
                errorCollector,
                queryParameters
            });
        }

        let subscribeMessage: WebSocketMessage | undefined = undefined;
        if (this.channel.subscribe != null) {
            subscribeMessage = await this.convertMessage({
                context,
                errorCollector,
                operation: this.channel.subscribe,
                defaultId: "subscribeEvent",
                breadcrumbName: "subscribeEvent"
            });
        }

        let publishMessage: WebSocketMessage | undefined = undefined;
        if (this.channel.publish != null) {
            publishMessage = await this.convertMessage({
                context,
                errorCollector,
                operation: this.channel.publish,
                defaultId: "publishEvent",
                breadcrumbName: "publishEvent"
            });
        }

        const messages: WebSocketMessage[] = [];
        if (subscribeMessage != null) {
            messages.push(subscribeMessage);
        }
        if (publishMessage != null) {
            messages.push(publishMessage);
        }

        return {
            channel: {
                name: context.casingsGenerator.generateName(this.channelPath),
                displayName: this.channelPath,
                // TODO: Correctly feed in servers
                baseUrl: this.channel.servers?.[0],
                path: {
                    head: this.channelPath,
                    parts: []
                },
                auth: false,
                headers,
                queryParameters,
                pathParameters,
                messages,
                // TODO: Add examples
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

    private async convertMessage({
        context,
        errorCollector,
        operation,
        defaultId,
        breadcrumbName
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
        operation: AsyncAPIV2.PublishEvent | AsyncAPIV2.SubscribeEvent;
        defaultId: string;
        breadcrumbName: string;
    }): Promise<WebSocketMessage | undefined> {
        let convertedSchema: SchemaConverter.Output | undefined = undefined;

        if ("oneOf" in operation.message) {
            const schemaConverter = new SchemaConverter({
                id: operation.operationId ?? defaultId,
                breadcrumbs: [...this.breadcrumbs, breadcrumbName],
                schema: operation.message
            });
            convertedSchema = await schemaConverter.convert({ context, errorCollector });
        } else if ("payload" in operation.message) {
            let payloadSchema: OpenAPIV3.SchemaObject | undefined = undefined;
            if (context.isReferenceObject(operation.message.payload)) {
                const resolved = await context.resolveReference<OpenAPIV3.SchemaObject>(operation.message.payload);
                if (resolved.resolved) {
                    payloadSchema = resolved.value;
                }
            } else {
                payloadSchema = operation.message.payload;
            }
            if (payloadSchema != null) {
                const schemaConverter = new SchemaConverter({
                    id: operation.operationId ?? defaultId,
                    breadcrumbs: [...this.breadcrumbs, breadcrumbName],
                    schema: payloadSchema
                });
                convertedSchema = await schemaConverter.convert({ context, errorCollector });
            }
        }

        if (convertedSchema != null) {
            this.inlinedTypes = {
                ...this.inlinedTypes,
                ...convertedSchema.inlinedTypes,
                [convertedSchema.typeDeclaration.name.typeId]: convertedSchema.typeDeclaration
            };
            const convertedTypeDeclaration = convertedSchema.typeDeclaration;

            const typeReference = FernIr.TypeReference.named({
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                name: convertedTypeDeclaration.name.name,
                typeId: convertedTypeDeclaration.name.typeId,
                default: undefined,
                inline: false
            });

            const body = FernIr.WebSocketMessageBody.reference({
                bodyType: typeReference,
                docs: operation.description
            });

            return {
                type: convertedTypeDeclaration.name.typeId,
                displayName: convertedTypeDeclaration.name.name.originalName,
                origin: "server",
                body,
                availability: await context.getAvailability({
                    node: operation,
                    breadcrumbs: this.breadcrumbs,
                    errorCollector
                }),
                docs: operation.description
            };
        }

        return undefined;
    }

    private async convertQueryParameters({
        context,
        errorCollector,
        queryParameters
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
        queryParameters: QueryParameter[];
    }): Promise<void> {
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
                    in: "query",
                    description: parameter.description
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

    private async convertHeaders({
        context,
        errorCollector,
        headers
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
        headers: HttpHeader[];
    }): Promise<void> {
        if (this.channel.bindings?.ws?.headers != null) {
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
                        schema: resolvedHeader,
                        description: "description" in resolvedHeader ? resolvedHeader.description : undefined
                    }
                });

                const convertedParameter = await parameterConverter.convert({ context, errorCollector });
                if (convertedParameter != null && convertedParameter.type === "header") {
                    this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                    headers.push(convertedParameter.parameter);
                }
            }
        }
    }

    private async convertBindingQueryParameters({
        context,
        errorCollector,
        queryParameters
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
        queryParameters: QueryParameter[];
    }): Promise<void> {
        if (this.channel.bindings?.ws?.query != null) {
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
                        schema: resolvedQuery,
                        description: "description" in resolvedQuery ? resolvedQuery.description : undefined
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
}
