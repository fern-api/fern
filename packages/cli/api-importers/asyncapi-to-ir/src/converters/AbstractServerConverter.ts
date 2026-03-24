import { Environments, EnvironmentsConfig, SingleBaseUrlEnvironment } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v3-importer-commons";

import { AsyncAPIConverter } from "../AsyncAPIConverter.js";
import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext.js";

const X_FERN_SERVER_NAME = "x-fern-server-name";

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
            const resolvedServerId = AbstractServerConverter.getServerName(serverId, server);
            const environment: SingleBaseUrlEnvironment = this.buildSingleBaseUrlEnvironment(
                this.context,
                resolvedServerId,
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

    /**
     * Resolves the effective server name by checking for x-fern-server-name extension,
     * falling back to the original server ID (the key in the servers map).
     */
    public static getServerName<T>(serverId: string, server: T): string {
        if (server != null && typeof server === "object") {
            const extensionValue = (server as Record<string, unknown>)[X_FERN_SERVER_NAME];
            if (typeof extensionValue === "string" && extensionValue.length > 0) {
                return extensionValue;
            }
        }
        return serverId;
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
