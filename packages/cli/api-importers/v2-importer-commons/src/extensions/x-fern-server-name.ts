import { OpenAPIV3_1 } from "openapi-types";

import { AbstractExtension } from "../AbstractExtension";

export declare namespace ServerNameExtension {
    export interface Args extends AbstractExtension.Args {
        server: OpenAPIV3_1.ServerObject;
    }
}

export class ServerNameExtension extends AbstractExtension<string | undefined> {
    private readonly server: OpenAPIV3_1.ServerObject;
    public readonly key = "x-fern-server-name";

    constructor({ breadcrumbs, server, context }: ServerNameExtension.Args) {
        super({ breadcrumbs, context });
        this.server = server;
    }

    public convert(): string | undefined {
        const xNameExtensionValue = this.getExtensionValue(this.server, "x-name");
        if (xNameExtensionValue != null && typeof xNameExtensionValue === "string") {
            return xNameExtensionValue;
        }
        const nameExtensionValue = this.getExtensionValue(this.server, "name");
        if (nameExtensionValue != null && typeof nameExtensionValue === "string") {
            return nameExtensionValue;
        }
        return undefined;
    }
}
