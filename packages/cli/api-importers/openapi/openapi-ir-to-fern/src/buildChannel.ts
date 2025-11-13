import { RawSchemas } from "@fern-api/fern-definition-schema";
import { WebsocketChannel } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildHeader } from "./buildHeader";
import { buildPathParameter } from "./buildPathParameter";
import { buildQueryParameter } from "./buildQueryParameter";
import { buildTypeReference } from "./buildTypeReference";
import { buildWebsocketSessionExample } from "./buildWebsocketSessionExample";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { generateWebsocketUrlId } from "./utils/generateUrlId";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup";

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
    // Generate URL ID based on feature flag:
    // - If groupEnvironmentsByHost is enabled, look up the collision-aware URL ID from the map
    // - Otherwise, use simple server name for backward compatibility
    const urlId =
        firstServer != null
            ? context.options.groupEnvironmentsByHost
                ? (context.getUrlId(firstServer.url) ?? generateWebsocketUrlId(firstServer.name, firstServer.url, true))
                : firstServer.name
            : undefined;

    context.logger.debug(
        `[buildChannel] Channel path="${channel.path}", server name="${firstServer?.name}", server url="${firstServer?.url}", resolved urlId="${urlId}" (from collision map: ${context.getUrlId(firstServer?.url ?? "") != null})`
    );

    const convertedChannel: RawSchemas.WebSocketChannelSchema = {
        path: channel.path,
        url: urlId,
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
