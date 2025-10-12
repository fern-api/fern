import { RawSchemas } from "@fern-api/fern-definition-schema";
import { WebsocketChannel } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildHeader } from "./buildHeader";
import { buildPathParameter } from "./buildPathParameter";
import { buildQueryParameter } from "./buildQueryParameter";
import { buildTypeReference } from "./buildTypeReference";
import { buildWebsocketSessionExample } from "./buildWebsocketSessionExample";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup";

/**
 * Generate a unique URL ID for a WebSocket channel by combining server name with URL path.
 * This prevents collisions when multiple AsyncAPI files use the same server name (e.g., "prod").
 */
function generateUniqueWebSocketUrlId(serverName: string | undefined, serverUrl: string): string {
    // Extract the last path segment from the URL
    let urlPathSegment: string | undefined;
    try {
        const url = new URL(serverUrl);
        const pathSegments = url.pathname.split("/").filter((s) => s.length > 0);
        if (pathSegments.length > 0) {
            urlPathSegment = pathSegments[pathSegments.length - 1];
        }
    } catch {
        // Invalid URL, continue without path segment
    }

    // If we have both server name and path segment, combine them
    if (serverName != null && urlPathSegment != null) {
        return `${serverName}_${urlPathSegment}`;
    }

    // If we only have a path segment, use it alone
    if (urlPathSegment != null) {
        return urlPathSegment;
    }

    // If we only have a server name, use it alone
    if (serverName != null) {
        return serverName;
    }

    // Fallback
    return "websocket";
}

export function buildChannel({
    channel,
    context,
    declarationFile
}: {
    channel: WebsocketChannel;
    context: OpenApiIrConverterContext;
    /* The file the type declaration will be added to */
    declarationFile: RelativeFilePath;
}): void {
    const firstServer = channel.servers[0];
    const uniqueUrlId =
        firstServer != null ? generateUniqueWebSocketUrlId(firstServer.name, firstServer.url) : undefined;

    const convertedChannel: RawSchemas.WebSocketChannelSchema = {
        path: channel.path,
        // Use unique URL ID that combines server name + path segment
        url: uniqueUrlId,
        auth: false
    };

    if (channel.audiences != null && channel.audiences.length > 0) {
        convertedChannel.audiences = channel.audiences;
    }

    if (channel.summary != null) {
        convertedChannel["display-name"] = channel.summary;
    }

    if (channel.description != null) {
        convertedChannel.docs = channel.description;
    }

    const maybeChannelNamespace = getNamespaceFromGroup(channel.groupName);

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    if (channel.handshake.pathParameters.length > 0) {
        for (const pathParameter of channel.handshake.pathParameters) {
            pathParameters[pathParameter.name] = buildPathParameter({
                pathParameter,
                context,
                fileContainingReference: declarationFile,
                namespace: maybeChannelNamespace
            });
        }
    }
    if (Object.keys(pathParameters).length > 0) {
        convertedChannel["path-parameters"] = pathParameters;
    }

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    if (channel.handshake.queryParameters.length > 0) {
        for (const queryParameter of channel.handshake.queryParameters) {
            const convertedQueryParameter = buildQueryParameter({
                queryParameter,
                context,
                fileContainingReference: declarationFile,
                namespace: maybeChannelNamespace
            });
            if (convertedQueryParameter == null) {
                // TODO(dsinghvi): HACKHACK we are just excluding certain query params from the SDK
                continue;
            }
            queryParameters[queryParameter.name] = convertedQueryParameter;
        }
    }
    if (Object.keys(queryParameters).length > 0) {
        convertedChannel["query-parameters"] = queryParameters;
    }

    const headers: Record<string, RawSchemas.HttpHeaderSchema> = {};
    if (channel.handshake.headers.length > 0) {
        for (const header of channel.handshake.headers) {
            const headerSchema = buildHeader({
                header,
                context,
                fileContainingReference: declarationFile,
                namespace: maybeChannelNamespace
            });
            headers[header.name] = headerSchema;
        }
    }
    if (Object.keys(headers).length > 0) {
        convertedChannel.headers = headers;
    }

    context.builder.addChannel(declarationFile, {
        channel: convertedChannel
    });

    for (const message of channel.messages) {
        context.builder.addChannelMessage(declarationFile, {
            messageId: message.name,
            message: {
                origin: message.origin,
                body: buildTypeReference({
                    schema: message.body,
                    context,
                    fileContainingReference: declarationFile,
                    namespace: maybeChannelNamespace,
                    declarationDepth: 0
                })
            }
        });
    }

    for (const example of channel.examples) {
        const websocketExample = buildWebsocketSessionExample({ context, websocketExample: example });
        context.builder.addChannelExample(declarationFile, {
            example: websocketExample
        });
    }
}
