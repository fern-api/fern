import { OpenAPIV3_1 } from "openapi-types";

import { AbstractExtension } from "../AbstractExtension";

export declare namespace ServerFromOperationNameExtension {
    export interface Args extends AbstractExtension.Args {
        operation: OpenAPIV3_1.OperationObject;
    }
}

export class ServerFromOperationNameExtension extends AbstractExtension<string | undefined> {
    private readonly operation: OpenAPIV3_1.OperationObject;
    public readonly key = "x-fern-server-name";

    constructor({ breadcrumbs, operation, context }: ServerFromOperationNameExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.operation, "x-name");
        if (extensionValue == null || typeof extensionValue !== "string") {
            return undefined;
        }

        return extensionValue;
    }
}
