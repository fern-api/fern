import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernPlaygroundEnabledExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernPlaygroundEnabledExtension extends AbstractExtension<boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-playground-enabled";

    constructor({ breadcrumbs, operation, context }: FernPlaygroundEnabledExtension.Args) {
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
                message: "Received unexpected non-boolean value for x-fern-playground-enabled",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
