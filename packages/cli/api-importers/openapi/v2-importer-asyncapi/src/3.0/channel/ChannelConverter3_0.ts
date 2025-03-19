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

import { AsyncAPIV3 } from "..";
import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { ParameterConverter } from "../../core/channel/ParameterConverter";

export declare namespace ChannelConverter3_0 {
    export interface Args extends AbstractConverter.Args {
        channel: AsyncAPIV3.ChannelV3;
        channelPath: string;
        operations: Record<string, AsyncAPIV3.Operation>;
    }

    export interface Output {
        channel: WebSocketChannel;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

type ChannelParameterLocation = {
    type: "header" | "path" | "query";
    parameterKey: string;
};

const LOCATION_PREFIX = "$message.";
const CHANNEL_REFERENCE_PREFIX = "#/channels/";
const SERVER_REFERENCE_PREFIX = "#/servers/";

export class ChannelConverter3_0 extends AbstractConverter<AsyncAPIConverterContext, ChannelConverter3_0.Output> {
    private readonly channel: AsyncAPIV3.ChannelV3;
    private readonly channelPath: string;
    private readonly operations: Record<string, AsyncAPIV3.Operation>;
    protected inlinedTypes: Record<string, TypeDeclaration> = {};

    constructor({ breadcrumbs, channel, channelPath, operations }: ChannelConverter3_0.Args) {
        super({ breadcrumbs });
        this.channel = channel;
        this.channelPath = channelPath;
        this.operations = operations;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<ChannelConverter3_0.Output | undefined> {
        const pathParameters: PathParameter[] = [];
        const queryParameters: QueryParameter[] = [];
        const headers: HttpHeader[] = [];

        if (this.channel.parameters) {
            await this.convertChannelParameters({
                context,
                errorCollector,
                pathParameters,
                queryParameters,
                headers
            });
        }

        const channelOperations = Object.entries(this.operations).reduce<Record<string, AsyncAPIV3.Operation>>(
            (acc, [operationId, operation]) => {
                try {
                    if (this.getChannelPathFromOperation(operation) === this.channelPath) {
                        acc[operationId] = operation;
                    }
                } catch {}
                return acc;
            },
            {}
        );

        const messages: WebSocketMessage[] = [];

        for (const [operationId, operation] of Object.entries(channelOperations)) {
            for (const message of operation.messages) {
                const resolved = await context.convertReferenceToTypeReference(message);
                if (resolved.ok) {
                    const messageBody = FernIr.WebSocketMessageBody.reference({
                        bodyType: resolved.reference,
                        docs: operation.description
                    });
                    messages.push({
                        type: operationId,
                        displayName: operationId,
                        origin: operation.action === "send" ? "client" : "server",
                        body: messageBody,
                        availability: await context.getAvailability({
                            node: operation,
                            breadcrumbs: this.breadcrumbs,
                            errorCollector
                        }),
                        docs: operation.description
                    });
                }
            }
        }

        const baseUrl =
            this.resolveChannelServersFromReference(this.channel.servers ?? [], errorCollector) ??
            Object.keys(context.spec.servers ?? {})[0];

        return {
            channel: {
                name: context.casingsGenerator.generateName(this.channelPath),
                displayName: this.channelPath,
                baseUrl,
                path: {
                    head: this.channel.address ?? this.channelPath,
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

    private async convertChannelParameters({
        context,
        errorCollector,
        pathParameters,
        queryParameters,
        headers
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
        pathParameters: PathParameter[];
        queryParameters: QueryParameter[];
        headers: HttpHeader[];
    }): Promise<void> {
        for (const parameter of Object.values(this.channel.parameters ?? {})) {
            let parameterObject: OpenAPIV3.ParameterObject = parameter;
            if (context.isReferenceObject(parameter)) {
                const resolvedReference = await context.resolveReference<OpenAPIV3_1.ParameterObject>(parameter);
                if (resolvedReference.resolved) {
                    parameterObject = resolvedReference.value;
                } else {
                    continue;
                }
            }
            const location = this.convertChannelParameterLocation(parameter.location, errorCollector);
            if (location == null) {
                continue;
            }
            const { type, parameterKey } = location;
            const parameterConverter = new ParameterConverter({
                breadcrumbs: this.breadcrumbs,
                parameter: {
                    ...parameterObject,
                    name: parameterKey,
                    in: type,
                    required: true
                }
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

    private convertChannelParameterLocation(
        location: string,
        errorCollector: ErrorCollector
    ): ChannelParameterLocation | undefined {
        try {
            const [messageType, parameterKey] = location.split("#/");
            if (messageType == null || parameterKey == null) {
                errorCollector.collect({
                    message: `Invalid location format: ${location}; unable to parse message type and parameter key`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            if (!messageType.startsWith(LOCATION_PREFIX)) {
                errorCollector.collect({
                    message: `Invalid location format: ${location}; expected ${LOCATION_PREFIX} prefix`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            const type = messageType.substring(LOCATION_PREFIX.length);
            if (type !== "header" && type !== "path" && type !== "payload") {
                errorCollector.collect({
                    message: `Invalid message type: ${type}. Must be one of: header, path, payload`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            if (type === "payload") {
                return { type: "query", parameterKey };
            }
            return { type, parameterKey };
        } catch (error) {
            errorCollector.collect({
                message:
                    `Invalid location format: ${location}; see here for more details: ` +
                    "https://www.asyncapi.com/docs/reference/specification/v3.0.0#runtimeExpression",
                path: this.breadcrumbs
            });
            return undefined;
        }
    }

    private resolveChannelServersFromReference(
        servers: OpenAPIV3.ReferenceObject[],
        errorCollector: ErrorCollector
    ): string | undefined {
        if (servers == null || servers.length === 0 || servers[0] == null) {
            return undefined;
        }
        // TODO (Eden): We should eventually support multiple servers
        const serverRef = servers[0];
        if (!serverRef.$ref.startsWith(SERVER_REFERENCE_PREFIX)) {
            errorCollector.collect({
                message: `Failed to resolve server name from server ref ${serverRef.$ref}`,
                path: this.breadcrumbs
            });
            return undefined;
        }
        const serverName = serverRef.$ref.substring(SERVER_REFERENCE_PREFIX.length);
        if (serverName == null) {
            errorCollector.collect({
                message: `Failed to find server with name ${serverName}`,
                path: this.breadcrumbs
            });
            return undefined;
        }
        return serverName;
    }

    private getChannelPathFromOperation(operation: AsyncAPIV3.Operation): string {
        if (!operation.channel.$ref.startsWith(CHANNEL_REFERENCE_PREFIX)) {
            throw new Error(`Failed to resolve channel path from operation ${operation.channel.$ref}`);
        }
        return operation.channel.$ref.substring(CHANNEL_REFERENCE_PREFIX.length);
    }
}
