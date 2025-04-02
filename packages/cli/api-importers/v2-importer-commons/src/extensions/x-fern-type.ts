import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext, AbstractExtension, ErrorCollector } from "../";

export declare namespace FernTypeExtension {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
    }
}

export class FernTypeExtension extends AbstractExtension<AbstractConverterContext<object>, string> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    public readonly key = "x-fern-type";

    constructor({ breadcrumbs, schema }: FernTypeExtension.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): string | undefined {
        const extensionValue = this.getExtensionValue(this.schema);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "string") {
            return undefined;
        }

        return extensionValue;
    }
}
