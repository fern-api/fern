import { Environments, EnvironmentsConfig, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverter } from "../AsyncAPIConverter";
import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";

export declare namespace AbstractServerConverter {
    export interface Args<TServer> extends AsyncAPIConverter.AbstractArgs {
        servers?: Record<string, TServer>;
    }
}

export abstract class AbstractServerConverter<TServer> extends AbstractConverter<
    AsyncAPIConverterContext,
    EnvironmentsConfig | undefined
> {
    protected readonly servers?: Record<string, TServer>;

    constructor({ context, breadcrumbs, servers }: AbstractServerConverter.Args<TServer>) {
        super({ context, breadcrumbs });
        this.servers = servers;
    }

    public convert(): EnvironmentsConfig | undefined {
        if (this.servers == null || Object.keys(this.servers).length === 0) {
            return undefined;
        }

        const environments: SingleBaseUrlEnvironment[] = [];
        let defaultEnvironmentId: string | undefined;

        for (const [serverId, server] of Object.entries(this.servers)) {
            const environment: SingleBaseUrlEnvironment = this.buildSingleBaseUrlEnvironment(
                this.context,
                serverId,
                server
            );
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

    protected abstract buildSingleBaseUrlEnvironment(
        context: AsyncAPIConverterContext,
        serverId: string,
        server: TServer
    ): SingleBaseUrlEnvironment;

    protected constructServerUrl(protocol: string, url: string): string {
        if (url.includes("://")) {
            return url;
        }
        return `${protocol}://${url}`;
    }
}
