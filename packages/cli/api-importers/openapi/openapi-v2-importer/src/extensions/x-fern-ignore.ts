import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";
import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";

export declare namespace FernIgnoreExtension {
    export interface Args extends AbstractConverter.Args {
        operation: object;
    }
}

export class FernIgnoreExtension extends AbstractExtension<OpenAPIConverterContext3_1, boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-ignore";

    constructor({ breadcrumbs, operation }: FernIgnoreExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-ignore",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
