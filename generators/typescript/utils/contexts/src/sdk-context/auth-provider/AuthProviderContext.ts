import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";
import { SdkContext } from "../SdkContext";

export class AuthProviderContext {
    private readonly context: SdkContext;

    constructor({
        context
    }: {
        context: SdkContext;
    }) {
        this.context = context;
    }

    public isAuthEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        return this.context.ir.auth.schemes.some((scheme) =>
            scheme._visit({
                bearer: () => false,
                basic: () => false,
                header: () => false,
                oauth: (scheme) => {
                    const schemeTokenEndpoint = this.getOAuthTokenEndpoint(scheme);
                    const schemeRefreshEndpoint = this.getOAuthRefreshEndpoint(scheme);
                    if (schemeTokenEndpoint.id === endpoint.id) {
                        return true;
                    }
                    if (!schemeRefreshEndpoint) {
                        return false;
                    }
                    if (schemeRefreshEndpoint.id === endpoint.id) {
                        return true;
                    }
                    return false;
                },
                inferred: (scheme) => {
                    const schemeEndpoint = this.getInferredAuthTokenEndpoint(scheme);
                    return endpoint.id === schemeEndpoint.id;
                },
                _other: () => false
            })
        );
    }

    public getOAuthTokenEndpoint(scheme: FernIr.OAuthScheme): FernIr.HttpEndpoint {
        const tokenEndpointReference = scheme.configuration.tokenEndpoint.endpointReference;
        const endpoint = this.getOAuthTokenService(scheme).endpoints.find(
            (endpoint: FernIr.HttpEndpoint) => endpoint.id === tokenEndpointReference.endpointId
        );
        if (!endpoint) {
            throw new Error(`failed to find endpoint with id ${tokenEndpointReference.endpointId}`);
        }
        return endpoint;
    }

    public getOAuthTokenService(scheme: FernIr.OAuthScheme): FernIr.HttpService {
        const service = this.context.ir.services[scheme.configuration.tokenEndpoint.endpointReference.serviceId];
        if (!service) {
            throw new Error(
                `failed to find service with id ${scheme.configuration.tokenEndpoint.endpointReference.serviceId}`
            );
        }
        return service;
    }

    public getOAuthRefreshEndpoint(scheme: FernIr.OAuthScheme): FernIr.HttpEndpoint | undefined {
        const refreshEndpointReference = scheme.configuration.refreshEndpoint?.endpointReference;
        if (!refreshEndpointReference) {
            return undefined;
        }
        const endpoint = this.getOAuthRefreshService(scheme)?.endpoints.find(
            (endpoint: FernIr.HttpEndpoint) => endpoint.id === refreshEndpointReference?.endpointId
        );
        if (!endpoint) {
            throw new Error(`failed to find endpoint with id ${refreshEndpointReference?.endpointId}`);
        }
        return endpoint;
    }

    public getOAuthRefreshService(scheme: FernIr.OAuthScheme): FernIr.HttpService | undefined {
        if (!scheme.configuration.refreshEndpoint?.endpointReference) {
            return undefined;
        }
        const service = this.context.ir.services[scheme.configuration.refreshEndpoint.endpointReference.serviceId];
        if (!service) {
            throw new Error(
                `failed to find service with id ${scheme.configuration.refreshEndpoint.endpointReference.serviceId}`
            );
        }
        return service;
    }

    public getPropertiesForAuthTokenParams(
        authScheme: FernIr.AuthScheme
    ): Array<{ name: string; type: ts.TypeNode; isOptional: boolean; docs: string[] | undefined }> {
        if (authScheme.type !== "inferred") {
            return [];
        }

        const endpoint = this.getInferredAuthTokenEndpoint(authScheme);
        const generatedRequestWrapper = this.context.requestWrapper.getGeneratedRequestWrapper(
            authScheme.tokenEndpoint.endpoint.subpackageId
                ? {
                      isRoot: false,
                      subpackageId: authScheme.tokenEndpoint.endpoint.subpackageId
                  }
                : {
                      isRoot: true
                  },
            endpoint.name
        );
        const requestProperties = generatedRequestWrapper.getRequestProperties(this.context);
        const properties: Array<{
            name: string;
            type: ts.TypeNode;
            isOptional: boolean;
            docs: string[] | undefined;
        }> = [];
        for (const property of requestProperties) {
            properties.push({
                name: property.safeName,
                type: property.type,
                isOptional: property.isOptional,
                docs: property.docs
            });
        }

        return properties;
    }

    private getInferredAuthTokenService(authScheme: FernIr.InferredAuthScheme): FernIr.HttpService {
        this.context.logger.info(
            `Inferred auth token service for scheme ${JSON.stringify(authScheme.tokenEndpoint.endpoint)}`
        );
        this.context.logger.info(`IR services: ${Object.keys(this.context.ir.services).join(", ")}`);
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
