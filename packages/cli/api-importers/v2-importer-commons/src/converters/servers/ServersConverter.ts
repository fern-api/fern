import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import {
    Environments,
    EnvironmentsConfig,
    MultipleBaseUrlsEnvironment,
    SingleBaseUrlEnvironment
} from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { ServerNameExtension } from "../../extensions/x-fern-server-name";

const DEFAULT_BASE_URL_ID = "Base";

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.AbstractArgs  {
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
            const defaultBaseUrl = {
                id: DEFAULT_BASE_URL_ID,
                name: this.context.casingsGenerator.generateName(DEFAULT_BASE_URL_ID)
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
                const endpointLevelServers = this.endpointLevelServers?.map((server) => [
                    ServersConverter.getServerName({ server, context: this.context }),
                    this.getServerUrl(server)
                ]);
                return {
                    id: serverName,
                    name: this.context.casingsGenerator.generateName(serverName),
                    urls: {
                        [DEFAULT_BASE_URL_ID]: this.getServerUrl(baseUrl),
                        ...Object.fromEntries(endpointLevelServers ?? [])
                    },
                    docs: baseUrl.description
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
                defaultUrl: ServersConverter.getServerName({
                    server: this.servers[0],
                    context: this.context
                })
            };
        }

        const environments: SingleBaseUrlEnvironment[] = this.servers
            .map((server) => {
                const serverName = ServersConverter.getServerName({ server, context: this.context });
                return {
                    id: serverName,
                    name: this.context.casingsGenerator.generateName(serverName),
                    url: this.getServerUrl(server),
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
            }
        };
    }

    public static getServerName({
        server,
        context
    }: {
        server: OpenAPIV3_1.ServerObject;
        context: AbstractConverterContext<object>;
    }): string {
        const serverNameExtension = new ServerNameExtension({ breadcrumbs: [], server, context });
        const serverName = serverNameExtension.convert();
        return serverName ?? server.description ?? server.url;
    }

    private getServerUrl(server: OpenAPIV3_1.ServerObject): string {
        if (server.variables == null) {
            return server.url;
        }

        let url = server.url;
        for (const [variableName, variable] of Object.entries(server.variables)) {
            if (variable.default != null) {
                url = url.replace(`{${variableName}}`, variable.default);
            }
        }
        return url;
    }
}
