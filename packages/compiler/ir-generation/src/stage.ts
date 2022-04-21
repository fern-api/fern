import {
    ContainerType,
    ErrorReference,
    FernFilepath,
    HttpEndpoint,
    HttpMethod,
    IntermediateRepresentation,
    NamedError,
    NamedType,
    PrimitiveType,
    Type,
    TypeReference,
    WebSocketMessageOrigin,
    WebSocketMessageResponseBehavior,
} from "@fern-api/api";
import { CompilerStage, RelativeFilePath } from "@fern-api/compiler-commons";
import { RawSchemas, SimpleInlinableType } from "@fern-api/syntax-analysis";
import { ErrorReferenceSchema } from "@fern-api/syntax-analysis/src/schemas";
import path from "path";
import { DEFAULT_UNION_TYPE_DISCRIMINANT } from "./constants";

export const IntermediateRepresentationGenerationStage: CompilerStage<
    Record<RelativeFilePath, RawSchemas.FernSchema>,
    IntermediateRepresentation,
    void
> = {
    run: (schemas) => {
        const intermediateRepresentation: IntermediateRepresentation = {
            types: [],
            errors: [],
            services: {
                http: [],
                websocket: [],
            },
        };

        for (const [filepath, schema] of Object.entries(schemas)) {
            const fernFilepath = convertToFernFilepath(filepath);

            const parseInlinableType = (type: SimpleInlinableType): TypeReference => {
                const typeAsString = typeof type === "string" ? type : type.type;
                if (typeAsString == null) {
                    return TypeReference.void();
                }
                return parseInlineType({ type: typeAsString, fernFilepath, imports });
            };

            const { imports = {} } = schema;

            visit(schema, {
                imports: noop,
                ids: (ids) => {
                    if (ids == null) {
                        return;
                    }
                    for (const id of ids) {
                        intermediateRepresentation.types.push({
                            docs: typeof id !== "string" ? id.docs : undefined,
                            name: {
                                fernFilepath: convertToFernFilepath(filepath),
                                name: typeof id === "string" ? id : id.name,
                            },
                            shape: Type.alias({
                                aliasOf:
                                    typeof id === "string" || id.type == null
                                        ? TypeReference.primitive(PrimitiveType.String)
                                        : parseInlinableType(id.type),
                                isId: true,
                            }),
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
                                name: {
                                    fernFilepath,
                                    name: typeName,
                                },
                                shape: Type.alias({
                                    aliasOf: parseInlinableType(
                                        typeof typeDefinition === "string" ? typeDefinition : typeDefinition.alias
                                    ),
                                    isId: false,
                                }),
                            });
                        } else if (isRawObjectDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                docs: typeDefinition.docs,
                                name: {
                                    fernFilepath,
                                    name: typeName,
                                },
                                shape: Type.object({
                                    extends:
                                        typeDefinition.extends != null
                                            ? typeof typeDefinition.extends === "string"
                                                ? [
                                                      parseTypeName({
                                                          typeName: typeDefinition.extends,
                                                          fernFilepath,
                                                          imports,
                                                      }),
                                                  ]
                                                : typeDefinition.extends.map((extended) =>
                                                      parseTypeName({ typeName: extended, fernFilepath, imports })
                                                  )
                                            : [],
                                    fields: Object.entries(typeDefinition.fields).map(
                                        ([fieldName, fieldDefinition]) => ({
                                            key: fieldName,
                                            valueType: parseInlinableType(fieldDefinition),
                                            docs:
                                                typeof fieldDefinition !== "string" ? fieldDefinition.docs : undefined,
                                        })
                                    ),
                                }),
                            });
                        } else if (isRawUnionDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                docs: typeDefinition.docs,
                                name: {
                                    fernFilepath,
                                    name: typeName,
                                },
                                shape: Type.union({
                                    discriminant: typeDefinition.discriminant ?? DEFAULT_UNION_TYPE_DISCRIMINANT,
                                    types: Object.entries(typeDefinition.union).map(
                                        ([discriminantValue, unionedType]) => ({
                                            discriminantValue,
                                            valueType: parseInlinableType(unionedType),
                                            docs: typeof unionedType !== "string" ? unionedType.docs : undefined,
                                        })
                                    ),
                                }),
                            });
                        } else if (isRawEnumDefinition(typeDefinition)) {
                            intermediateRepresentation.types.push({
                                docs: typeDefinition.docs,
                                name: {
                                    fernFilepath,
                                    name: typeName,
                                },
                                shape: Type.enum({
                                    values: typeDefinition.enum.map((value) =>
                                        typeof value === "string"
                                            ? { value, docs: undefined }
                                            : { value: value.value, docs: value.docs }
                                    ),
                                }),
                            });
                        } else {
                            assertNever(typeDefinition);
                        }
                    }
                },
                errors: (errors) => {
                    if (errors == null) {
                        return;
                    }
                    for (const [errorName, error] of Object.entries(errors)) {
                        intermediateRepresentation.errors.push({
                            name: {
                                name: errorName,
                                fernFilepath,
                            },
                            docs: error.docs,
                            http:
                                error.http != null
                                    ? {
                                          statusCode: error.http.statusCode,
                                      }
                                    : undefined,
                            bodyType: error.bodyType != null ? parseInlinableType(error.bodyType) : undefined,
                        });
                    }
                },
                services: (services) => {
                    if (services == null) {
                        return;
                    }

                    const parseErrorReferences = (
                        errors: Record<string, ErrorReferenceSchema> | undefined
                    ): ErrorReference[] => {
                        if (errors == null) {
                            return [];
                        }

                        return Object.entries(errors).map(([discriminantValue, error]) => {
                            const docs = typeof error !== "string" ? error.docs : undefined;
                            return {
                                docs,
                                discriminantValue,
                                error: parseError({
                                    errorName: typeof error === "string" ? error : error.error,
                                    fernFilepath,
                                    imports,
                                }),
                            };
                        });
                    };

                    if (services.http != null) {
                        for (const [serviceId, serviceDefinition] of Object.entries(services.http)) {
                            intermediateRepresentation.services.http.push({
                                docs: serviceDefinition.docs,
                                name: {
                                    name: serviceId,
                                    fernFilepath,
                                },
                                displayName: serviceDefinition.name ?? serviceId,
                                basePath: serviceDefinition["base-path"] ?? "/",
                                headers:
                                    serviceDefinition.headers != null
                                        ? Object.entries(serviceDefinition.headers).map(([header, headerType]) => ({
                                              header,
                                              valueType: parseInlinableType(headerType),
                                              docs: typeof headerType !== "string" ? headerType.docs : undefined,
                                          }))
                                        : [],
                                endpoints: Object.entries(serviceDefinition.endpoints).map(
                                    ([endpointId, endpoint]): HttpEndpoint => ({
                                        endpointId,
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
                                                          valueType: parseInlinableType(parameterType),
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
                                                          valueType: parseInlinableType(parameterType),
                                                      })
                                                  )
                                                : [],
                                        headers:
                                            endpoint.headers != null
                                                ? Object.entries(endpoint.headers).map(([header, headerType]) => ({
                                                      header,
                                                      valueType: parseInlinableType(headerType),
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
                                                      bodyType: parseInlinableType(endpoint.request),
                                                  }
                                                : undefined,
                                        response:
                                            endpoint.response != null
                                                ? {
                                                      docs:
                                                          typeof endpoint.response !== "string"
                                                              ? endpoint.response.type
                                                              : undefined,
                                                      bodyType: parseInlinableType(endpoint.response),
                                                  }
                                                : undefined,
                                        errors: parseErrorReferences(endpoint.errors),
                                    })
                                ),
                            });
                        }
                    }
                    if (services.webSocket != null) {
                        for (const [serviceId, serviceDefinition] of Object.entries(services.webSocket)) {
                            intermediateRepresentation.services.websocket.push({
                                docs: serviceDefinition.docs,
                                name: {
                                    fernFilepath,
                                    name: serviceId,
                                },
                                displayName: serviceDefinition.name ?? serviceId,
                                basePath: serviceDefinition["base-path"] ?? "/",
                                messages: Object.entries(serviceDefinition.messages).map(([messageName, message]) => ({
                                    name: messageName,
                                    docs: message.docs,
                                    origin: convertWebSocketMessageOrigin(message.origin),
                                    body:
                                        message.body != null
                                            ? {
                                                  docs:
                                                      typeof message.body !== "string" ? message.body.docs : undefined,
                                                  bodyType: parseInlinableType(message.body),
                                              }
                                            : undefined,
                                    response:
                                        message.response != null
                                            ? {
                                                  docs:
                                                      typeof message.response !== "string"
                                                          ? message.response.docs
                                                          : undefined,
                                                  bodyType: parseInlinableType(message.response),
                                                  behavior:
                                                      typeof message.response !== "string"
                                                          ? convertWebSocketMessageResponseBehavior(
                                                                message.response.behavior
                                                            )
                                                          : WebSocketMessageResponseBehavior.Ongoing,
                                              }
                                            : undefined,
                                    errors: parseErrorReferences(message.errors),
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

const MAP_REGEX = /map<\s*(.*)\s*,\s*(.*)\s*>/;
const LIST_REGEX = /list<\s*(.*)\s*>/;
const SET_REGEX = /set<\s*(.*)\s*>/;
const OPTIONAL_REGEX = /optional<\s*(.*)\s*>/;

function parseInlineType({
    type,
    fernFilepath,
    imports,
}: {
    type: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeReference {
    function parseInlineTypeRecursive(typeToRecurse: string) {
        return parseInlineType({ type: typeToRecurse, fernFilepath, imports });
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
            return TypeReference.primitive(PrimitiveType.Integer);
        case "double":
            return TypeReference.primitive(PrimitiveType.Double);
        case "long":
            return TypeReference.primitive(PrimitiveType.Long);
        case "string":
            return TypeReference.primitive(PrimitiveType.String);
        case "boolean":
            return TypeReference.primitive(PrimitiveType.Boolean);
    }

    return TypeReference.named(
        parseTypeName({
            typeName: type,
            fernFilepath,
            imports,
        })
    );
}

function parseTypeName({
    typeName,
    fernFilepath,
    imports,
}: {
    typeName: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): NamedType {
    const reference = parseReference({
        reference: typeName,
        fernFilepath,
        imports,
    });
    return {
        name: reference.referenceName,
        fernFilepath,
    };
}

function parseError({
    errorName,
    fernFilepath,
    imports,
}: {
    errorName: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): NamedError {
    const reference = parseReference({
        reference: errorName,
        fernFilepath,
        imports,
    });
    return {
        name: reference.referenceName,
        fernFilepath,
    };
}

function parseReference({
    reference,
    fernFilepath,
    imports,
}: {
    reference: string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): { fernFilepath: FernFilepath; referenceName: string } {
    const [firstPart, secondPart, ...rest] = reference.split(".");

    if (firstPart != null) {
        if (secondPart == null) {
            return {
                fernFilepath,
                referenceName: firstPart,
            };
        }

        if (rest.length === 0) {
            const importAlias = firstPart;
            const importPath = imports[importAlias];
            if (importPath == null) {
                throw new Error(`Invalid reference: ${reference}. Package ${importAlias} not found.`);
            }
            return {
                fernFilepath: convertToFernFilepath(importPath),
                referenceName: secondPart,
            };
        }
    }

    throw new Error(`Invalid reference: ${reference}`);
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
            return HttpMethod.Get;
        case "POST":
            return HttpMethod.Post;
        case "PUT":
            return HttpMethod.Put;
        case "DELETE":
            return HttpMethod.Delete;
    }
}

function convertWebSocketMessageOrigin(origin: RawSchemas.WebSocketMessageSchema["origin"]): WebSocketMessageOrigin {
    switch (origin) {
        case "client":
            return WebSocketMessageOrigin.Client;
        case "server":
            return WebSocketMessageOrigin.Server;
    }
}

function convertWebSocketMessageResponseBehavior(
    behavior: RawSchemas.WebSocketMessageResponseBehaviorSchema | undefined
): WebSocketMessageResponseBehavior {
    if (behavior == null) {
        return WebSocketMessageResponseBehavior.Ongoing;
    }
    switch (behavior) {
        case "ongoing":
            return WebSocketMessageResponseBehavior.Ongoing;
        case "request-response":
            return WebSocketMessageResponseBehavior.RequestResponse;
    }
}

function convertToFernFilepath(relativeFilepath: RelativeFilePath): FernFilepath {
    const parsed = path.parse(relativeFilepath);
    return FernFilepath.of(path.join(parsed.dir, parsed.name));
}
