import { HttpHeader, PathParameter, QueryParameter, WebSocketMessage, WebSocketMessageBody } from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { Converters } from "@fern-api/v3-importer-commons";
import { OpenAPIV3 } from "openapi-types";
import { AbstractChannelConverter } from "../../converters/AbstractChannelConverter";
import { ParameterConverter } from "../../converters/ParameterConverter";
import { DisplayNameExtension } from "../../extensions/x-fern-display-name";
import { AsyncAPIV3 } from "..";
import { ChannelParameter } from "../types";

export declare namespace ChannelConverter3_0 {
    export interface Args extends AbstractChannelConverter.Args<AsyncAPIV3.ChannelV3> {
        operations: Record<string, AsyncAPIV3.Operation>;
    }
}

type ChannelParameterLocation = {
    type: "header" | "path" | "query";
    parameterKey: string;
};

const LOCATION_PREFIX = "$message.";
const CHANNEL_REFERENCE_PREFIX = "#/channels/";
const SERVER_REFERENCE_PREFIX = "#/servers/";

export class ChannelConverter3_0 extends AbstractChannelConverter<AsyncAPIV3.ChannelV3> {
    private readonly operations: Record<string, AsyncAPIV3.Operation>;
    protected inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

    constructor({ context, breadcrumbs, websocketGroup, channel, channelPath, operations }: ChannelConverter3_0.Args) {
        super({ context, breadcrumbs, websocketGroup, channel, channelPath });
        this.operations = operations;
    }

    public convert(): AbstractChannelConverter.Output | undefined {
        const pathParameters: PathParameter[] = [];
        const queryParameters: QueryParameter[] = [];
        const headers: HttpHeader[] = [];

        const displayNameExtension = new DisplayNameExtension({
            breadcrumbs: this.breadcrumbs,
            channel: this.channel,
            context: this.context
        });
        const displayName = displayNameExtension.convert() ?? this.websocketGroup?.join(".") ?? this.channelPath;

        if (this.channel.parameters) {
            this.convertChannelParameters({
                pathParameters,
                queryParameters,
                headers,
                channelPath: this.channelPath
            });
        }

        const channelOperations = Object.entries(this.operations).reduce<Record<string, AsyncAPIV3.Operation>>(
            (acc, [operationId, operation]) => {
                try {
                    if (this.getChannelPathFromOperation(operation) === this.channelPath) {
                        acc[operationId] = operation;
                    }
                    // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
                } catch {}
                return acc;
            },
            {}
        );

        const messages: WebSocketMessage[] = [];

        for (const [operationId, operation] of Object.entries(channelOperations)) {
            for (const message of operation.messages) {
                const resolved = this.context.convertReferenceToTypeReference({ reference: message });
                if (resolved.ok) {
                    const messageBody = WebSocketMessageBody.reference({
                        bodyType: resolved.reference,
                        docs: operation.description
                    });
                    messages.push({
                        type: operationId,
                        displayName: operationId,
                        origin: operation.action === "send" ? "client" : "server",
                        body: messageBody,
                        availability: this.context.getAvailability({
                            node: operation,
                            breadcrumbs: this.breadcrumbs
                        }),
                        docs: operation.description
                    });
                }
            }
        }

        if (this.channel.messages != null) {
            for (const [messageId, messageOrRef] of Object.entries(this.channel.messages)) {
                const resolvedMessage = this.context.resolveMaybeReference<AsyncAPIV3.ChannelMessage>({
                    schemaOrReference: messageOrRef,
                    breadcrumbs: [...this.breadcrumbs, "messages", messageId]
                });
                if (resolvedMessage != null && "$ref" in resolvedMessage.payload) {
                    const resolved = this.context.convertReferenceToTypeReference({
                        reference: resolvedMessage.payload
                    });
                    if (resolved.ok) {
                        const messageBody = WebSocketMessageBody.reference({
                            bodyType: resolved.reference,
                            docs: resolvedMessage.description
                        });
                        messages.push({
                            type: messageId,
                            displayName: resolvedMessage.name ?? messageId,
                            origin: "client",
                            body: messageBody,
                            availability: undefined,
                            docs: resolvedMessage.description
                        });
                    }
                }
            }
        }

        const baseUrl =
            this.resolveChannelServersFromReference(this.channel.servers ?? []) ??
            Object.keys(this.context.spec.servers ?? {})[0];

        const channelAddress = this.transformToValidPath(this.channel.address ?? this.channelPath);
        const path = constructHttpPath(channelAddress);

        const audiences =
            this.context.getAudiences({
                operation: this.channel,
                breadcrumbs: this.breadcrumbs
            }) ?? [];

        return {
            channel: {
                name: this.context.casingsGenerator.generateName(displayName),
                displayName,
                baseUrl,
                path,
                auth: false,
                headers,
                queryParameters,
                pathParameters,
                messages,
                availability: this.context.getAvailability({
                    node: this.channel,
                    breadcrumbs: this.breadcrumbs
                }),
                docs: this.channel.description,
                examples: [],
                v2Examples: {
                    autogeneratedExamples: {},
                    userSpecifiedExamples: this.convertExamples({
                        fullPath: channelAddress,
                        baseUrl,
                        asyncApiVersion: "v3"
                    })
                }
            },
            audiences,
            inlinedTypes: this.inlinedTypes
        };
    }

