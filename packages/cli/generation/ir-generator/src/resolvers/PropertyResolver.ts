import { Name, ObjectProperty, RequestProperty, RequestPropertyValue, ResponseProperty } from "@fern-api/ir-sdk";
import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import {
    getNestedObjectPropertyFromObjectSchema,
    getNestedObjectPropertyFromResolvedType,
    maybeFileFromResolvedType
} from "../converters/services/convertProperty";
import { convertQueryParameter } from "../converters/services/convertQueryParameter";
import { FernFileContext } from "../FernFileContext";
import { EndpointResolver } from "./EndpointResolver";
import { TypeResolver } from "./TypeResolver";

export interface PropertyResolver {
    resolveRequestProperty: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => Promise<RequestProperty | undefined>;
    resolveRequestPropertyOrThrow: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => Promise<RequestProperty>;
    resolveResponseProperty: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => Promise<ResponseProperty | undefined>;
    resolveResponsePropertyOrThrow: (args: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }) => Promise<ResponseProperty>;
}

export class PropertyResolverImpl implements PropertyResolver {
    constructor(private readonly typeResolver: TypeResolver, private readonly endpointResolver: EndpointResolver) {
        this.typeResolver = typeResolver;
        this.endpointResolver = endpointResolver;
    }

    public async resolveRequestPropertyOrThrow({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): Promise<RequestProperty> {
        const resolvedRequestProperty = await this.resolveRequestProperty({ file, endpoint, propertyComponents });
        if (resolvedRequestProperty == null) {
            throw new Error(
                "Cannot resolve request property from endpoint: " + endpoint + " in file " + file.relativeFilepath
            );
        }
        return resolvedRequestProperty;
    }

    public async resolveRequestProperty({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): Promise<RequestProperty | undefined> {
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
        const objectProperty = await this.resolveObjectProperty({
            file: resolvedEndpoint.file,
            typeName: resolvedEndpoint.endpoint.request,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: await this.propertyPathFromPropertyComponents({
                propertyComponents,
                file
            }),
            property: RequestPropertyValue.body(objectProperty)
        };
    }

    public async resolveResponsePropertyOrThrow({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): Promise<ResponseProperty> {
        const resolvedResponseProperty = await this.resolveResponseProperty({ file, endpoint, propertyComponents });
        if (resolvedResponseProperty == null) {
            throw new Error(
                "Cannot resolve response property from endpoint: " + endpoint + " in file " + file.relativeFilepath
            );
        }
        return resolvedResponseProperty;
    }

    public async resolveResponseProperty({
        file,
        endpoint,
        propertyComponents
    }: {
        file: FernFileContext;
        endpoint: string;
        propertyComponents: string[];
    }): Promise<ResponseProperty | undefined> {
        const resolvedEndpoint = this.endpointResolver.resolveEndpointOrThrow({
            endpoint,
            file
        });
        const objectProperty = await this.resolveObjectProperty({
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
            propertyPath: await this.propertyPathFromPropertyComponents({
                propertyComponents,
                file
            }),
            property: objectProperty
        };
    }

    private async resolveRequestPropertyFromInlinedRequest({
        typeResolver,
        file,
        requestType,
        propertyComponents
    }: {
        typeResolver: TypeResolver;
        file: FernFileContext;
        requestType: RawSchemas.HttpRequestSchema;
        propertyComponents: string[];
    }): Promise<RequestProperty | undefined> {
        if (propertyComponents.length === 1) {
            // Query parameters can only be defined on the root level of the request.
            const queryParameterKey = propertyComponents[0] ?? "";
            const queryParameter =
                typeof requestType["query-parameters"] != null
                    ? requestType["query-parameters"]?.[queryParameterKey]
                    : undefined;
            if (queryParameter != null) {
                return {
                    property: RequestPropertyValue.query(
                        await convertQueryParameter({
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

    private async resolveRequestPropertyFromInlinedRequestBody({
        typeResolver,
        file,
        requestType,
        propertyComponents
    }: {
        typeResolver: TypeResolver;
        file: FernFileContext;
        requestType: RawSchemas.HttpRequestSchema;
        propertyComponents: string[];
    }): Promise<RequestProperty | undefined> {
        if (requestType.body == null) {
            return undefined;
        }
        if (typeof requestType.body === "string") {
            const objectProperty = await this.resolveObjectProperty({
                file,
                typeName: requestType.body,
                propertyComponents
            });
            if (objectProperty == null) {
                return undefined;
            }
            return {
                propertyPath: await this.propertyPathFromPropertyComponents({
                    propertyComponents,
                    file
                }),
                property: RequestPropertyValue.body(objectProperty)
            };
        }
        if (isInlineRequestBody(requestType.body)) {
            const objectProperty = await getNestedObjectPropertyFromObjectSchema({
                typeResolver,
                file,
                objectSchema: requestType.body,
                propertyComponents
            });
            if (objectProperty == null) {
                return undefined;
            }
            return {
                propertyPath: await this.propertyPathFromPropertyComponents({
                    propertyComponents,
                    file
                }),
                property: RequestPropertyValue.body(objectProperty)
            };
        }
        const objectProperty = await this.resolveObjectProperty({
            file,
            typeName: requestType.body.type,
            propertyComponents
        });
        if (objectProperty == null) {
            return undefined;
        }
        return {
            propertyPath: await this.propertyPathFromPropertyComponents({
                propertyComponents,
                file
            }),
            property: RequestPropertyValue.body(objectProperty)
        };
    }

    private async resolveObjectProperty({
        file,
        typeName,
        propertyComponents
    }: {
        file: FernFileContext;
        typeName: string;
        propertyComponents: string[];
    }): Promise<ObjectProperty | undefined> {
        const resolvedType = this.typeResolver.resolveTypeOrThrow({
            type: typeName,
            file
        });
        return await getNestedObjectPropertyFromResolvedType({
            typeResolver: this.typeResolver,
            file: maybeFileFromResolvedType(resolvedType) ?? file,
            resolvedType,
            propertyComponents
        });
    }

    private async propertyPathFromPropertyComponents({
        propertyComponents,
        file
    }: {
        propertyComponents: string[];
        file: FernFileContext;
    }): Promise<Name[]> {
        if (propertyComponents.length <= 1) {
            return [];
        }
        return propertyComponents.slice(0, -1).map((property) => file.casingsGenerator.generateName(property));
    }
}
