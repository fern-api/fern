import { OpenAPIV3_1 } from "openapi-types"

import { AbstractExtension } from "../AbstractExtension"

export declare namespace FernTypeExtension {
    export interface Args extends AbstractExtension.Args {
        schema: OpenAPIV3_1.SchemaObject
    }
}

export class FernTypeExtension extends AbstractExtension<string> {
    private readonly schema: OpenAPIV3_1.SchemaObject
    public readonly key = "x-fern-type"

    constructor({ breadcrumbs, schema, context }: FernTypeExtension.Args) {
        super({ breadcrumbs, context })
        this.schema = schema
    }

    public convert(): string | undefined {
        const extensionValue = this.getExtensionValue(this.schema)
        if (extensionValue == null) {
            return undefined
        }

        if (typeof extensionValue !== "string") {
            return undefined
        }

        return extensionValue
    }
}
