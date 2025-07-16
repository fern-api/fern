import { OpenAPIV3_1 } from "openapi-types"

import { AbstractExtension } from "../AbstractExtension"

export declare namespace SdkMethodNameExtension {
    export interface Args extends AbstractExtension.Args {
        operation: OpenAPIV3_1.SchemaObject
    }

    export interface Output {
        methodName: string
    }
}

export class SdkMethodNameExtension extends AbstractExtension<SdkMethodNameExtension.Output> {
    private readonly operation: OpenAPIV3_1.OperationObject
    public readonly key = "x-fern-sdk-method-name"

    constructor({ breadcrumbs, operation, context }: SdkMethodNameExtension.Args) {
        super({ breadcrumbs, context })
        this.operation = operation
    }

    public convert(): SdkMethodNameExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation)
        if (extensionValue == null) {
            return undefined
        }

        if (typeof extensionValue !== "string") {
            return undefined
        }

        return {
            methodName: extensionValue
        }
    }
}
