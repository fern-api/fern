import { RawSchemas, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    AuthScheme,
    FernIr,
    HttpMethod,
    IntermediateRepresentation,
    OAuthConfiguration,
    RequestPropertyValue
} from "@fern-api/ir-sdk";
import { constructHttpPath, convertApiAuth, convertEnvironments } from "@fern-api/ir-utils";
import {
    AbstractSpecConverter,
    Converters,
    ServersConverter,
    validateOpenApiSpec
} from "@fern-api/v3-importer-commons";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { FernBasePathExtension } from "../extensions/x-fern-base-path.js";
import { FernGlobalHeadersExtension } from "../extensions/x-fern-global-headers.js";
import { convertGlobalHeadersExtension } from "../utils/convertGlobalHeadersExtension.js";
import { OpenAPIConverterContext3_1 } from "./OpenAPIConverterContext3_1.js";
import { WebhookConverter } from "./paths/operations/WebhookConverter.js";
import { PathConverter } from "./paths/PathConverter.js";
import { SecuritySchemeConverter } from "./securitySchemes/SecuritySchemeConverter.js";

export type BaseIntermediateRepresentation = Omit<IntermediateRepresentation, "apiName" | "constants">;

export declare namespace OpenAPIConverter {
    type Args = AbstractSpecConverter.Args<OpenAPIConverterContext3_1>;
}

export class OpenAPIConverter extends AbstractSpecConverter<OpenAPIConverterContext3_1, IntermediateRepresentation> {
    constructor({ breadcrumbs, context, audiences }: AbstractSpecConverter.Args<OpenAPIConverterContext3_1>) {
        super({ breadcrumbs, context, audiences });
    }

    public async convert(): Promise<IntermediateRepresentation> {
        this.context.spec = this.removeXFernIgnores({
            document: this.context.spec
        }) as OpenAPIV3_1.Document;

        this.context.spec = (await this.resolveAllExternalRefs({
            spec: this.context.spec
        })) as OpenAPIV3_1.Document;

        validateOpenApiSpec({
            spec: this.context.spec,
            errorCollector: this.context.errorCollector
        });

        this.overrideOpenApiAuthWithGeneratorsAuth();

        this.convertSecuritySchemes();

        this.convertGlobalHeaders();

        this.convertBasePath();

        this.convertSchemas();

        this.convertWebhooks();

        const { endpointLevelServers, errors } = this.convertPaths();

        this.resolveOAuthEndpointReferences();

        this.addErrorsToIr(errors);

        const { defaultUrl } = this.convertServers({ endpointLevelServers });

        this.updateEndpointsWithDefaultUrl(defaultUrl);

        // Set apiDisplayName from OpenAPI info.title if it's a meaningful value
        const title = this.context.spec.info?.title?.trim();
        if (title && title !== '""') {
            this.ir.apiDisplayName = title;
        }

        return this.finalizeIr();
    }

    private convertGlobalHeaders(): void {
        if (this.context.globalHeaderOverrides) {
            // TODO: Convert global headers to IR
        }

        const globalHeadersExtension = new FernGlobalHeadersExtension({
            breadcrumbs: ["x-fern-global-headers"],
            document: this.context.spec,
            context: this.context
        });
        const convertedGlobalHeaders = globalHeadersExtension.convert();
        if (convertedGlobalHeaders != null) {
            const globalHeaders = convertGlobalHeadersExtension({
                globalHeaders: convertedGlobalHeaders,
                context: this.context
            });
            this.addGlobalHeadersToIr(globalHeaders);
            this.context.setGlobalHeaders(globalHeaders);
        }
    }

    private convertBasePath(): void {
        const basePathExtension = new FernBasePathExtension({
            breadcrumbs: ["x-fern-base-path"],
            document: this.context.spec,
            context: this.context
        });
        const basePath = basePathExtension.convert();
        if (basePath != null) {
            this.ir.basePath = constructHttpPath(basePath);
        }
    }

    private convertSecuritySchemes(): void {
        if (this.context.authOverrides) {
            const overrideAuth = convertApiAuth({
                rawApiFileSchema: this.context.authOverrides,
                casingsGenerator: this.context.casingsGenerator
            });

            this.addAuthToIR({
                requirement: overrideAuth.requirement,
                schemes: overrideAuth.schemes,
                docs: overrideAuth.docs
            });
            return;
        }

        const openApiSchemes = this.convertOpenApiSecuritySchemes();
        if (openApiSchemes.length > 0) {
            this.addAuthToIR({
                requirement: openApiSchemes.length === 1 ? "ALL" : "ANY",
                schemes: openApiSchemes,
                docs: undefined
            });
        }
    }

