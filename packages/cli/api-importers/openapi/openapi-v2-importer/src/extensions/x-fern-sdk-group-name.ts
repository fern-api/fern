import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";

export declare namespace SdkGroupNameExtension {
    export interface Args extends AbstractConverter.Args {
        operation: OpenAPIV3_1.SchemaObject;
    }

    export interface Output {
        groups: string[];
    }
}

export class SdkGroupNameExtension extends AbstractExtension<OpenAPIConverterContext3_1, SdkGroupNameExtension.Output> {
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
        context: OpenAPIConverterContext3_1;
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
