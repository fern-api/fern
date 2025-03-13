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
        // TODO (Eden): Correctly handle multiple servers
        if (this.servers == null || Object.keys(this.servers).length === 0) {
            return undefined;
        }

        const serverEntries = Object.entries(this.servers);
        const firstServer = serverEntries[0]?.[1];
        if (firstServer == null) {
            return undefined;
        }

        const environments: SingleBaseUrlEnvironment[] = [
            {
                id: "default",
                name: context.casingsGenerator.generateName("Default"),
                url: this.constructServerUrl(firstServer.protocol, firstServer.url),
                docs: undefined
            }
        ];

        return {
            defaultEnvironment: environments[0]?.id,
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
