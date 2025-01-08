import { RawSchemas } from "@fern-api/fern-definition-schema";
import { WebsocketChannel } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { buildHeader } from "./buildHeader";
import { buildPathParameter } from "./buildPathParameter";
import { buildQueryParameter } from "./buildQueryParameter";
import { buildTypeReference } from "./buildTypeReference";
import { buildWebsocketSessionExample } from "./buildWebsocketSessionExample";
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
    const convertedChannel: RawSchemas.WebSocketChannelSchema = {
        path: channel.path,
        auth: false
    };

    if (channel.audiences != null && channel.audiences.length > 0) {
        convertedChannel.audiences = channel.audiences;
    }

    if (channel.summary != null) {
        convertedChannel["display-name"] = channel.summary;
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

    if (channel.subscribe != null) {
        context.builder.addChannelMessage(declarationFile, {
            messageId: "subscribe",
            message: {
                origin: "server",
                body: buildTypeReference({
                    schema: channel.subscribe,
                    context,
                    fileContainingReference: declarationFile,
                    namespace: maybeChannelNamespace,
                    declarationDepth: 0
                })
            }
        });
    }

    if (channel.publish != null) {
        context.builder.addChannelMessage(declarationFile, {
            messageId: "publish",
            message: {
                origin: "client",
                body: buildTypeReference({
                    schema: channel.publish,
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
