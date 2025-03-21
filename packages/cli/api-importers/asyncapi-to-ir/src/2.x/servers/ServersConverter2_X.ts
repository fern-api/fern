import { Environments, EnvironmentsConfig, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../../AsyncAPIConverterContext";
import { ServerV2 } from "../types";

export declare namespace ServersConverter {
    export interface Args extends AbstractConverter.Args {
        servers?: Record<string, ServerV2>;
    }
}

export class ServersConverter2_X extends AbstractConverter<AsyncAPIConverterContext, EnvironmentsConfig | undefined> {
    private readonly servers?: Record<string, ServerV2>;

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
                url: this.constructServerUrl(server.protocol, server.url),
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

    private constructServerUrl(protocol: string, url: string): string {
        if (url.includes("://")) {
            return url;
        }
        return `${protocol}://${url}`;
    }
}
