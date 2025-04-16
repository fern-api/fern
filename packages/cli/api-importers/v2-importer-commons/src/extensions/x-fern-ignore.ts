import { AbstractConverter, AbstractConverterContext, AbstractExtension, ErrorCollector } from "../";

export declare namespace FernIgnoreExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }
}

export class FernIgnoreExtension extends AbstractExtension<boolean> {
    private readonly operation: object;
    public readonly key = "x-fern-ignore";

    constructor({ breadcrumbs, operation }: FernIgnoreExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({ errorCollector }: { errorCollector: ErrorCollector }): boolean | undefined {
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
