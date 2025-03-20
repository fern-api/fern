import { Environments, EnvironmentsConfig, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { ServerV3 } from "../types";

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.Args {
        servers?: Record<string, ServerV3>;
    }
}

export class ServersConverter3_0 extends AbstractConverter<AsyncAPIConverterContext, EnvironmentsConfig | undefined> {
    private readonly servers?: Record<string, ServerV3>;

    constructor({ breadcrumbs, servers }: ServersConverter.Args) {
        super({ breadcrumbs });
        this.servers = servers;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): EnvironmentsConfig | undefined {
        if (this.servers == null || Object.keys(this.servers).length === 0) {
            return undefined;
        }

        const environments: SingleBaseUrlEnvironment[] = [];
        let defaultEnvironmentId: string | undefined;

        for (const [serverId, server] of Object.entries(this.servers)) {
            const environment: SingleBaseUrlEnvironment = {
                id: serverId,
                name: context.casingsGenerator.generateName(serverId),
                url: this.constructServerUrl(server.protocol, server.host),
                docs: undefined
            };
            environments.push(environment);

            if (defaultEnvironmentId == null) {
                defaultEnvironmentId = environment.id;
            }
        }

        return {
            defaultEnvironment: defaultEnvironmentId,
            environments: Environments.singleBaseUrl({
                environments
            })
        };
    }

    private constructServerUrl(protocol: string, host: string): string {
        if (host.includes("://")) {
            return host;
        }
        return `${protocol}://${host}`;
    }
}