    private convertOpenApiSecuritySchemes(): AuthScheme[] {
        const securitySchemes: AuthScheme[] = [];

        for (const [id, securityScheme] of Object.entries(this.context.spec.components?.securitySchemes ?? {})) {
            const resolvedSecurityScheme = this.context.resolveMaybeReference<OpenAPIV3_1.SecuritySchemeObject>({
                schemaOrReference: securityScheme,
                breadcrumbs: ["components", "securitySchemes", id]
            });
            if (resolvedSecurityScheme == null) {
                continue;
            }

            const securitySchemeConverter = new SecuritySchemeConverter({
                context: this.context,
                breadcrumbs: ["components", "securitySchemes", id],
                securityScheme: resolvedSecurityScheme,
                schemeId: id
            });
            const convertedScheme = securitySchemeConverter.convert();
            if (convertedScheme != null) {
                securitySchemes.push(convertedScheme);
            }
        }

        return securitySchemes;
    }

    private convertServers({ endpointLevelServers }: { endpointLevelServers?: OpenAPIV3_1.ServerObject[] }): {
        defaultUrl: string | undefined;
    } {
        if (this.context.environmentOverrides) {
            const convertedEnvironments = convertEnvironments({
                rawApiFileSchema: this.context.environmentOverrides,
                casingsGenerator: this.context.casingsGenerator
            });
            if (convertedEnvironments != null) {
                this.addEnvironmentsToIr({
                    environmentConfig: convertedEnvironments.environmentsConfig,
                    audiences: convertedEnvironments.audiences
                });
            }
            return {
                defaultUrl: this.context.environmentOverrides["default-url"]
            };
        }

        const serversConverter = new ServersConverter({
            context: this.context,
            breadcrumbs: ["servers"],
            servers: this.context.spec.servers,
            endpointLevelServers
        });
        const convertedServers = serversConverter.convert();
        this.addEnvironmentsToIr({ environmentConfig: convertedServers?.value });
        return {
            defaultUrl: convertedServers?.defaultUrl
        };
    }

    private convertSchemas(): void {
        for (const [id, schema] of Object.entries(this.context.spec.components?.schemas ?? {})) {
            const schemaConverter = new Converters.SchemaConverters.SchemaConverter({
                context: this.context,
                id,
                breadcrumbs: ["components", "schemas", id],
                schema
            });
            const convertedSchema = schemaConverter.convert();
            if (convertedSchema != null) {
                this.addSchemaOutputToIr(id, convertedSchema);
            }
        }
    }

    private convertWebhooks(): void {
        for (const [webhookName, webhookItem] of Object.entries(this.context.spec.webhooks ?? {})) {
            if (webhookItem == null) {
                this.context.errorCollector.collect({
                    message: "Skipping empty webhook",
                    path: this.breadcrumbs
                });
                continue;
            }

            if (!("post" in webhookItem) || webhookItem.post == null) {
                this.context.errorCollector.collect({
                    message: "Skipping webhook as it is not a POST method",
                    path: this.breadcrumbs
                });
                continue;
            }

            const operationId = webhookItem.post.operationId ?? webhookName;
            const operation =
                webhookItem.post.operationId != null ? webhookItem.post : { ...webhookItem.post, operationId };
            const webHookConverter = new WebhookConverter({
                context: this.context,
                breadcrumbs: ["webhooks", operationId],
                operation,
                method: OpenAPIV3.HttpMethods.POST,
                path: operationId
            });

            const convertedWebHook = webHookConverter.convert();

            if (convertedWebHook != null) {
                this.addWebhookToIr({
                    webhook: convertedWebHook.webhook,
                    operationId,
                    audiences: convertedWebHook.audiences,
                    group: convertedWebHook.group
                });
                this.addTypesToIr(convertedWebHook.inlinedTypes);
            }
        }
    }