    private convertChannelParameters({
        pathParameters,
        queryParameters,
        headers,
        channelPath
    }: {
        pathParameters: PathParameter[];
        queryParameters: QueryParameter[];
        headers: HttpHeader[];
        channelPath: string;
    }): void {
        for (const parameter of Object.values(this.channel.parameters ?? {})) {
            const parameterObject = this.context.resolveMaybeReference<ChannelParameter>({
                schemaOrReference: parameter,
                breadcrumbs: [...this.breadcrumbs, "parameters"]
            });
            if (parameterObject == null) {
                continue;
            }
            const location = this.convertChannelParameterLocation(parameterObject.location);
            if (location == null) {
                continue;
            }
            const { type, parameterKey } = location;
            const parameterConverter = new ParameterConverter({
                context: this.context,
                breadcrumbs: this.breadcrumbs,
                parameter: {
                    ...parameterObject,
                    name: parameterKey,
                    in: type
                },
                parameterNamePrefix: this.channelPath
            });
            const convertedParameter = parameterConverter.convert();
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

    private convertChannelParameterLocation(location: string): ChannelParameterLocation | undefined {
        try {
            const [messageType, parameterKey] = location.split("#/");
            if (messageType == null || parameterKey == null) {
                this.context.errorCollector.collect({
                    message: `Invalid location format: ${location}; unable to parse message type and parameter key`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            if (!messageType.startsWith(LOCATION_PREFIX)) {
                this.context.errorCollector.collect({
                    message: `Invalid location format: ${location}; expected ${LOCATION_PREFIX} prefix`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            const type = messageType.substring(LOCATION_PREFIX.length);
            if (type !== "header" && type !== "path" && type !== "payload") {
                this.context.errorCollector.collect({
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
            this.context.errorCollector.collect({
                message:
                    `Invalid location format: ${location}; see here for more details: ` +
                    "https://www.asyncapi.com/docs/reference/specification/v3.0.0#runtimeExpression",
                path: this.breadcrumbs
            });
            return undefined;
        }
    }

    private resolveChannelServersFromReference(servers: OpenAPIV3.ReferenceObject[]): string | undefined {
        if (servers == null || servers.length === 0 || servers[0] == null) {
            return undefined;
        }
        // TODO (Eden): We should eventually support multiple servers
        const serverRef = servers[0];
        if (!serverRef.$ref.startsWith(SERVER_REFERENCE_PREFIX)) {
            this.context.errorCollector.collect({
                message: `Failed to resolve server name from server ref ${serverRef.$ref}`,
                path: this.breadcrumbs
            });
            return undefined;
        }
        const serverName = serverRef.$ref.substring(SERVER_REFERENCE_PREFIX.length);
        if (serverName == null) {
            this.context.errorCollector.collect({
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
