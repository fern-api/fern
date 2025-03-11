import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";

export declare namespace ServerNameExtension {
    export interface Args extends AbstractConverter.Args {
        server: OpenAPIV3_1.ServerObject;
    }
}

export class ServerNameExtension extends AbstractExtension<OpenAPIConverterContext3_1, string | undefined> {
    private readonly server: OpenAPIV3_1.ServerObject;
    public readonly key = "x-fern-server-name";

    constructor({ breadcrumbs, server }: ServerNameExtension.Args) {
        super({ breadcrumbs });
        this.server = server;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): string | undefined {
        const extensionValue = this.getExtensionValue(this.server);
        if (extensionValue == null || typeof extensionValue !== "string") {
            return undefined;
        }

        return extensionValue;
    }
}
