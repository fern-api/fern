import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import { Environments, EnvironmentsConfig, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { ServerNameExtension } from "../../extensions/x-fern-server-name";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.Args {
        servers?: OpenAPIV3_1.ServerObject[];
    }
}

export class ServersConverter extends AbstractConverter<OpenAPIConverterContext3_1, EnvironmentsConfig | undefined> {
    private readonly servers?: OpenAPIV3_1.ServerObject[];

    constructor({ breadcrumbs, servers }: ServersConverter.Args) {
        super({ breadcrumbs });
        this.servers = servers;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): EnvironmentsConfig | undefined {
        if (this.servers == null || this.servers.length === 0 || this.servers[0] == null) {
            return undefined;
        }

        let environments: SingleBaseUrlEnvironment[];

        // Check if any servers have the ServerNameExtension
        const hasServerNames = this.servers.some((server) => {
            const ext = new ServerNameExtension({ breadcrumbs: this.breadcrumbs, server });
            return ext.convert({ context, errorCollector }) != null;
        });

        if (!hasServerNames) {
            // If no server names, just return a single "Default" environment
            environments = [
                {
                    id: "default",
                    name: context.casingsGenerator.generateName("Default"),
                    url: this.getServerUrl(this.servers[0]),
                    docs: this.servers[0].description
                }
            ];
        } else {
            // Use server names from extension
            environments = this.servers
                .map((server) => {
                    const serverNameExtension = new ServerNameExtension({ breadcrumbs: this.breadcrumbs, server });
                    const serverName = serverNameExtension.convert({ context, errorCollector });
                    if (serverName == null) {
                        return undefined;
                    }
                    return {
                        id: serverName,
                        name: context.casingsGenerator.generateName(serverName),
                        url: this.getServerUrl(server),
                        docs: server.description
                    };
                })
                .filter(isNonNullish);
        }

        return {
            defaultEnvironment: environments[0]?.id,
            environments: Environments.singleBaseUrl({
                environments
            })
        };
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
