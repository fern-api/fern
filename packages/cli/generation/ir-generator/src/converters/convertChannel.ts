import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    ExampleHeader,
    ExampleInlinedRequestBodyProperty,
    ExamplePathParameter,
    ExampleQueryParameterShape,
    ExampleWebSocketMessage,
    ExampleWebSocketMessageBody,
    ExampleWebSocketSession,
    Name,
    PathParameterLocation,
    WebSocketChannel,
    WebSocketMessage,
    WebSocketMessageBody
} from "@fern-api/ir-sdk";

import { getHeaderName } from "..";
import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { VariableResolver } from "../resolvers/VariableResolver";
import { getEndpointPathParameters } from "../utils/getEndpointPathParameters";
import { parseTypeName } from "../utils/parseTypeName";
import { convertAvailability, convertDeclaration } from "./convertDeclaration";
import { constructHttpPath } from "./services/constructHttpPath";
import { convertHttpHeader, convertPathParameters, resolvePathParameterOrThrow } from "./services/convertHttpService";
import { getQueryParameterName } from "./services/convertQueryParameter";
import {
    convertTypeReferenceExample,
    getOriginalTypeDeclarationForPropertyFromExtensions
} from "./type-declarations/convertExampleType";
import { getExtensionsAsList, getPropertyName } from "./type-declarations/convertObjectTypeDeclaration";