    private convertPaths(): {
        endpointLevelServers?: OpenAPIV3_1.ServerObject[];
        errors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration>;
    } {
        const endpointLevelServers: OpenAPIV3_1.ServerObject[] = [];
        const errors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration> = {};

        for (const [path, pathItem] of Object.entries(this.context.spec.paths ?? {})) {
            if (pathItem == null) {
                continue;
            }

            const pathConverter = new PathConverter({
                context: this.context,
                breadcrumbs: ["paths", path],
                topLevelServers: this.context.spec.servers,
                pathItem,
                path
            });
            const convertedPath = pathConverter.convert();
            if (convertedPath != null) {
                for (const endpoint of convertedPath.endpoints) {
                    if (endpoint.streamEndpoint != null) {
                        this.addEndpointToIr({
                            endpoint: endpoint.streamEndpoint,
                            audiences: endpoint.audiences,
                            endpointGroup: endpoint.group,
                            endpointGroupDisplayName: endpoint.groupDisplayName
                        });
                    }

                    this.addEndpointToIr({
                        endpoint: endpoint.endpoint,
                        audiences: endpoint.audiences,
                        endpointGroup: endpoint.group,
                        endpointGroupDisplayName: endpoint.groupDisplayName
                    });

                    if (endpoint.servers) {
                        for (const server of endpoint.servers) {
                            if (
                                this.shouldAddServerToCollectedServers({
                                    server,
                                    currentServers: endpointLevelServers
                                })
                            ) {
                                endpointLevelServers.push(server);
                            }
                        }
                    }
                    if (endpoint.errors) {
                        // TODO: For SDK-IR, errorIds are not guaranteed to be unique.
                        // We'll want to override the type to unknown if errorId is already present.
                        for (const [errorId, error] of Object.entries(endpoint.errors)) {
                            errors[errorId] = error;
                        }
                    }
                }

                for (const webhook of convertedPath.webhooks) {
                    const group = this.context.getGroup({
                        groupParts: webhook.group,
                        namespace: this.context.namespace
                    });
                    this.addWebhookToIr({
                        webhook: webhook.webhook,
                        operationId: group.join("."),
                        group,
                        audiences: webhook.audiences
                    });
                }
                this.addTypesToIr(convertedPath.inlinedTypes);
            }
        }
        return { endpointLevelServers, errors };
    }

    private overrideOpenApiAuthWithGeneratorsAuth(): void {
        if (!this.context.authOverrides?.["auth-schemes"]) {
            return;
        }

        if (!this.context.spec.components) {
            this.context.spec.components = {};
        }
        this.context.spec.components.securitySchemes = {};

        const securityRequirement: OpenAPIV3_1.SecurityRequirementObject = {};
        for (const schemeId of Object.keys(this.context.authOverrides["auth-schemes"])) {
            this.context.spec.components.securitySchemes[schemeId] = { type: "http", scheme: "bearer" };
            securityRequirement[schemeId] = [];
        }

        this.context.spec.security = [securityRequirement];
        this.removeEndpointSpecificAuth();
    }

    private resolveOAuthEndpointReferences(): void {
        if (!this.context.authOverrides?.["auth-schemes"] || !this.ir.auth) {
            return;
        }

        const authSchemes = this.context.authOverrides["auth-schemes"];
        const updatedSchemes: AuthScheme[] = [];

        for (const scheme of this.ir.auth.schemes) {
            // Only replace bearer schemes that were placeholders for OAuth
            if (scheme.type !== "bearer") {
                updatedSchemes.push(scheme);
                continue;
            }

            const rawDeclaration = authSchemes[scheme.key];
            if (rawDeclaration == null) {
                updatedSchemes.push(scheme);
                continue;
            }

            const resolvedScheme = visitRawAuthSchemeDeclaration<AuthScheme | undefined>(rawDeclaration, {
                header: () => undefined,
                basic: () => undefined,
                tokenBearer: () => undefined,
                inferredBearer: () => undefined,
                oauth: (oauthScheme) => this.resolveOAuthScheme({ key: scheme.key, oauthScheme })
            });

            updatedSchemes.push(resolvedScheme ?? scheme);
        }

        this.ir.auth = {
            ...this.ir.auth,
            schemes: updatedSchemes
        };
    }

