import { FernIr } from "@fern-fern/ir-sdk";

import { SdkContext } from "../SdkContext";
import { ts } from "ts-morph";

export class AuthProviderContext {
    private readonly context: SdkContext;

    constructor({
        context
    }: {
        context: SdkContext;
    }) {
        this.context = context;
    }

    public getPropertiesForAuthTokenParams(
        authScheme: FernIr.AuthScheme
    ): Array<{ name: string; type: ts.TypeNode; isOptional: boolean; docs?: string }> {
        if (authScheme.type !== "inferred") {
            return [];
        }

        const service = this.getInferredAuthTokenService(authScheme);
        const endpoint = this.getInferredAuthTokenEndpoint(authScheme);
        const properties: Array<{
            name: string;
            type: ts.TypeNode;
            isOptional: boolean;
            docs?: string;
        }> = [];
        for (const pathParameter of endpoint.allPathParameters) {
            if (!this.context.type.isLiteral(pathParameter.valueType)) {
                const type = this.context.type.getReferenceToType(pathParameter.valueType);
                properties.push({
                    name: pathParameter.name.camelCase.safeName,
                    type: type.typeNodeWithoutUndefined,
                    isOptional: type.isOptional,
                    docs: pathParameter.docs
                });
            }
        }

        for (const queryParameter of endpoint.queryParameters) {
            if (!this.context.type.isLiteral(queryParameter.valueType)) {
                const type = this.context.type.getReferenceToType(queryParameter.valueType);
                properties.push({
                    name: queryParameter.name.name.camelCase.safeName,
                    type: queryParameter.allowMultiple
                        ? ts.factory.createUnionTypeNode([
                              type.typeNodeWithoutUndefined,
                              ts.factory.createArrayTypeNode(type.typeNodeWithoutUndefined)
                          ])
                        : type.typeNodeWithoutUndefined,
                    isOptional: type.isOptional,
                    docs: queryParameter.docs
                });
            }
        }

        for (const header of [...service.headers, ...endpoint.headers]) {
            if (!this.context.type.isLiteral(header.valueType)) {
                const type = this.context.type.getReferenceToType(header.valueType);
                properties.push({
                    name: header.name.name.camelCase.safeName,
                    type: type.typeNodeWithoutUndefined,
                    isOptional: type.isOptional,
                    docs: header.docs
                });
            }
        }

        if (endpoint.requestBody != null) {
            switch (endpoint.requestBody.type) {
                case "inlinedRequestBody":
                    for (const property of endpoint.requestBody.properties) {
                        if (!this.context.type.isLiteral(property.valueType)) {
                            const type = this.context.type.getReferenceToType(property.valueType);
                            properties.push({
                                name: property.name.name.camelCase.safeName,
                                type: type.typeNodeWithoutUndefined,
                                isOptional: type.isOptional,
                                docs: property.docs
                            });
                        }
                    }
                    break;
                case "reference": {
                    const resolvedRequestBodyType = this.context.type.resolveTypeReference(
                        endpoint.requestBody.requestBodyType
                    );
                    if (resolvedRequestBodyType.type === "named") {
                        const typeDeclaration = this.context.type.getTypeDeclaration(resolvedRequestBodyType.name);
                        if (typeDeclaration.shape.type === "object") {
                            const generatedType = this.context.type.getGeneratedType(resolvedRequestBodyType.name);
                            if (generatedType.type === "object") {
                                const allProperties = generatedType.getAllPropertiesIncludingExtensions(this.context, {
                                    forceCamelCase: true
                                });
                                for (const property of allProperties) {
                                    if (!this.context.type.isLiteral(property.type)) {
                                        const type = this.context.type.getReferenceToType(property.type);
                                        properties.push({
                                            name: property.propertyKey,
                                            type: type.typeNodeWithoutUndefined,
                                            isOptional: type.isOptional,
                                            docs: undefined
                                        });
                                    }
                                }
                            }
                        }
                    } else {
                        // For non-object types, add as a single "body" property
                        const type = this.context.type.getReferenceToType(endpoint.requestBody.requestBodyType);
                        properties.push({
                            name: "body",
                            type: type.typeNodeWithoutUndefined,
                            isOptional: type.isOptional,
                            docs: endpoint.requestBody.docs
                        });
                    }
                    break;
                }
            }
        }

        return properties;
    }

    private getInferredAuthTokenService(authScheme: FernIr.InferredAuthScheme): FernIr.HttpService {
        const service = this.context.ir.services[authScheme.tokenEndpoint.endpoint.serviceId];
        if (!service) {
            throw new Error(`failed to find service with id ${authScheme?.tokenEndpoint.endpoint.serviceId}`);
        }
        return service;
    }

    private getInferredAuthTokenEndpoint(authScheme: FernIr.InferredAuthScheme): FernIr.HttpEndpoint {
        const tokenEndpointReference = authScheme.tokenEndpoint.endpoint;
        const endpoint = this.getInferredAuthTokenService(authScheme).endpoints.find(
            (endpoint: FernIr.HttpEndpoint) => endpoint.id === tokenEndpointReference.endpointId
        );
        if (!endpoint) {
            throw new Error(`failed to find endpoint with id ${tokenEndpointReference.endpointId}`);
        }
        return endpoint;
    }
}
