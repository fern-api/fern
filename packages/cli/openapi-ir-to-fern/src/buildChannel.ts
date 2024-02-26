import { RelativeFilePath } from "@fern-api/fs-utils";
import { WebsocketChannel } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { buildHeader } from "./buildHeader";
import { buildQueryParameter } from "./buildQueryParameter";
import { buildTypeReference } from "./buildTypeReference";
import { buildWebsocketSessionExample } from "./buildWebsocketSessionExample";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

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

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    if (channel.handshake.queryParameters.length > 0) {
        for (const queryParameter of channel.handshake.queryParameters) {
            const convertedQueryParameter = buildQueryParameter({
                queryParameter,
                context,
                fileContainingReference: declarationFile
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
            const headerSchema = buildHeader({ header, context, fileContainingReference: declarationFile });
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
                    fileContainingReference: declarationFile
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
                    fileContainingReference: declarationFile
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