    private resolveOAuthScheme({
        key,
        oauthScheme
    }: {
        key: string;
        oauthScheme: RawSchemas.OAuthSchemeSchema;
    }): AuthScheme | undefined {
        if (oauthScheme.type !== "client-credentials") {
            return undefined;
        }

        const tokenEndpointConfig = oauthScheme["get-token"];
        const parsed = this.parseEndpointReference(tokenEndpointConfig.endpoint);
        if (parsed == null) {
            return undefined;
        }

        const { method, path } = parsed;
        const resolved = this.findEndpointInIr({ method, path });
        if (resolved == null) {
            this.context.errorCollector.collect({
                message: `Could not resolve OAuth token endpoint: ${tokenEndpointConfig.endpoint}`,
                path: ["auth-schemes"]
            });
            return undefined;
        }

        const { endpoint, serviceId, subpackageId } = resolved;

        const requestProperties = tokenEndpointConfig["request-properties"];
        const responseProperties = tokenEndpointConfig["response-properties"];

        const clientIdProp = this.findRequestBodyProperty({
            endpoint,
            wireValue: this.extractPropertyName(requestProperties?.["client-id"]) ?? "client_id"
        });
        const clientSecretProp = this.findRequestBodyProperty({
            endpoint,
            wireValue: this.extractPropertyName(requestProperties?.["client-secret"]) ?? "client_secret"
        });
        const accessTokenProp = this.findResponseProperty({
            endpoint,
            wireValue: this.extractPropertyName(responseProperties?.["access-token"]) ?? "access_token"
        });

        if (clientIdProp == null || clientSecretProp == null || accessTokenProp == null) {
            this.context.errorCollector.collect({
                message: `Could not resolve OAuth token endpoint properties for: ${tokenEndpointConfig.endpoint}`,
                path: ["auth-schemes"]
            });
            return undefined;
        }

        const expiresInProp = this.findResponseProperty({
            endpoint,
            wireValue: this.extractPropertyName(responseProperties?.["expires-in"]) ?? "expires_in"
        });
        const refreshTokenProp = this.findResponseProperty({
            endpoint,
            wireValue: this.extractPropertyName(responseProperties?.["refresh-token"]) ?? "refresh_token"
        });

        let refreshEndpoint: FernIr.OAuthRefreshEndpoint | undefined;
        const refreshTokenConfig = oauthScheme["refresh-token"];
        if (refreshTokenConfig != null) {
            refreshEndpoint = this.resolveRefreshEndpoint({ refreshTokenConfig });
        }

        return AuthScheme.oauth({
            key,
            docs: oauthScheme.docs,
            configuration: OAuthConfiguration.clientCredentials({
                clientIdEnvVar: oauthScheme["client-id-env"],
                clientSecretEnvVar: oauthScheme["client-secret-env"],
                tokenPrefix: oauthScheme["token-prefix"],
                tokenHeader: oauthScheme["token-header"],
                scopes: oauthScheme.scopes,
                tokenEndpoint: {
                    endpointReference: {
                        endpointId: endpoint.id,
                        serviceId,
                        subpackageId
                    },
                    requestProperties: {
                        clientId: clientIdProp,
                        clientSecret: clientSecretProp,
                        scopes: undefined,
                        customProperties: undefined
                    },
                    responseProperties: {
                        accessToken: accessTokenProp,
                        expiresIn: expiresInProp,
                        refreshToken: refreshTokenProp
                    }
                },
                refreshEndpoint
            })
        });
    }

    private resolveRefreshEndpoint({
        refreshTokenConfig
    }: {
        refreshTokenConfig: RawSchemas.OAuthRefreshTokenEndpointSchema;
    }): FernIr.OAuthRefreshEndpoint | undefined {
        const parsed = this.parseEndpointReference(refreshTokenConfig.endpoint);
        if (parsed == null) {
            return undefined;
        }

        const resolved = this.findEndpointInIr(parsed);
        if (resolved == null) {
            return undefined;
        }

        const { endpoint, serviceId, subpackageId } = resolved;
        const responseProperties = refreshTokenConfig["response-properties"];
        const requestProperties = refreshTokenConfig["request-properties"];

        const refreshTokenReqProp = this.findRequestBodyProperty({
            endpoint,
            wireValue: this.extractPropertyName(requestProperties?.["refresh-token"]) ?? "refresh_token"
        });
        const accessTokenProp = this.findResponseProperty({
            endpoint,
            wireValue: this.extractPropertyName(responseProperties?.["access-token"]) ?? "access_token"
        });

        if (refreshTokenReqProp == null || accessTokenProp == null) {
            return undefined;
        }

        const expiresInProp = this.findResponseProperty({
            endpoint,
            wireValue: this.extractPropertyName(responseProperties?.["expires-in"]) ?? "expires_in"
        });
        const refreshTokenRespProp = this.findResponseProperty({
            endpoint,
            wireValue: this.extractPropertyName(responseProperties?.["refresh-token"]) ?? "refresh_token"
        });

        return {
            endpointReference: {
                endpointId: endpoint.id,
                serviceId,
                subpackageId
            },
            requestProperties: {
                refreshToken: refreshTokenReqProp
            },
            responseProperties: {
                accessToken: accessTokenProp,
                expiresIn: expiresInProp,
                refreshToken: refreshTokenRespProp
            }
        };
    }

