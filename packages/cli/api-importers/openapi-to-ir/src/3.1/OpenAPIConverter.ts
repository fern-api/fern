import { AuthScheme, FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { convertApiAuth, convertEnvironments } from "@fern-api/ir-utils";
import { AbstractSpecConverter, Converters, ServersConverter } from "@fern-api/v3-importer-commons";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { FernGlobalHeadersExtension } from "../extensions/x-fern-global-headers";
import { convertGlobalHeadersExtension } from "../utils/convertGlobalHeadersExtension";
import { OpenAPIConverterContext3_1 } from "./OpenAPIConverterContext3_1";
import { WebhookConverter } from "./paths/operations/WebhookConverter";
import { PathConverter } from "./paths/PathConverter";
import { SecuritySchemeConverter } from "./securitySchemes/SecuritySchemeConverter";

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

        this.overrideOpenApiAuthWithGeneratorsAuth();

        this.convertSecuritySchemes();

        this.convertGlobalHeaders();

        this.convertSchemas();

        this.convertWebhooks();

        const { endpointLevelServers, errors } = this.convertPaths();

        this.addErrorsToIr(errors);

        const { defaultUrl } = this.convertServers({ endpointLevelServers });

        this.updateEndpointsWithDefaultUrl(defaultUrl);

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

    private convertSecuritySchemes(): void {
        // If we have auth overrides, they have already been injected into the OpenAPI spec
        // by overrideOpenApiAuthWithGeneratorsAuth(), so we can just convert normally
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

        // No auth overrides, just convert OpenAPI security schemes normally
        const openApiSchemes = this.convertOpenApiSecuritySchemes();
        if (openApiSchemes.length > 0) {
            // TODO(kenny): we're not using `requirement` here, and should remove.
            //              this field is oversimplified, since it implies either all,
            //              or any, but endpoints can have a subset.
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
        for (const [, webhookItem] of Object.entries(this.context.spec.webhooks ?? {})) {
            if (webhookItem == null) {
                this.context.errorCollector.collect({
                    message: "Skipping empty webhook",
                    path: this.breadcrumbs
                });
                continue;
            }

            if (!("post" in webhookItem)) {
                this.context.errorCollector.collect({
                    message: "Skipping webhook as it is not a POST method",
                    path: this.breadcrumbs
                });
                continue;
            }

            if (webhookItem.post?.operationId == null) {
                this.context.errorCollector.collect({
                    message: "Skipping webhook as no operationId is present",
                    path: this.breadcrumbs
                });
                continue;
            }

            const operationId = webhookItem.post.operationId;
            const webHookConverter = new WebhookConverter({
                context: this.context,
                breadcrumbs: ["webhooks", operationId],
                operation: webhookItem.post,
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
        if (!this.context.authOverrides) {
            return;
        }

        // Step 1: Replace all OpenAPI security schemes with generators.yml auth schemes
        // We need to convert generators.yml auth to OpenAPI security scheme format
        const generatorsAuth = this.context.authOverrides;

        if (!generatorsAuth["auth-schemes"]) {
            return;
        }

        // Clear existing security schemes
        if (!this.context.spec.components) {
            this.context.spec.components = {};
        }
        this.context.spec.components.securitySchemes = {};

        // Convert generators.yml auth schemes to OpenAPI security schemes
        const newSecurityRequirement: OpenAPIV3_1.SecurityRequirementObject = {};

        for (const [schemeId, schemeConfig] of Object.entries(generatorsAuth["auth-schemes"])) {
            // Convert each generators.yml auth scheme to OpenAPI format
            const openApiSecurityScheme = this.convertGeneratorsAuthToOpenApiScheme(schemeConfig);
            if (openApiSecurityScheme) {
                this.context.spec.components.securitySchemes[schemeId] = openApiSecurityScheme;
                // Add to global security requirement
                newSecurityRequirement[schemeId] = [];
            }
        }

        // Step 2: Set generators.yml auth as global security
        this.context.spec.security = [newSecurityRequirement];

        // Step 3: Remove endpoint-specific auth from all paths
        this.removeEndpointSpecificAuth();
    }

    private convertGeneratorsAuthToOpenApiScheme(schemeConfig: any): OpenAPIV3_1.SecuritySchemeObject | null {
        if (!schemeConfig.scheme) {
            return null;
        }

        switch (schemeConfig.scheme) {
            case "bearer":
                return {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                };
            case "basic":
                return {
                    type: "http",
                    scheme: "basic"
                };
            case "api-key":
                return {
                    type: "apiKey",
                    in: schemeConfig.header?.name ? "header" : "query",
                    name: schemeConfig.header?.name || schemeConfig.query?.name || "Authorization"
                };
            default:
                return null;
        }
    }

    private removeEndpointSpecificAuth(): void {
        if (!this.context.spec.paths) {
            return;
        }

        for (const [path, pathItem] of Object.entries(this.context.spec.paths)) {
            if (!pathItem) continue;

            // Remove security from all HTTP methods
            const methods = ["get", "post", "put", "patch", "delete", "options", "head", "trace"] as const;
            for (const method of methods) {
                const operation = pathItem[method];
                if (operation && "security" in operation) {
                    delete operation.security;
                }
            }
        }
    }
}