export function convertChannel({
    channel,
    typeResolver,
    exampleResolver,
    variableResolver,
    file,
    workspace
}: {
    channel: RawSchemas.WebSocketChannelSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    variableResolver: VariableResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): WebSocketChannel {
    const messages: WebSocketMessage[] = [];
    for (const [messageId, message] of Object.entries(channel.messages ?? {})) {
        messages.push({
            type: messageId,
            availability: convertAvailability(message.availability),
            docs: message.docs,
            origin: message.origin,
            body: convertMessageSchema({ body: message.body, file }),
            displayName: message["display-name"]
        });
    }
    return {
        availability: convertAvailability(channel.availability),
        path: constructHttpPath(channel.path),
        auth: channel.auth,
        // since there's only 1 channel per file, we can use the file name as the channel's name
        name: file.fernFilepath.file ?? file.casingsGenerator.generateName(channel["display-name"] ?? channel.path),
        displayName: channel["display-name"],
        headers:
            channel.headers != null
                ? Object.entries(channel.headers).map(([headerKey, header]) =>
                      convertHttpHeader({ headerKey, header, file })
                  )
                : [],
        docs: channel.docs,
        pathParameters:
            channel["path-parameters"] != null
                ? convertPathParameters({
                      pathParameters: channel["path-parameters"],
                      location: PathParameterLocation.Endpoint,
                      file,
                      variableResolver
                  })
                : [],
        queryParameters:
            channel["query-parameters"] != null
                ? Object.entries(channel["query-parameters"]).map(([queryParameterKey, queryParameter]) => {
                      const { name } = getQueryParameterName({ queryParameterKey, queryParameter });
                      const valueType = file.parseTypeReference(queryParameter);
                      return {
                          ...convertDeclaration(queryParameter),
                          name: file.casingsGenerator.generateNameAndWireValue({
                              wireValue: queryParameterKey,
                              name
                          }),
                          valueType,
                          allowMultiple:
                              typeof queryParameter !== "string" && queryParameter["allow-multiple"] != null
                                  ? queryParameter["allow-multiple"]
                                  : false
                      };
                  })
                : [],
        messages: Object.values(messages),
        examples: (channel.examples ?? []).map((example): ExampleWebSocketSession => {
            const convertedPathParameters = convertChannelPathParameters({
                channel,
                example,
                typeResolver,
                exampleResolver,
                variableResolver,
                file,
                workspace
            });
            return {
                name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
                docs: example.docs,
                url: buildUrl({ channel, example, pathParams: convertedPathParameters }),
                ...convertedPathParameters,
                ...convertHeaders({ channel, example, typeResolver, exampleResolver, file, workspace }),
                queryParameters:
                    example["query-parameters"] != null
                        ? Object.entries(example["query-parameters"]).map(([wireKey, value]) => {
                              const queryParameterDeclaration = channel["query-parameters"]?.[wireKey];
                              if (queryParameterDeclaration == null) {
                                  throw new Error(`Query parameter ${wireKey} does not exist`);
                              }
                              return {
                                  name: file.casingsGenerator.generateNameAndWireValue({
                                      name: getQueryParameterName({
                                          queryParameterKey: wireKey,
                                          queryParameter: queryParameterDeclaration
                                      }).name,
                                      wireValue: wireKey
                                  }),
                                  value: convertTypeReferenceExample({
                                      example: value,
                                      rawTypeBeingExemplified:
                                          typeof queryParameterDeclaration === "string"
                                              ? queryParameterDeclaration
                                              : queryParameterDeclaration.type,
                                      typeResolver,
                                      exampleResolver,
                                      fileContainingRawTypeReference: file,
                                      fileContainingExample: file,
                                      workspace
                                  }),
                                  shape: getQueryParamaterDeclationShape({ queryParameter: queryParameterDeclaration })
                              };
                          })
                        : [],
                messages: example.messages.map((messageExample): ExampleWebSocketMessage => {
                    const message = channel.messages?.[messageExample.type];
                    if (message == null) {
                        throw new Error(`Message ${messageExample.type} does not exist`);
                    }
                    return {
                        type: messageExample.type,
                        body: convertExampleWebSocketMessageBody({
                            message,
                            example: messageExample.body,
                            typeResolver,
                            exampleResolver,
                            file,
                            workspace
                        })
                    };
                })
            };
        })
    };
}

function getQueryParamaterDeclationShape({ queryParameter }: { queryParameter: RawSchemas.HttpQueryParameterSchema }) {
    const isAllowMultiple =
        typeof queryParameter !== "string" && queryParameter["allow-multiple"] != null
            ? queryParameter["allow-multiple"]
            : false;
    return isAllowMultiple ? ExampleQueryParameterShape.exploded() : ExampleQueryParameterShape.single();
}

function convertExampleWebSocketMessageBody({
    message,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    message: RawSchemas.WebSocketChannelMessageSchema;
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): ExampleWebSocketMessageBody {
    if (!isInlineMessageBody(message.body)) {
        return ExampleWebSocketMessageBody.reference(
            convertTypeReferenceExample({
                example,
                rawTypeBeingExemplified: typeof message.body !== "string" ? message.body.type : message.body,
                typeResolver,
                exampleResolver,
                fileContainingRawTypeReference: file,
                fileContainingExample: file,
                workspace
            })
        );
    }

    if (!isPlainObject(example)) {
        throw new Error("Example must be an object");
    }

    const exampleProperties: ExampleInlinedRequestBodyProperty[] = [];
    for (const [wireKey, propertyExample] of Object.entries(example)) {
        const inlinedRequestPropertyDeclaration = message.body.properties?.[wireKey];
        if (inlinedRequestPropertyDeclaration != null) {
            exampleProperties.push({
                name: file.casingsGenerator.generateNameAndWireValue({
                    name: getPropertyName({ propertyKey: wireKey, property: inlinedRequestPropertyDeclaration }).name,
                    wireValue: wireKey
                }),
                value: convertTypeReferenceExample({
                    example: propertyExample,
                    rawTypeBeingExemplified:
                        typeof inlinedRequestPropertyDeclaration !== "string"
                            ? inlinedRequestPropertyDeclaration.type
                            : inlinedRequestPropertyDeclaration,
                    typeResolver,
                    exampleResolver,
                    fileContainingRawTypeReference: file,
                    fileContainingExample: file,
                    workspace
                }),
                originalTypeDeclaration: undefined
            });
        } else {
            const originalTypeDeclaration = getOriginalTypeDeclarationForPropertyFromExtensions({
                extends_: message.body.extends,
                wirePropertyKey: wireKey,
                typeResolver,
                file
            });
            if (originalTypeDeclaration == null) {
                throw new Error("Could not find original type declaration for property: " + wireKey);
            }
            exampleProperties.push({
                name: file.casingsGenerator.generateNameAndWireValue({
                    name: getPropertyName({ propertyKey: wireKey, property: originalTypeDeclaration.rawPropertyType })
                        .name,
                    wireValue: wireKey
                }),
                value: convertTypeReferenceExample({
                    example: propertyExample,
                    rawTypeBeingExemplified:
                        typeof originalTypeDeclaration.rawPropertyType === "string"
                            ? originalTypeDeclaration.rawPropertyType
                            : originalTypeDeclaration.rawPropertyType.type,
                    typeResolver,
                    exampleResolver,
                    fileContainingRawTypeReference: originalTypeDeclaration.file,
                    fileContainingExample: file,
                    workspace
                }),
                originalTypeDeclaration: originalTypeDeclaration.typeName
            });
        }
    }

    return ExampleWebSocketMessageBody.inlinedBody({
        jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({ example, file }).resolvedExample,
        properties: exampleProperties
    });
}

function convertMessageSchema({
    body,
    file
}: {
    body: RawSchemas.WebSocketChannelMessageBodySchema;
    file: FernFileContext;
}): WebSocketMessageBody {
    if (typeof body === "string") {
        return WebSocketMessageBody.reference({
            docs: undefined,
            bodyType: file.parseTypeReference(body)
        });
    } else if (isReferencedWebhookPayloadSchema(body)) {
        return WebSocketMessageBody.reference({
            docs: undefined,
            bodyType: file.parseTypeReference(body.type)
        });
    } else {
        return WebSocketMessageBody.inlinedBody({
            name: file.casingsGenerator.generateName(body.name),
            extends: getExtensionsAsList(body.extends ?? []).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            properties: []
        });
    }
}

export function isReferencedWebhookPayloadSchema(
    payload: RawSchemas.WebSocketChannelMessageBodySchema
): payload is RawSchemas.WebSocketChannelReferencedMessageSchema {
    return (payload as RawSchemas.WebSocketChannelReferencedMessageSchema).type != null;
}

function convertChannelPathParameters({
    channel,
    example,
    typeResolver,
    exampleResolver,
    variableResolver,
    file,
    workspace
}: {
    channel: RawSchemas.WebSocketChannelSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    variableResolver: VariableResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Pick<ExampleWebSocketSession, "pathParameters"> {
    const pathParameters: ExamplePathParameter[] = [];

    const buildExamplePathParameter = ({
        name,
        pathParameterDeclaration,
        examplePathParameter
    }: {
        name: Name;
        pathParameterDeclaration: RawSchemas.HttpPathParameterSchema;
        examplePathParameter: unknown;
    }) => {
        const resolvedPathParameter = resolvePathParameterOrThrow({
            parameter: pathParameterDeclaration,
            variableResolver,
            file
        });
        return {
            name,
            value: convertTypeReferenceExample({
                example: examplePathParameter,
                rawTypeBeingExemplified: resolvedPathParameter.rawType,
                typeResolver,
                exampleResolver,
                fileContainingRawTypeReference: resolvedPathParameter.file,
                fileContainingExample: file,
                workspace
            })
        };
    };

    if (example["path-parameters"] != null) {
        const rawEndpointPathParameters = getEndpointPathParameters(channel);
        for (const [key, examplePathParameter] of Object.entries(example["path-parameters"])) {
            // const rootPathParameterDeclaration = file.rootApiFile["path-parameters"]?.[key];
            const pathParameterDeclaration = rawEndpointPathParameters[key];

            if (pathParameterDeclaration != null) {
                pathParameters.push(
                    buildExamplePathParameter({
                        name: file.casingsGenerator.generateName(key),
                        pathParameterDeclaration,
                        examplePathParameter
                    })
                );
            } else {
                throw new Error(`Path parameter ${key} does not exist`);
            }
        }
    }

    return { pathParameters };
}

function convertHeaders({
    channel,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    channel: RawSchemas.WebSocketChannelSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Pick<ExampleWebSocketSession, "headers"> {
    const headers: ExampleHeader[] = [];

    if (example.headers != null) {
        for (const [wireKey, exampleHeader] of Object.entries(example.headers)) {
            const headerDeclaration = channel.headers?.[wireKey];
            if (headerDeclaration != null) {
                headers.push({
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: getHeaderName({ headerKey: wireKey, header: headerDeclaration }).name,
                        wireValue: wireKey
                    }),
                    value: convertTypeReferenceExample({
                        example: exampleHeader,
                        rawTypeBeingExemplified:
                            typeof headerDeclaration === "string" ? headerDeclaration : headerDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        fileContainingRawTypeReference: file,
                        fileContainingExample: file,
                        workspace
                    })
                });
            } else {
                throw new Error(`Heder ${wireKey} does not exist`);
            }
        }
    }

    return { headers };
}

function buildUrl({
    channel,
    example,
    pathParams
}: {
    channel: RawSchemas.WebSocketChannelSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    pathParams: Pick<ExampleWebSocketSession, "pathParameters">;
}): string {
    let url = channel.path;
    if (example["path-parameters"] != null) {
        for (const parameter of [...pathParams.pathParameters]) {
            // TODO: should we URL encode the value?
            url = url.replaceAll(`{${parameter.name.originalName}}`, `${parameter.value.jsonExample}`);
        }
    }
    return url;
}

function isInlineMessageBody(
    messageBody: RawSchemas.WebSocketChannelMessageBodySchema
): messageBody is RawSchemas.WebSocketChannelInlinedMessageSchema {
    if (typeof messageBody === "string") {
        return false;
    }

    return (
        (messageBody as RawSchemas.WebSocketChannelInlinedMessageSchema).extends != null ||
        (messageBody as RawSchemas.WebSocketChannelInlinedMessageSchema).properties != null
    );
}
