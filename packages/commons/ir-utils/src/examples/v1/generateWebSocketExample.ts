import {
    ExampleWebSocketMessageBody,
    ExampleWebSocketSession,
    IntermediateRepresentation,
    TypeDeclaration,
    TypeId,
    WebSocketChannel,
    WebSocketMessage
} from "@fern-api/ir-sdk";

import { ExampleGenerationResult } from "./ExampleGenerationResult";
import {
    generateHeaderExamples,
    generatePathParameterExamples,
    generateQueryParameterExamples
} from "./generateParameterExamples";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample";

export declare namespace generateWebSocketExample {
    interface Args {
        ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
        channel: WebSocketChannel;
        typeDeclarations: Record<TypeId, TypeDeclaration>;
        skipOptionalRequestProperties: boolean;
    }
}

export function generateWebSocketExample({
    ir,
    channel,
    typeDeclarations,
    skipOptionalRequestProperties
}: generateWebSocketExample.Args): ExampleGenerationResult<ExampleWebSocketSession> {
    const result: Omit<ExampleWebSocketSession, "url"> = {
        name: undefined,
        pathParameters: [],
        headers: [],
        queryParameters: [],
        messages: [],
        docs: undefined
    };

    const channelPathResult = generatePathParameterExamples(channel.pathParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1
    });
    if (channelPathResult.type === "failure") {
        return channelPathResult;
    }
    result.pathParameters.push(...channelPathResult.example);

    const rootPathResult = generatePathParameterExamples(ir.pathParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1
    });
    if (rootPathResult.type === "failure") {
        return rootPathResult;
    }
    result.pathParameters.push(...rootPathResult.example);

    // QUERY PARAMETERS
    const queryParamsResult = generateQueryParameterExamples(channel.queryParameters, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 10
    });
    if (queryParamsResult.type === "failure") {
        return queryParamsResult;
    }
    result.queryParameters = queryParamsResult.example;

    // HEADERS
    const channelHeaderResult = generateHeaderExamples(channel.headers, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1
    });
    if (channelHeaderResult.type === "failure") {
        return channelHeaderResult;
    }
    result.headers.push(...channelHeaderResult.example);

    const irHeaderResult = generateHeaderExamples(ir.headers, {
        typeDeclarations,
        skipOptionalRequestProperties,
        maxDepth: 1
    });
    if (irHeaderResult.type === "failure") {
        return irHeaderResult;
    }
    result.headers.push(...irHeaderResult.example);

    const sendMessages = channel.messages.filter((message) => message.origin === "client");
    const sendMessage = sendMessages[0];
    if (sendMessage != null) {
        const generatedExampleMessage = generateExampleMessage({
            message: sendMessage,
            typeDeclarations,
            skipOptionalRequestProperties
        });
        if (generatedExampleMessage != null) {
            result.messages.push({
                type: sendMessage.type,
                body: generatedExampleMessage
            });
        }
    }
    const receiveMessages = channel.messages.filter((message) => message.origin === "server");
    const receiveMessage = receiveMessages[0];
    if (receiveMessage != null) {
        const generatedExampleMessage = generateExampleMessage({
            message: receiveMessage,
            typeDeclarations,
            skipOptionalRequestProperties
        });
        if (generatedExampleMessage != null) {
            result.messages.push({
                type: receiveMessage.type,
                body: generatedExampleMessage
            });
        }
    }

    return {
        type: "success",
        example: {
            ...result,
            url: getUrlForExample(channel, result)
        },
        jsonExample: undefined // dummy
    };
}

function generateExampleMessage({
    message,
    typeDeclarations,
    skipOptionalRequestProperties
}: {
    message: WebSocketMessage;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
}): ExampleWebSocketMessageBody | undefined {
    if (message.body.type === "inlinedBody") {
        return undefined;
    }
    const generatedExampleMessage = generateTypeReferenceExample({
        currentDepth: 0,
        maxDepth: 10,
        typeDeclarations,
        typeReference: message.body.bodyType,
        skipOptionalProperties: skipOptionalRequestProperties
    });
    if (generatedExampleMessage.type === "success") {
        return ExampleWebSocketMessageBody.reference(generatedExampleMessage.example);
    }
    return undefined;
}

function getUrlForExample(channel: WebSocketChannel, example: Omit<ExampleWebSocketSession, "id" | "url">): string {
    const pathParameters: Record<string, string> = {};
    [...example.pathParameters].forEach((examplePathParameter) => {
        const value = examplePathParameter.value.jsonExample;
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        pathParameters[examplePathParameter.name.originalName] = stringValue;
    });
    const url =
        channel.path.head +
        channel.path.parts
            .map((pathPart) => encodeURIComponent(`${pathParameters[pathPart.pathParameter]}`) + pathPart.tail)
            .join("");
    return url.startsWith("/") || url === "" ? url : `/${url}`;
}
