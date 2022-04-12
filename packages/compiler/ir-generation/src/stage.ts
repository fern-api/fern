import { RawSchemas, SimpleInlinableType } from "@fern/syntax-analysis";
import { CompilerStage, RelativeFilePath } from "@usebirch/compiler-commons";
import { ContainerType } from "./types/ContainerType";
import { HttpMethod } from "./types/HttpMethod";
import { IntermediateRepresentation } from "./types/IntermediateRepresentation";
import { TypeName } from "./types/NamedTypeReference";
import { PrimitiveType } from "./types/PrimitiveType";
import { Type } from "./types/Type";
import { TypeReference } from "./types/TypeReference";
import { WebSocketMessageOrigin } from "./types/WebSocketMessageOrigin";
import { WebSocketMessageResponseBehavior } from "./types/WebSocketMessageResponseBehavior";

export const IntermediateRepresentationGenerationStage: CompilerStage<
    Record<RelativeFilePath, RawSchemas.FernSchema>,
    IntermediateRepresentation,
    void
> = {
    run: (schemas) => {
        const intermediateRepresentation: IntermediateRepresentation = {
            types: [],
            services: {
                http: [],
                webSocket: [],
            },
        };

        for (const [filepath, schema] of Object.entries(schemas)) {
            const { imports = {} } = schema;

            visit(schema, {
                imports: noop,
                ids: (ids) => {
                    if (ids == null) {
                        return;
                    }
                    for (const [id, idType] of Object.entries(ids)) {
                        intermediateRepresentation.types.push({
                            docs: typeof idType !== "string" ? idType.docs : undefined,
                            extends: [],
                            name: {
                                filepath,
                                name: id,
                            },
                            shape: Type.alias(parseInlinableType({ type: idType, filepath, imports })),
                        });
                    }
                },
                types: (types) => {
                    if (types == null) {
                        return;
                    }
                    for (const [typeName, typeDefinition] of Object.entries(types)) {
                        if (isRawAliasDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                docs: typeof typeDefinition !== "string" ? typeDefinition.docs : undefined,
                                extends: [],
                                name: {
                                    filepath,
                                    name: typeName,
                                },
                                shape: Type.alias(
                                    parseInlinableType({
                                        type:
                                            typeof typeDefinition === "string" ? typeDefinition : typeDefinition.alias,
                                        filepath,
                                        imports,
                                    })
                                ),
                            });
                        } else if (isRawObjectDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                docs: typeDefinition.docs,
                                extends:
                                    typeDefinition.extends != null
                                        ? typeof typeDefinition.extends === "string"
                                            ? [parseTypeName({ typeName: typeDefinition.extends, filepath, imports })]
                                            : typeDefinition.extends.map((extended) =>
                                                  parseTypeName({ typeName: extended, filepath, imports })
                                              )
                                        : [],
                                name: {
                                    filepath,
                                    name: typeName,
                                },
                                shape: Type.object({
                                    fields: Object.entries(typeDefinition.fields).map(
                                        ([fieldName, fieldDefinition]) => ({
                                            key: fieldName,
                                            valueType: parseInlinableType({ type: fieldDefinition, filepath, imports }),
                                            docs:
                                                typeof fieldDefinition !== "string" ? fieldDefinition.docs : undefined,
                                        })
                                    ),
                                }),
                            });
                        } else if (isRawUnionDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                docs: typeDefinition.docs,
                                extends: [],
                                name: {
                                    filepath,
                                    name: typeName,
                                },
                                shape: Type.union({
                                    types: Object.entries(typeDefinition.union).map(
                                        ([discriminantValue, unionedType]) => ({
                                            discriminantValue,
                                            valueType: parseInlinableType({ type: unionedType, filepath, imports }),
                                            docs: typeof unionedType !== "string" ? unionedType.docs : undefined,
                                        })
                                    ),
                                }),
                            });
                        } else if (isRawEnumDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                extends: [],
                                docs: typeDefinition.docs,
                                name: {
                                    filepath,
                                    name: typeName,
                                },
                                shape: Type.enum({
                                    values: typeDefinition.enum,
                                }),
                            });
                        } else {
                            assertNever(typeDefinition);
                        }
                    }
                },
                services: (services) => {
                    if (services == null) {
                        return;
                    }
                    if (services.http != null) {
                        for (const [serviceName, serviceDefinition] of Object.entries(services.http)) {
                            intermediateRepresentation.services.http.push({
                                docs: serviceDefinition.docs,
                                name: {
                                    name: serviceName,
                                    filepath,
                                },
                                displayName: serviceDefinition.name,
                                basePath: serviceDefinition["base-path"],
                                headers:
                                    serviceDefinition.headers != null
                                        ? Object.entries(serviceDefinition.headers).map(([header, headerType]) => ({
                                              header,
                                              valueType: parseInlinableType({ type: headerType, filepath, imports }),
                                              docs: typeof headerType !== "string" ? headerType.docs : undefined,
                                          }))
                                        : [],
                                endpoints: Object.entries(serviceDefinition.endpoints).map(
                                    ([endpointName, endpoint]) => ({
                                        name: endpointName,
                                        docs: endpoint.docs,
                                        method: convertHttpMethod(endpoint.method),
                                        path: endpoint.path,
                                        parameters:
                                            endpoint.parameters != null
                                                ? Object.entries(endpoint.parameters).map(
                                                      ([parameterName, parameterType]) => ({
                                                          docs:
                                                              typeof parameterType !== "string"
                                                                  ? parameterType.docs
                                                                  : undefined,
                                                          key: parameterName,
                                                          valueType: parseInlinableType({
                                                              type: parameterType,
                                                              filepath,
                                                              imports,
                                                          }),
                                                      })
                                                  )
                                                : [],
                                        queryParameters:
                                            endpoint.queryParameters != null
                                                ? Object.entries(endpoint.queryParameters).map(
                                                      ([parameterName, parameterType]) => ({
                                                          docs:
                                                              typeof parameterType !== "string"
                                                                  ? parameterType.docs
                                                                  : undefined,
                                                          key: parameterName,
                                                          valueType: parseInlinableType({
                                                              type: parameterType,
                                                              filepath,
                                                              imports,
                                                          }),
                                                      })
                                                  )
                                                : [],
                                        headers:
                                            endpoint.headers != null
                                                ? Object.entries(endpoint.headers).map(([header, headerType]) => ({
                                                      header,
                                                      valueType: parseInlinableType({
                                                          type: headerType,
                                                          filepath,
                                                          imports,
                                                      }),
                                                      docs:
                                                          typeof headerType !== "string" ? headerType.docs : undefined,
                                                  }))
                                                : [],
                                        request:
                                            endpoint.request != null
                                                ? {
                                                      docs:
                                                          typeof endpoint.request !== "string"
                                                              ? endpoint.request.type
                                                              : undefined,
                                                      bodyType: parseInlinableType({
                                                          type: endpoint.request,
                                                          filepath,
                                                          imports,
                                                      }),
                                                  }
                                                : undefined,
                                        response:
                                            endpoint.response != null
                                                ? {
                                                      docs:
                                                          typeof endpoint.response !== "string"
                                                              ? endpoint.response.type
                                                              : undefined,
                                                      bodyType: parseInlinableType({
                                                          type: endpoint.response,
                                                          filepath,
                                                          imports,
                                                      }),
                                                  }
                                                : undefined,
                                        errors:
                                            endpoint.errors != null
                                                ? Object.entries(endpoint.errors).map(([errorName, error]) => ({
                                                      name: errorName,
                                                      statusCode: error.statusCode,
                                                      bodyType: parseInlinableType({
                                                          type: error,
                                                          filepath,
                                                          imports,
                                                      }),
                                                      docs: error.docs,
                                                  }))
                                                : [],
                                    })
                                ),
                            });
                        }
                    }
                    if (services.webSocket != null) {
                        for (const [serviceName, serviceDefinition] of Object.entries(services.webSocket)) {
                            intermediateRepresentation.services.webSocket.push({
                                docs: serviceDefinition.docs,
                                name: {
                                    filepath,
                                    name: serviceName,
                                },
                                displayName: serviceDefinition.name,
                                basePath: serviceDefinition["base-path"],
                                messages: Object.entries(serviceDefinition.messages).map(([messageName, message]) => ({
                                    name: messageName,
                                    docs: message.docs,
                                    origin: convertWebSocketMessageOrigin(message.origin),
                                    body:
                                        message.body != null
                                            ? {
                                                  docs:
                                                      typeof message.body !== "string" ? message.body.docs : undefined,
                                                  bodyType: parseInlinableType({
                                                      type: message.body,
                                                      filepath,
                                                      imports,
                                                  }),
                                              }
                                            : undefined,
                                    response:
                                        message.response != null
                                            ? {
                                                  docs:
                                                      typeof message.response !== "string"
                                                          ? message.response.docs
                                                          : undefined,
                                                  bodyType: parseInlinableType({
                                                      type: message.response,
                                                      filepath,
                                                      imports,
                                                  }),
                                                  behavior:
                                                      typeof message.response !== "string"
                                                          ? convertWebSocketMessageResponseBehavior(
                                                                message.response.behavior
                                                            )
                                                          : WebSocketMessageResponseBehavior.ONGOING,
                                              }
                                            : undefined,
                                    errors:
                                        message.errors != null
                                            ? Object.entries(message.errors).map(([errorName, error]) => ({
                                                  docs: typeof error !== "string" ? error.docs : undefined,
                                                  name: errorName,
                                                  bodyType:
                                                      error != null
                                                          ? parseInlinableType({ type: error, filepath, imports })
                                                          : undefined,
                                              }))
                                            : [],
                                })),
                            });
                        }
                    }
                },
            });
        }

        return {
            didSucceed: true,
            result: intermediateRepresentation,
        };
    },
};

