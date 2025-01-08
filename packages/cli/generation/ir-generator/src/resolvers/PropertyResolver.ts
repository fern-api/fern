import { RawSchemas, isInlineRequestBody } from "@fern-api/fern-definition-schema";
import { Name, ObjectProperty, RequestProperty, RequestPropertyValue, ResponseProperty } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import {
    getNestedObjectPropertyFromObjectSchema,
    getNestedObjectPropertyFromResolvedType,
    maybeFileFromResolvedType
} from "../converters/services/convertProperty";
import { convertQueryParameter } from "../converters/services/convertQueryParameter";
import { EndpointResolver } from "./EndpointResolver";
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
        const objectProperty = this.resolveObjectProperty({
            file: resolvedEndpoint.file,
            typeName: resolvedEndpoint.endpoint.request,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: this.propertyPathFromPropertyComponents({
                propertyComponents,
                file
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
        const objectProperty = this.resolveObjectProperty({
            file: resolvedEndpoint.file,
            typeName:
                (typeof resolvedEndpoint.endpoint.response !== "string"
                    ? resolvedEndpoint.endpoint.response?.type
                    : resolvedEndpoint.endpoint.response) ?? "",
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: this.propertyPathFromPropertyComponents({
                propertyComponents,
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
            const objectProperty = this.resolveObjectProperty({
                file,
                typeName: requestType.body,
                propertyComponents
            });
            if (objectProperty == null) {
                return undefined;
            }
            return {
                propertyPath: this.propertyPathFromPropertyComponents({
                    propertyComponents,
                    file
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
                propertyPath: this.propertyPathFromPropertyComponents({
                    propertyComponents,
                    file
                }),
                property: RequestPropertyValue.body(objectProperty)
            };
        }
        const objectProperty = this.resolveObjectProperty({
            file,
            typeName: requestType.body.type,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: this.propertyPathFromPropertyComponents({
                propertyComponents,
                file
            }),
            property: RequestPropertyValue.body(objectProperty)
        };
    }

    private resolveObjectProperty({
        file,
        typeName,
        propertyComponents
    }: {
        file: FernFileContext;
        typeName: string;
        propertyComponents: string[];
    }): ObjectProperty | undefined {
        const resolvedType = this.typeResolver.resolveTypeOrThrow({
            type: typeName,
            file
        });
        return getNestedObjectPropertyFromResolvedType({
            typeResolver: this.typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            resolvedType,
            propertyComponents
        });
    }

    private propertyPathFromPropertyComponents({
        propertyComponents,
        file
    }: {
        propertyComponents: string[];
        file: FernFileContext;
    }): Name[] {
        if (propertyComponents.length <= 1) {
            return [];
        }
        return propertyComponents.slice(0, -1).map((property) => file.casingsGenerator.generateName(property));
    }
}
