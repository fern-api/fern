import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";


export declare namespace ServerNameExtension {
    export interface Args extends AbstractExtension.Args {
        server: OpenAPIV3_1.ServerObject;
    }
}

export class ServerNameExtension extends AbstractExtension<string | undefined> {
    private readonly server: OpenAPIV3_1.ServerObject;
    public readonly key = "x-fern-server-name";

    constructor({ breadcrumbs, server }: ServerNameExtension.Args) {
        super({ breadcrumbs });
        this.server = server;
    }

    public convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): string | undefined {
        const extensionValue = this.getExtensionValue(this.server);
        if (extensionValue == null || typeof extensionValue !== "string") {
            return undefined;
        }

        return extensionValue;
    }
}