type Visitor<T> = { [K in keyof T]-?: (value: T[K]) => void };

function visit<T>(value: T, visitor: Visitor<T>): void {
    for (const key of keys(value)) {
        visitor[key]?.(value[key]);
    }
}

function noop() {
    // noop
}

function keys<T>(object: T): (keyof T)[] {
    return Object.keys(object) as (keyof T)[];
}

function parseInlinableType({
    type,
    filepath,
    imports,
}: {
    type: SimpleInlinableType;
    filepath: string;
    imports: Record<string, string>;
}): TypeReference {
    const typeAsString = typeof type === "string" ? type : type.type;
    if (typeAsString == null) {
        return TypeReference.void();
    }
    return parseInlineType({ type: typeAsString, filepath, imports });
}

const MAP_REGEX = /map<\s*(.*)\s*,\s*(.*)\s*>/;
const LIST_REGEX = /list<\s*(.*)\s*>/;
const SET_REGEX = /set<\s*(.*)\s*>/;
const OPTIONAL_REGEX = /optional<\s*(.*)\s*>/;

function parseInlineType({
    type,
    filepath,
    imports,
}: {
    type: string;
    filepath: string;
    imports: Record<string, string>;
}): TypeReference {
    function parseInlineTypeRecursive(typeToRecurse: string) {
        return parseInlineType({ type: typeToRecurse, filepath, imports });
    }

    const mapMatch = type.match(MAP_REGEX);
    if (mapMatch != null && mapMatch[1] != null && mapMatch[2] != null) {
        return TypeReference.container(
            ContainerType.map({
                keyType: parseInlineTypeRecursive(mapMatch[1]),
                valueType: parseInlineTypeRecursive(mapMatch[2]),
            })
        );
    }

    const listMatch = type.match(LIST_REGEX);
    if (listMatch != null && listMatch[1] != null) {
        return TypeReference.container(ContainerType.list(parseInlineTypeRecursive(listMatch[1])));
    }

    const setMatch = type.match(SET_REGEX);
    if (setMatch != null && setMatch[1] != null) {
        return TypeReference.container(ContainerType.set(parseInlineTypeRecursive(setMatch[1])));
    }

    const optionalMatch = type.match(OPTIONAL_REGEX);
    if (optionalMatch != null && optionalMatch[1] != null) {
        return TypeReference.container(ContainerType.optional(parseInlineTypeRecursive(optionalMatch[1])));
    }

    switch (type) {
        case "integer":
            return TypeReference.primitive(PrimitiveType.INTEGER);
        case "double":
            return TypeReference.primitive(PrimitiveType.DOUBLE);
        case "long":
            return TypeReference.primitive(PrimitiveType.LONG);
        case "string":
            return TypeReference.primitive(PrimitiveType.STRING);
        case "boolean":
            return TypeReference.primitive(PrimitiveType.BOOLEAN);
    }

    return TypeReference.named(
        parseTypeName({
            typeName: type,
            filepath,
            imports,
        })
    );
}

