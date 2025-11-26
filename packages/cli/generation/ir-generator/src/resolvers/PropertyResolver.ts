import { assertNever } from "@fern-api/core-utils";
import { isInlineRequestBody, RawSchemas } from "@fern-api/fern-definition-schema";
import {
    ObjectProperty,
    PropertyPathItem,
    RequestProperty,
    RequestPropertyValue,
    ResponseProperty
} from "@fern-api/ir-sdk";
import {
    getNestedObjectPropertyFromObjectSchema,
    getNestedObjectPropertyFromResolvedType,
    maybeFileFromResolvedType
} from "../converters/services/convertProperty";
import { convertQueryParameter } from "../converters/services/convertQueryParameter";
import { FernFileContext } from "../FernFileContext";
import { EndpointResolver } from "./EndpointResolver";
import { ResolvedType } from "./ResolvedType";
import { TypeResolver } from "./TypeResolver";

export interface PropertyResolver {
    resolveRequestProperty: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => RequestProperty | undefined;
    resolveRequestPropertyOrThrow: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => RequestProperty;
    resolveResponseProperty: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => ResponseProperty | undefined;
    resolveResponsePropertyOrThrow: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => ResponseProperty;
}

export class PropertyResolverImpl implements PropertyResolver {
    constructor(
        private readonly typeResolver: TypeResolver,
        private readonly endpointResolver: EndpointResolver
    ) {
        this.typeResolver = typeResolver;
        this.endpointResolver = endpointResolver;
    }

