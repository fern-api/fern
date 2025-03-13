import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import { Environments, EnvironmentsConfig, MultipleBaseUrlsEnvironment, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { ServerNameExtension } from "../../extensions/x-fern-server-name";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.Args {
        servers?: OpenAPIV3_1.ServerObject[];
        endpointLevelServers?: OpenAPIV3_1.ServerObject[];
    }

    export interface Output {
        value: EnvironmentsConfig;
        defaultUrl?: string;
    }
}

export class ServersConverter extends AbstractConverter<OpenAPIConverterContext3_1, ServersConverter.Output | undefined> {
    private readonly servers?: OpenAPIV3_1.ServerObject[];
    private readonly endpointLevelServers?: OpenAPIV3_1.ServerObject[];

    constructor({ breadcrumbs, servers, endpointLevelServers }: ServersConverter.Args) {
        super({ breadcrumbs });
        this.servers = servers;
        this.endpointLevelServers = endpointLevelServers;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): ServersConverter.Output | undefined {
        if (this.servers == null || this.servers.length === 0 || this.servers[0] == null) {
            return undefined;
        }

        if (this.endpointLevelServers != null && this.endpointLevelServers.length > 0) {

            const multiUrlServers = [this.servers[0], ...this.endpointLevelServers];

            const environments: MultipleBaseUrlsEnvironment[] = [{
                id: "Default",
                name: context.casingsGenerator.generateName("Default"),
                urls: Object.fromEntries(multiUrlServers.map((server) => [ServersConverter.getServerName({ server, errorCollector, context, }), this.getServerUrl(server)])),
                docs: undefined,
            }];

            return {
                value: {
                    defaultEnvironment: environments[0]?.id,
                    environments: Environments.multipleBaseUrls({
                        baseUrls: [],
                        environments
                    })
                },
                defaultUrl: ServersConverter.getServerName({ server: this.servers[0], errorCollector, context, })
            }
        }

        const environments: SingleBaseUrlEnvironment[] = this.servers
            .map((server) => {
                const serverName = ServersConverter.getServerName({ server, context, errorCollector });
                return {
                    id: serverName,
                    name: context.casingsGenerator.generateName(serverName),
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
        }
    }

    public static getServerName({
        server,
        context,
        errorCollector
    }: {
        server: OpenAPIV3_1.ServerObject;
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): string {
        const serverNameExtension = new ServerNameExtension({ breadcrumbs: [], server });
        const serverName = serverNameExtension.convert({ context, errorCollector });
        return serverName ?? server.url;
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
