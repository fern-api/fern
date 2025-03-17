import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractExtension, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";

export declare namespace SdkMethodNameExtension {
    export interface Args extends AbstractConverter.Args {
        operation: OpenAPIV3_1.SchemaObject;
    }

    export interface Output {
        methodName: string;
    }
}

export class SdkMethodNameExtension extends AbstractExtension<
    OpenAPIConverterContext3_1,
    SdkMethodNameExtension.Output
> {
    private readonly operation: OpenAPIV3_1.OperationObject;
    public readonly key = "x-fern-sdk-method-name";

    constructor({ breadcrumbs, operation }: SdkMethodNameExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): SdkMethodNameExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            return undefined;
        }

        return {
            methodName: extensionValue
        };
    }
}
