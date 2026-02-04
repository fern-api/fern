import { isNonNullish } from "@fern-api/core-utils";
import {
    Environments,
    EnvironmentsConfig,
    MultipleBaseUrlsEnvironment,
    ServerVariable,
    SingleBaseUrlEnvironment
} from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { ServerNameExtension } from "../../extensions/x-fern-server-name";

const DEFAULT_BASE_URL_ID = "Base";
const X_FERN_DEFAULT_URL = "x-fern-default-url";

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        servers?: OpenAPIV3_1.ServerObject[];
        endpointLevelServers?: OpenAPIV3_1.ServerObject[];
    }

    export interface Output {
        value: EnvironmentsConfig;
        defaultUrl?: string;
    }
}

export class ServersConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    ServersConverter.Output | undefined
> {
    private readonly servers?: OpenAPIV3_1.ServerObject[];
    private readonly endpointLevelServers?: OpenAPIV3_1.ServerObject[];

    constructor({ breadcrumbs, context, servers, endpointLevelServers }: ServersConverter.Args) {
        super({ breadcrumbs, context });
        this.servers = servers;
        this.endpointLevelServers = endpointLevelServers;
    }

    public convert(): ServersConverter.Output | undefined {
        if (this.servers == null || this.servers.length === 0 || this.servers[0] == null) {
            return undefined;
        }

        if (this.endpointLevelServers != null && this.endpointLevelServers.length > 0) {
            const defaultBaseUrlId = this.getDefaultBaseUrlName();
            const defaultBaseUrl = {
                id: defaultBaseUrlId,
                name: this.context.casingsGenerator.generateName(defaultBaseUrlId)
            };
            const endpointUrls = this.endpointLevelServers
                .map((server) => {
                    const serverName = ServersConverter.getServerName({
                        server,
                        context: this.context
                    });
                    return {
                        id: serverName,
                        name: this.context.casingsGenerator.generateName(serverName)
                    };
                })
                .filter((url, index, self) => self.findIndex((t) => t.id === url.id) === index);

            const baseUrls = [defaultBaseUrl, ...endpointUrls];

            const environments: MultipleBaseUrlsEnvironment[] = this.servers.map((baseUrl) => {
                const serverName = ServersConverter.getServerName({
                    server: baseUrl,
                    context: this.context
                });
                const endpointLevelServerEntries = this.endpointLevelServers?.map((server) => [
                    ServersConverter.getServerName({ server, context: this.context }),
                    this.getServerUrl(server)
                ]);

                const { defaultUrls, urlTemplates, urlVariables } = this.buildMultiUrlTemplateFields({
                    defaultBaseUrlId,
                    topLevelServer: baseUrl,
                    endpointServers: this.endpointLevelServers ?? []
                });

                return {
                    id: serverName,
                    name: this.context.casingsGenerator.generateName(serverName),
                    urls: {
                        [defaultBaseUrlId]: this.getServerUrl(baseUrl),
                        ...Object.fromEntries(endpointLevelServerEntries ?? [])
                    },
                    docs: baseUrl.description,
                    defaultUrls,
                    urlTemplates,
                    urlVariables
                };
            });

            return {
                value: {
                    defaultEnvironment: environments[0]?.id,
                    environments: Environments.multipleBaseUrls({
                        baseUrls,
                        environments
                    })
                },
                defaultUrl: defaultBaseUrl.id
            };
        }

        // Extract x-fern-default-url from any server that has it
        const fernDefaultUrl = this.extractFernDefaultUrl();

        const environments: SingleBaseUrlEnvironment[] = this.servers
            .map((server) => {
                const serverName = ServersConverter.getServerName({ server, context: this.context });
                const hasVariables = server.variables != null && Object.keys(server.variables).length > 0;

                if (hasVariables && server.variables != null) {
                    // Preserve server variables for runtime URL configuration
                    return {
                        id: serverName,
                        name: this.context.casingsGenerator.generateName(serverName),
                        url: this.maybeRemoveTrailingSlashIfNotEmpty(this.getServerUrl(server)),
                        defaultUrl: fernDefaultUrl,
                        urlTemplate: this.maybeRemoveTrailingSlashIfNotEmpty(server.url),
                        urlVariables: this.convertServerVariables(server.variables),
                        docs: server.description
                    };
                }

                return {
                    id: serverName,
                    name: this.context.casingsGenerator.generateName(serverName),
                    url: this.maybeRemoveTrailingSlashIfNotEmpty(this.getServerUrl(server)),
                    defaultUrl: undefined,
                    urlTemplate: undefined,
                    urlVariables: undefined,
                    docs: server.description
                };
            })
            .filter(isNonNullish);

        return {
            value: {
                defaultEnvironment: environments[0]?.id,
                environments: Environments.singleBaseUrl({
                    environments
                })
            },
            defaultUrl: environments[0]?.id
        };
    }

    /**
     * Converts OpenAPI server variables to IR ServerVariable format.
     */
    private convertServerVariables(variables: Record<string, OpenAPIV3_1.ServerVariableObject>): ServerVariable[] {
        return Object.entries(variables).map(([variableId, variable]) => ({
            id: variableId,
            name: this.context.casingsGenerator.generateName(variableId),
            default: variable.default,
            values: variable.enum
        }));
    }

    public static getServerExtensionName({
        server,
        context
    }: {
        server: OpenAPIV3_1.ServerObject;
        context: AbstractConverterContext<object>;
    }): string | undefined {
        return new ServerNameExtension({ breadcrumbs: [], server, context }).convert();
    }

    public static getServerName({
        server,
        context
    }: {
        server: OpenAPIV3_1.ServerObject & { name?: string };
        context: AbstractConverterContext<object>;
    }): string {
        if (server.name != null) {
            return server.name;
        }
        const serverExtensionName = ServersConverter.getServerExtensionName({ server, context });
        return serverExtensionName ?? server.description ?? server.url;
    }

    private getServerUrl(server: OpenAPIV3_1.ServerObject): string {
        if (server.variables == null) {
            return server.url;
        }

        let url = server.url;
        for (const [variableName, variable] of Object.entries(server.variables)) {
            if (variable.default != null) {
                url = url.replace(`{${variableName}}`, encodeURIComponent(variable.default));
            }
        }
        return url;
    }

    private getDefaultBaseUrlName(): string {
        if (this.servers == null || this.servers.length === 0 || this.servers[0] == null) {
            return DEFAULT_BASE_URL_ID;
        }
        return (
            ServersConverter.getServerExtensionName({
                server: this.servers[0],
                context: this.context
            }) ?? DEFAULT_BASE_URL_ID
        );
    }

    private maybeRemoveTrailingSlashIfNotEmpty(url: string): string {
        return url.endsWith("/") && url !== "/" ? url.slice(0, -1) : url;
    }

    /**
     * Builds defaultUrls, urlTemplates, and urlVariables maps for a MultipleBaseUrlsEnvironment.
     * Only populates these fields when at least one server has variables.
     */
    private buildMultiUrlTemplateFields({
        defaultBaseUrlId,
        topLevelServer,
        endpointServers
    }: {
        defaultBaseUrlId: string;
        topLevelServer: OpenAPIV3_1.ServerObject;
        endpointServers: OpenAPIV3_1.ServerObject[];
    }): {
        defaultUrls: Record<string, string> | undefined;
        urlTemplates: Record<string, string> | undefined;
        urlVariables: Record<string, ServerVariable[]> | undefined;
    } {
        const defaultUrls: Record<string, string> = {};
        const urlTemplates: Record<string, string> = {};
        const urlVariables: Record<string, ServerVariable[]> = {};
        let hasAnyVariables = false;

        // Check top-level server for variables
        if (topLevelServer.variables != null && Object.keys(topLevelServer.variables).length > 0) {
            hasAnyVariables = true;
            const defaultUrl = this.extractFernDefaultUrlFromServer(topLevelServer);
            if (defaultUrl != null) {
                defaultUrls[defaultBaseUrlId] = defaultUrl;
            }
            urlTemplates[defaultBaseUrlId] = this.maybeRemoveTrailingSlashIfNotEmpty(topLevelServer.url);
            urlVariables[defaultBaseUrlId] = this.convertServerVariables(topLevelServer.variables);
        }

        // Check endpoint-level servers for variables
        for (const server of endpointServers) {
            const endpointServerName = ServersConverter.getServerName({ server, context: this.context });
            if (server.variables != null && Object.keys(server.variables).length > 0) {
                hasAnyVariables = true;
                const defaultUrl = this.extractFernDefaultUrlFromServer(server);
                if (defaultUrl != null) {
                    defaultUrls[endpointServerName] = defaultUrl;
                }
                urlTemplates[endpointServerName] = this.maybeRemoveTrailingSlashIfNotEmpty(server.url);
                urlVariables[endpointServerName] = this.convertServerVariables(server.variables);
            }
        }

        if (!hasAnyVariables) {
            return { defaultUrls: undefined, urlTemplates: undefined, urlVariables: undefined };
        }

        return {
            defaultUrls: Object.keys(defaultUrls).length > 0 ? defaultUrls : undefined,
            urlTemplates,
            urlVariables
        };
    }

    /**
     * Extracts the x-fern-default-url extension from a single server object.
     */
    private extractFernDefaultUrlFromServer(server: OpenAPIV3_1.ServerObject): string | undefined {
        const defaultUrl = (server as Record<string, unknown>)[X_FERN_DEFAULT_URL];
        if (typeof defaultUrl === "string") {
            return this.maybeRemoveTrailingSlashIfNotEmpty(defaultUrl);
        }
        return undefined;
    }

    /**
     * Extracts the x-fern-default-url extension from any server in the list.
     * This URL is used as a fallback when no variables are provided.
     */
    private extractFernDefaultUrl(): string | undefined {
        if (this.servers == null) {
            return undefined;
        }
        for (const server of this.servers) {
            const result = this.extractFernDefaultUrlFromServer(server);
            if (result != null) {
                return result;
            }
        }
        return undefined;
    }
}