    public resolveRequestPropertyOrThrow({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): RequestProperty {
        const resolvedRequestProperty = this.resolveRequestProperty({ file, endpoint, propertyComponents });
        if (resolvedRequestProperty == null) {
            throw new Error(
                "Cannot resolve request property from endpoint: " + endpoint + " in file " + file.relativeFilepath
            );
        }
        return resolvedRequestProperty;
    }

    public resolveRequestProperty({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): RequestProperty | undefined {
        const resolvedEndpoint = this.endpointResolver.resolveEndpointOrThrow({
            endpoint,
            file
        });
        if (resolvedEndpoint.endpoint.request == null) {
            return undefined;
        }
        if (typeof resolvedEndpoint.endpoint.request !== "string") {
            return this.resolveRequestPropertyFromInlinedRequest({
                typeResolver: this.typeResolver,
                file: resolvedEndpoint.file,
                requestType: resolvedEndpoint.endpoint.request,
                propertyComponents
            });
        }
        const resolvedRequestType = this.typeResolver.resolveTypeOrThrow({
            type: resolvedEndpoint.endpoint.request,
            file: resolvedEndpoint.file
        });
        const objectProperty = this.resolveObjectProperty({
            file: resolvedEndpoint.file,
            resolvedType: resolvedRequestType,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: this.propertyPathFromPropertyComponents({
                propertyComponents,
                file,
                resolvedType: resolvedRequestType
            }),
            property: RequestPropertyValue.body(objectProperty)
        };
    }

    public resolveResponsePropertyOrThrow({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): ResponseProperty {
        const resolvedResponseProperty = this.resolveResponseProperty({ file, endpoint, propertyComponents });
        if (resolvedResponseProperty == null) {
            throw new Error(
                "Cannot resolve response property from endpoint: " + endpoint + " in file " + file.relativeFilepath
            );
        }
        return resolvedResponseProperty;
    }

    public resolveResponseProperty({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): ResponseProperty | undefined {
        const resolvedEndpoint = this.endpointResolver.resolveEndpointOrThrow({
            endpoint,
            file
        });
        const resolvedEndpointResponseType = this.typeResolver.resolveTypeOrThrow({
            type:
                (typeof resolvedEndpoint.endpoint.response !== "string"
                    ? resolvedEndpoint.endpoint.response?.type
                    : resolvedEndpoint.endpoint.response) ?? "",
            file: resolvedEndpoint.file
        });
        const objectProperty = this.resolveObjectProperty({
            file: resolvedEndpoint.file,
            resolvedType: resolvedEndpointResponseType,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: this.propertyPathFromPropertyComponents({
                propertyComponents,
                resolvedType: resolvedEndpointResponseType,
                file
            }),
            property: objectProperty
        };
    }

    private resolveRequestPropertyFromInlinedRequest({
        typeResolver,
        file,
        requestType,
        propertyComponents
    }: {
        typeResolver: TypeResolver;
        file: FernFileContext;
        requestType: RawSchemas.HttpRequestSchema;
        propertyComponents: string[];
    }): RequestProperty | undefined {
        if (propertyComponents.length === 1) {
            // Query parameters can only be defined on the root level of the request.
            const queryParameterKey = propertyComponents[0] ?? "";
            const queryParameter = requestType["query-parameters"]?.[queryParameterKey] ?? undefined;
            if (queryParameter != null) {
                return {
                    property: RequestPropertyValue.query(
                        convertQueryParameter({
                            file,
                            queryParameterKey,
                            queryParameter
                        })
                    ),
                    propertyPath: undefined
                };
            }
        }
        return this.resolveRequestPropertyFromInlinedRequestBody({
            typeResolver,
            file,
            requestType,
            propertyComponents
        });
    }

    private resolveRequestPropertyFromInlinedRequestBody({
        typeResolver,
        file,
        requestType,
        propertyComponents
    }: {
        typeResolver: TypeResolver;
        file: FernFileContext;
        requestType: RawSchemas.HttpRequestSchema;
        propertyComponents: string[];
    }): RequestProperty | undefined {
        if (requestType.body == null) {
            return undefined;
        }
        if (typeof requestType.body === "string") {
            const resolvedBodyType = typeResolver.resolveTypeOrThrow({
                type: requestType.body,
                file
            });
            const objectProperty = this.resolveObjectProperty({
                file,
                resolvedType: resolvedBodyType,
                propertyComponents
            });
            if (objectProperty == null) {
                return undefined;
            }
            return {
                propertyPath: this.propertyPathFromPropertyComponents({
                    propertyComponents,
                    file,
                    resolvedType: resolvedBodyType
                }),
                property: RequestPropertyValue.body(objectProperty)
            };
        }
        if (isInlineRequestBody(requestType.body)) {
            const objectProperty = getNestedObjectPropertyFromObjectSchema({
                typeResolver,
                file,
                objectSchema: requestType.body,
                propertyComponents
            });
            if (objectProperty == null) {
                return undefined;
            }
            return {
                propertyPath: this.propertyPathFromPropertyComponentsFromInlineRequestBody({
                    propertyComponents,
                    file,
                    body: requestType.body
                }),
                property: RequestPropertyValue.body(objectProperty)
            };
        }
        const resolvedSchema = typeResolver.resolveTypeOrThrow({
            type: requestType.body.type,
            file
        });
        const objectProperty = getNestedObjectPropertyFromResolvedType({
            typeResolver,
            file: maybeFileFromResolvedType(resolvedSchema) ?? file,
            resolvedType: resolvedSchema,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: this.propertyPathFromPropertyComponents({
                propertyComponents,
                file,
                resolvedType: resolvedSchema
            }),
            property: RequestPropertyValue.body(objectProperty)
        };
    }

    private resolveObjectProperty({
        file,
        resolvedType,
        propertyComponents
    }: {
        file: FernFileContext;
        resolvedType: ResolvedType;
        propertyComponents: string[];
    }): ObjectProperty | undefined {
        return getNestedObjectPropertyFromResolvedType({
            typeResolver: this.typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            resolvedType,
            propertyComponents
        });
    }

    private propertyPathFromPropertyComponents({
        propertyComponents,
        file,
        resolvedType
    }: {
        propertyComponents: string[];
        file: FernFileContext;
        resolvedType: ResolvedType;
    }): PropertyPathItem[] {
        if (propertyComponents.length <= 1) {
            return [];
        }
        const rootTypeTitle = getTitleForResolvedType(resolvedType);
        let currentType = resolvedType;
        const result: PropertyPathItem[] = [];
        const breadcrumbs: string[] = [];
        for (const component of propertyComponents.slice(0, -1)) {
            breadcrumbs.push(component);
            currentType = getNestedObjectPropertyTypeOrThrow({
                typeResolver: this.typeResolver,
                file,
                resolvedType: currentType,
                propertyName: component,
                breadcrumbs,
                rootTypeTitle
            });
            result.push({
                name: file.casingsGenerator.generateName(component),
                type: currentType.originalTypeReference
            });
        }

        return result;
    }

    private propertyPathFromPropertyComponentsFromInlineRequestBody({
        propertyComponents,
        file,
        body
    }: {
        propertyComponents: string[];
        file: FernFileContext;
        body: RawSchemas.HttpInlineRequestBodySchema | RawSchemas.HttpReferencedRequestBodySchema;
    }): PropertyPathItem[] {
        if (propertyComponents.length <= 1) {
            return [];
        }
        const result: PropertyPathItem[] = [];
        const breadcrumbs: string[] = [];
        for (const component of propertyComponents.slice(0, -1)) {
            breadcrumbs.push(component);
            const currentType = getNestedObjectPropertyFromObjectSchema({
                typeResolver: this.typeResolver,
                file,
                objectSchema: body,
                propertyComponents: breadcrumbs
            });
            if (!currentType) {
                throw new Error(
                    `Cannot find property '${breadcrumbs.join(".")}' in inline request body in file ${file.relativeFilepath}`
                );
            }
            result.push({
                name: file.casingsGenerator.generateName(component),
                type: currentType.valueType
            });
        }

        return result;
    }
}
function getNestedObjectPropertyTypeOrThrow({
    typeResolver,
    file,
    resolvedType,
    propertyName,
    breadcrumbs,
    rootTypeTitle: rootTypeLabel
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType;
    propertyName: string;
    breadcrumbs: string[];
    rootTypeTitle: string;
}): ResolvedType {
    const nestedPropertyType = getNestedObjectPropertyType({
        typeResolver,
        file,
        resolvedType,
        propertyName
    });
    if (!nestedPropertyType) {
        throw new Error(`Cannot find property '${breadcrumbs.join(".")}' in ${rootTypeLabel}`);
    }
    return nestedPropertyType;
}

function getNestedObjectPropertyType({
    typeResolver,
    file,
    resolvedType,
    propertyName
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    resolvedType: ResolvedType;
    propertyName: string;
}): ResolvedType | undefined {
    switch (resolvedType._type) {
        case "container":
            switch (resolvedType.container._type) {
                case "list":
                    return undefined;
                case "literal":
                    return undefined;
                case "map":
                    return undefined;
                case "nullable": {
                    const innerNestedObjectPropertyType = getNestedObjectPropertyType({
                        typeResolver,
                        file,
                        resolvedType: resolvedType.container.itemType,
                        propertyName
                    });
                    if (innerNestedObjectPropertyType) {
                        return innerNestedObjectPropertyType;
                    }
                    return undefined;
                }
                case "optional": {
                    const innerNestedObjectPropertyType = getNestedObjectPropertyType({
                        typeResolver,
                        file,
                        resolvedType: resolvedType.container.itemType,
                        propertyName
                    });
                    if (innerNestedObjectPropertyType) {
                        return innerNestedObjectPropertyType;
                    }
                    return undefined;
                }
                case "set":
                    return undefined;
                default:
                    assertNever(resolvedType.container);
            }
            break;
        case "primitive":
            return undefined;
        case "unknown":
            return undefined;
        case "named": {
            const declaration = resolvedType.declaration;
            if ("properties" in declaration && declaration.properties != null) {
                for (const [name, type] of Object.entries(declaration.properties)) {
                    if (name === propertyName) {
                        return typeResolver.resolveTypeOrThrow({
                            type: typeof type === "string" ? type : type.type,
                            file: resolvedType.file
                        });
                    }
                }
            }
            if ("base-properties" in declaration && declaration["base-properties"] != null) {
                for (const [name, type] of Object.entries(declaration["base-properties"])) {
                    if (name === propertyName) {
                        return typeResolver.resolveTypeOrThrow({
                            type: typeof type === "string" ? type : type.type,
                            file: resolvedType.file
                        });
                    }
                }
            }
            if ("extends" in declaration && declaration.extends != null) {
                const extends_ = Array.isArray(declaration.extends) ? declaration.extends : [declaration.extends];
                for (const extendedType of extends_) {
                    const resolvedExtendedType = typeResolver.resolveTypeOrThrow({
                        type: extendedType,
                        file: resolvedType.file
                    });
                    const nestedPropertyType = getNestedObjectPropertyType({
                        file: "file" in resolvedExtendedType ? resolvedExtendedType.file : file,
                        typeResolver,
                        resolvedType: resolvedExtendedType,
                        propertyName
                    });
                    if (nestedPropertyType) {
                        return nestedPropertyType;
                    }
                }
            }
            if ("union" in declaration && declaration.union != null) {
                if (Array.isArray(declaration.union)) {
                    for (const member of declaration.union) {
                        const resolvedUnionMemberType = typeResolver.resolveTypeOrThrow({
                            type: typeof member === "string" ? member : member.type,
                            file: resolvedType.file
                        });
                        const unionMemberType = getNestedObjectPropertyType({
                            file: "file" in resolvedUnionMemberType ? resolvedUnionMemberType.file : file,
                            typeResolver,
                            resolvedType: resolvedUnionMemberType,
                            propertyName
                        });
                        if (unionMemberType) {
                            return unionMemberType;
                        }
                    }
                } else {
                    for (const [, member] of Object.entries(declaration.union)) {
                        const memberType = typeof member === "string" ? member : member.type;
                        if (!memberType) {
                            continue;
                        }
                        const resolvedUnionMemberType = typeResolver.resolveTypeOrThrow({
                            type: memberType,
                            file: resolvedType.file
                        });
                        const unionMemberType = getNestedObjectPropertyType({
                            file: "file" in resolvedUnionMemberType ? resolvedUnionMemberType.file : file,
                            typeResolver,
                            resolvedType: resolvedUnionMemberType,
                            propertyName
                        });
                        if (unionMemberType) {
                            return unionMemberType;
                        }
                    }
                }
            }
            return undefined;
        }
        default:
            assertNever(resolvedType);
    }
}
function getTitleForResolvedType(resolvedType: ResolvedType): string {
    switch (resolvedType._type) {
        case "container":
            switch (resolvedType.container._type) {
                case "list":
                    return `list<${getTitleForResolvedType(resolvedType.container.itemType)}>}`;
                case "literal":
                    return `literal<${resolvedType.container.literal._visit<string>({
                        boolean: (v) => v.toString(),
                        string: (v) => v,
                        _other: (v) => v.type
                    })}>`;
                case "map":
                    return `map<${getTitleForResolvedType(resolvedType.container.keyType)}, ${getTitleForResolvedType(resolvedType.container.valueType)}>}`;
                case "nullable":
                    return `nullable<${getTitleForResolvedType(resolvedType.container.itemType)}>}`;
                case "optional":
                    return `optional<${getTitleForResolvedType(resolvedType.container.itemType)}>}`;
                case "set":
                    return `set<${getTitleForResolvedType(resolvedType.container.itemType)}>}`;
                default:
                    assertNever(resolvedType.container);
            }
            break;
        case "named":
            return resolvedType.name.name.originalName;
        case "primitive":
            return resolvedType.primitive.v1;
        case "unknown":
            return "unknown";
        default:
            assertNever(resolvedType);
    }
}
