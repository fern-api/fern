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
        const hasGlobalSecurity = this.context.spec.security != null && this.context.spec.security.length > 0;

        // Convert all OpenAPI security schemes (reused across all branches)
        const openApiSchemes = this.convertOpenApiSecuritySchemes();

        // If we have auth overrides and no global security in OpenAPI, use overrides as primary auth
        if (this.context.authOverrides && !hasGlobalSecurity) {
            // Convert auth overrides to primary auth (this includes both schemes and global auth)
            const overrideAuth = convertApiAuth({
                rawApiFileSchema: this.context.authOverrides,
                casingsGenerator: this.context.casingsGenerator
            });

            // Use override auth as primary with additional OpenAPI schemes for references
            this.addAuthToIR({
                requirement: overrideAuth.requirement,
                schemes: [...overrideAuth.schemes, ...openApiSchemes],
                docs: overrideAuth.docs
            });
            return;
        }

        // If we have auth overrides but there IS global security in OpenAPI, merge them
        if (this.context.authOverrides && hasGlobalSecurity) {
            // First, add auth overrides from generators.yml
            const overrideAuth = convertApiAuth({
                rawApiFileSchema: this.context.authOverrides,
                casingsGenerator: this.context.casingsGenerator
            });

            const allAuthSchemes = [...overrideAuth.schemes, ...openApiSchemes];

            this.addAuthToIR({
                requirement: allAuthSchemes.length === 1 ? "ALL" : "ANY",
                schemes: allAuthSchemes,
                docs: undefined
            });
            return;
        }

        // Original logic: No auth overrides, just convert OpenAPI security schemes
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
}