function parseTypeName({
    typeName,
    filepath,
    imports,
}: {
    typeName: string;
    filepath: string;
    imports: Record<string, string>;
}): TypeName {
    const splitByPackage = typeName.split(".");

    if (splitByPackage.length === 1) {
        return {
            filepath,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            name: splitByPackage[0]!,
        };
    }

    if (splitByPackage.length === 2) {
        const importAlias = splitByPackage[0];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const importPath = imports[importAlias!];
        if (importPath == null) {
            throw new Error(`Invalid type: ${typeName}. Package ${importAlias} not found.`);
        }
        return {
            filepath: importPath,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            name: splitByPackage[1]!,
        };
    }

    throw new Error(`Invalid type: ${typeName}.`);
}

function isRawAliasDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.AliasSchema {
    return typeof rawTypeDefinition === "string" || (rawTypeDefinition as RawSchemas.AliasSchema).alias != null;
}

function isRawObjectDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.ObjectSchema {
    return (rawTypeDefinition as RawSchemas.ObjectSchema)?.fields != null;
}

function isRawUnionDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.UnionSchema {
    return (rawTypeDefinition as RawSchemas.UnionSchema)?.union != null;
}

function isRawEnumDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.EnumSchema {
    return (rawTypeDefinition as RawSchemas.EnumSchema)?.enum != null;
}

function assertNever(typeDefinition: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(typeDefinition));
}

function convertHttpMethod(method: RawSchemas.HttpEndpointSchema["method"]): HttpMethod {
    switch (method) {
        case "GET":
            return HttpMethod.GET;
        case "POST":
            return HttpMethod.POST;
        case "PUT":
            return HttpMethod.PUT;
        case "DELETE":
            return HttpMethod.DELETE;
    }
}

function convertWebSocketMessageOrigin(origin: RawSchemas.WebSocketMessageSchema["origin"]): WebSocketMessageOrigin {
    switch (origin) {
        case "client":
            return WebSocketMessageOrigin.CLIENT;
        case "server":
            return WebSocketMessageOrigin.SERVER;
    }
}

function convertWebSocketMessageResponseBehavior(
    behavior: RawSchemas.WebSocketMessageResponseBehaviorSchema | undefined
): WebSocketMessageResponseBehavior {
    if (behavior == null) {
        return WebSocketMessageResponseBehavior.ONGOING;
    }
    switch (behavior) {
        case "ongoing":
            return WebSocketMessageResponseBehavior.ONGOING;
        case "request-response":
            return WebSocketMessageResponseBehavior.REQUEST_RESPONSE;
    }
}