    private parseEndpointReference(endpointRef: string): { method: HttpMethod; path: string } | undefined {
        const parts = endpointRef.trim().split(/\s+/);
        if (parts.length !== 2) {
            return undefined;
        }
        const [methodStr, path] = parts;
        const method = this.parseHttpMethod(methodStr ?? "");
        if (method == null || path == null) {
            return undefined;
        }
        return { method, path };
    }

    private parseHttpMethod(method: string): HttpMethod | undefined {
        switch (method.toUpperCase()) {
            case "GET":
                return HttpMethod.Get;
            case "POST":
                return HttpMethod.Post;
            case "PUT":
                return HttpMethod.Put;
            case "PATCH":
                return HttpMethod.Patch;
            case "DELETE":
                return HttpMethod.Delete;
            default:
                return undefined;
        }
    }

    private findEndpointInIr({ method, path }: { method: HttpMethod; path: string }):
        | {
              endpoint: FernIr.HttpEndpoint;
              serviceId: string;
              subpackageId: string | undefined;
          }
        | undefined {
        const normalizedPath = path.replace(/\/+$/, "");

        for (const [serviceId, service] of Object.entries(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.method !== method) {
                    continue;
                }

                const endpointPath = this.reconstructPath(endpoint.fullPath);
                if (endpointPath === normalizedPath) {
                    const subpackageId = this.findSubpackageForService(serviceId);
                    return { endpoint, serviceId, subpackageId };
                }
            }
        }
        return undefined;
    }

    private reconstructPath(httpPath: FernIr.HttpPath): string {
        let result = httpPath.head;
        for (const part of httpPath.parts) {
            result += `{${part.pathParameter}}${part.tail}`;
        }
        return result.replace(/\/+$/, "");
    }

    private findSubpackageForService(serviceId: string): string | undefined {
        for (const [subpackageId, subpackage] of Object.entries(this.ir.subpackages)) {
            if (subpackage.service === serviceId) {
                return subpackageId;
            }
        }
        return undefined;
    }

    private extractPropertyName(value: string | undefined): string | undefined {
        if (value == null) {
            return undefined;
        }
        // Handle $request.propertyName or $response.propertyName format
        const match = value.match(/^\$(?:request|response)\.(.+)$/);
        return match?.[1] ?? value;
    }

    private findRequestBodyProperty({
        endpoint,
        wireValue
    }: {
        endpoint: FernIr.HttpEndpoint;
        wireValue: string;
    }): FernIr.RequestProperty | undefined {
        if (endpoint.requestBody == null) {
            return undefined;
        }

        if (endpoint.requestBody.type === "inlinedRequestBody") {
            for (const prop of endpoint.requestBody.properties) {
                if (prop.name.wireValue === wireValue) {
                    return {
                        propertyPath: undefined,
                        property: RequestPropertyValue.body({
                            name: prop.name,
                            valueType: prop.valueType,
                            availability: prop.availability,
                            docs: prop.docs,
                            propertyAccess: prop.propertyAccess,
                            v2Examples: prop.v2Examples
                        })
                    };
                }
            }
        }

        return undefined;
    }

    private findResponseProperty({
        endpoint,
        wireValue
    }: {
        endpoint: FernIr.HttpEndpoint;
        wireValue: string;
    }): FernIr.ResponseProperty | undefined {
        if (endpoint.response?.body == null) {
            return undefined;
        }

        if (endpoint.response.body.type === "json") {
            const jsonResponse = endpoint.response.body;
            if (jsonResponse.value.responseBodyType.type === "named") {
                const typeId = jsonResponse.value.responseBodyType.typeId;
                if (typeId != null) {
                    const typeDecl = this.ir.types[typeId];
                    if (typeDecl?.shape.type === "object") {
                        for (const prop of typeDecl.shape.properties) {
                            if (prop.name.wireValue === wireValue) {
                                return {
                                    propertyPath: undefined,
                                    property: prop
                                };
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    }

    private removeEndpointSpecificAuth(): void {
        if (!this.context.spec.paths) {
            return;
        }

        for (const pathItem of Object.values(this.context.spec.paths)) {
            if (!pathItem) {
                continue;
            }

            const methods = ["get", "post", "put", "patch", "delete", "options", "head", "trace"] as const;
            for (const method of methods) {
                const operation = pathItem[method];
                if (operation?.security) {
                    delete operation.security;
                }
            }
        }
    }
}
