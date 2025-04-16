import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, AbstractExtension, ErrorCollector } from "../";

export declare namespace SdkGroupNameExtension {
    export interface Args extends AbstractConverter.Args {
        operation: OpenAPIV3_1.SchemaObject;
    }

    export interface Output {
        groups: string[];
    }
}

export class SdkGroupNameExtension extends AbstractExtension<
    AbstractConverterContext<object>,
    SdkGroupNameExtension.Output
> {
    private readonly operation: OpenAPIV3_1.OperationObject;
    public readonly key = "x-fern-sdk-group-name";

    constructor({ breadcrumbs, operation }: SdkGroupNameExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): SdkGroupNameExtension.Output | undefined {
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
