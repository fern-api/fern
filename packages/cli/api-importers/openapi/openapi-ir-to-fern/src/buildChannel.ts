import { RawSchemas } from "@fern-api/fern-definition-schema";
import { WebsocketChannel } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildHeader } from "./buildHeader.js";
import { buildPathParameter } from "./buildPathParameter.js";
import { buildQueryParameter } from "./buildQueryParameter.js";
import { buildTypeReference } from "./buildTypeReference.js";
import { buildWebsocketSessionExample } from "./buildWebsocketSessionExample.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { generateWebsocketUrlId } from "./utils/generateUrlId.js";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup.js";

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
    // Don't set a urlId when it would result in a single-URL environment.
    // This happens when there are only WebSocket servers (no HTTP servers) and only one
    // WebSocket server — buildEnvironments creates a single-URL environment in that case,
    // so a baseUrlId on the channel would be meaningless and can cause generator issues.
    const hasSingleWebsocketServerOnly = context.ir.servers.length === 0 && context.ir.websocketServers.length <= 1;
    // Generate URL ID based on feature flag:
    // - If groupEnvironmentsByHost is enabled, look up the collision-aware URL ID from the map
    // - Otherwise, use simple server name for backward compatibility
    // - Skip entirely for single-WebSocket-server-only specs (no multi-URL environment)
    const urlId =
        firstServer != null && !hasSingleWebsocketServerOnly
            ? context.options.groupEnvironmentsByHost
                ? (context.getUrlId(firstServer.url) ?? generateWebsocketUrlId(firstServer.name, firstServer.url, true))
                : firstServer.name
            : undefined;

    context.logger.debug(
        `[buildChannel] Channel path="${channel.path}", server name="${firstServer?.name}", server url="${firstServer?.url}", resolved urlId="${urlId}" (from collision map: ${context.getUrlId(firstServer?.url ?? "") != null})`
    );

    // Build path with SDK names (using parameterNameOverride when available)
    let convertedPath = channel.path;
    for (const pathParameter of channel.handshake.pathParameters) {
        if (pathParameter.parameterNameOverride != null) {
            convertedPath = convertedPath.replace(
                `{${pathParameter.name}}`,
                `{${pathParameter.parameterNameOverride}}`
            );
        }
    }

    const hasAuth = context.authOverrides?.auth != null;

    const convertedChannel: RawSchemas.WebSocketChannelSchema = {
        path: convertedPath,
        url: urlId,
        auth: hasAuth
    };

    if (channel.audiences != null && channel.audiences.length > 0) {
        convertedChannel.audiences = channel.audiences;
    }

    if (channel.summary != null) {
        convertedChannel["display-name"] = channel.summary;
    }

    if (channel.connectMethodName != null) {
        convertedChannel["connect-method-name"] = channel.connectMethodName;
    }

    if (channel.description != null) {
        convertedChannel.docs = channel.description;
    }

    const maybeChannelNamespace = getNamespaceFromGroup(channel.groupName);

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    if (channel.handshake.pathParameters.length > 0) {
        for (const pathParameter of channel.handshake.pathParameters) {
            // Use SDK name (parameterNameOverride) as the key if available
            const parameterKey = pathParameter.parameterNameOverride ?? pathParameter.name;
            pathParameters[parameterKey] = buildPathParameter({
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
        const messageSchema: RawSchemas.WebSocketChannelMessageSchema = {
            origin: message.origin,
            body: buildTypeReference({
                schema: message.body,
                context,
                fileContainingReference: declarationFile,
                namespace: maybeChannelNamespace,
                declarationDepth: 0
            })
        };

        if (message.displayName != null) {
            messageSchema["display-name"] = message.displayName;
        }

        if (message.methodName != null) {
            messageSchema["method-name"] = message.methodName;
        }

        context.builder.addChannelMessage(declarationFile, {
            messageId: message.name,
            message: messageSchema
        });
    }

    for (const example of channel.examples) {
        const websocketExample = buildWebsocketSessionExample({ context, websocketExample: example });
        context.builder.addChannelExample(declarationFile, {
            example: websocketExample
        });
    }
}
