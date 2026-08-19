import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernExplorerEnabledExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernExplorerEnabledExtension extends AbstractExtension<boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-explorer-enabled";

    constructor({ breadcrumbs, operation, context }: FernExplorerEnabledExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            this.context.errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-explorer-enabled",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
