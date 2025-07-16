import { AbstractExtension } from "../AbstractExtension";

export declare namespace AudienceExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }

    export interface Output {
        audiences: string[];
    }
}

export class AudienceExtension extends AbstractExtension<AudienceExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-audiences";

    constructor({ breadcrumbs, operation, context }: AudienceExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): AudienceExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const audiences = Array.isArray(extensionValue)
            ? extensionValue.filter((name): name is string => typeof name === "string")
            : typeof extensionValue === "string"
              ? [extensionValue]
              : [];

        if (audiences.length === 0) {
            return undefined;
        }

        return {
            audiences
        };
    }
}
