import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";

export declare namespace FernIdempotentExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernIdempotentExtension extends AbstractExtension<boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-idempotent";

    constructor({ breadcrumbs, operation }: FernIdempotentExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-idempotent",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
