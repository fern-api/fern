import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernRequestBodyUnwrapExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }

    /**
     * A list of property-name segments, e.g. `["data", "attributes"]`.
     * Generators should flatten the properties of the nested object at this
     * path into the SDK method signature while still serializing to the full
     * nested wire format.
     */
    export type Output = string[];
}

export class FernRequestBodyUnwrapExtension extends AbstractExtension<FernRequestBodyUnwrapExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-request-body-unwrap";

    constructor({ breadcrumbs, operation, context }: FernRequestBodyUnwrapExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): FernRequestBodyUnwrapExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            this.context.errorCollector.collect({
                message: "Expected a dot-separated string for x-fern-request-body-unwrap (e.g. \"data.attributes\")",
                path: this.breadcrumbs
            });
            return undefined;
        }

        const segments = extensionValue.split(".").filter((segment) => segment.length > 0);
        if (segments.length === 0) {
            this.context.errorCollector.collect({
                message: "x-fern-request-body-unwrap must contain at least one property name",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return segments;
    }
}
