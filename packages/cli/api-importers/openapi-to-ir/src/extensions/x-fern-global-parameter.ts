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

        if (typeof extensionValue === "string") {
            return [extensionValue];
        }

        if (!Array.isArray(extensionValue)) {
            this.context.errorCollector.collect({
                message: "Received unexpected value for x-fern-global-parameter; expected a string or array of strings",
                path: this.breadcrumbs
            });
            return undefined;
        }

        const result: string[] = [];
        for (const [index, item] of extensionValue.entries()) {
            if (typeof item !== "string") {
                this.context.errorCollector.collect({
                    message: `x-fern-global-parameter[${index}] must be a string`,
                    path: [...this.breadcrumbs, `${index}`]
                });
                continue;
            }
            result.push(item);
        }
        return result.length > 0 ? result : undefined;
    }
}
