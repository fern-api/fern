import { AbstractExtension } from "../AbstractExtension";

export declare namespace SdkGroupNameExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }

    export interface Output {
        groups: string[];
    }
}

export class SdkGroupNameExtension extends AbstractExtension<SdkGroupNameExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-sdk-group-name";

    constructor({ breadcrumbs, operation, context }: SdkGroupNameExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): SdkGroupNameExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const groups = Array.isArray(extensionValue)
            ? extensionValue.filter((name): name is string => typeof name === "string")
            : typeof extensionValue === "string"
              ? [extensionValue]
              : [];

        if (groups.length === 0) {
            return undefined;
        }

        return {
            groups
        };
    }
}
