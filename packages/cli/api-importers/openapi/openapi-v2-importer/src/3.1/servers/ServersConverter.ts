import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import { EnvironmentUrl, Environments, EnvironmentsConfig, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
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
                    url: this.servers[0].url as EnvironmentUrl,
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
                        url: server.url,
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
}
