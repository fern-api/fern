import { z } from "zod";

import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../openapi_3_1/OpenAPIConverterContext3_1";
import { FernEnumConfig } from "../types/FernEnumConfig";

const CasingConfigSchema = z.object({
    snake: z.string().optional(),
    camel: z.string().optional(),
    screamingSnake: z.string().optional(),
    pascal: z.string().optional()
});

const EnumValueConfigSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    casing: CasingConfigSchema.optional()
});

const FernEnumConfigSchema = z.record(EnumValueConfigSchema);

export declare namespace FernEnumExtension {
    export interface Args extends AbstractConverter.Args {
        schema: object;
    }

    export type Output = FernEnumConfig;
}

export class FernEnumExtension extends AbstractExtension<OpenAPIConverterContext3_1, FernEnumExtension.Output> {
    private readonly schema: object;
    public readonly key = "x-fern-enum";

    constructor({ breadcrumbs, schema }: FernEnumExtension.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): FernEnumExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.schema);
        if (extensionValue == null) {
            return undefined;
        }

        const result = FernEnumConfigSchema.safeParse(extensionValue);
        if (!result.success) {
            errorCollector.collect({
                message: `Invalid x-fern-enum extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        return result.data;
    }
}
