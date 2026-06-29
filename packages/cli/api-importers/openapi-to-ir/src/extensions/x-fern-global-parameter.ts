import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernGlobalParameterExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernGlobalParameterExtension extends AbstractExtension<string[]> {
    private readonly operation: object;
    public readonly key = "x-fern-global-parameter";

    constructor({ breadcrumbs, operation, context }: FernGlobalParameterExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): string[] | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (!Array.isArray(extensionValue)) {
            this.context.errorCollector.collect({
                message: "Received unexpected non-array value for x-fern-global-parameter",
                path: this.breadcrumbs
            });
            return undefined;
        }

        for (const item of extensionValue) {
            if (typeof item !== "string") {
                this.context.errorCollector.collect({
                    message: "Each entry in x-fern-global-parameter must be a string (parameter name)",
                    path: this.breadcrumbs
                });
                return undefined;
            }
        }

        return extensionValue;
    }
}
