import { AbstractExtension } from "../AbstractExtension.js";
import { FernEnumConfigSchema } from "../schemas/EnumSchema.js";
import { FernEnumConfig } from "../types/FernEnumConfig.js";

export declare namespace FernEnumExtension {
    export interface Args extends AbstractExtension.Args {
        schema: object;
    }

    export type Output = FernEnumConfig;
}

export class FernEnumExtension extends AbstractExtension<FernEnumExtension.Output> {
    private readonly schema: object;
    public readonly key = "x-fern-enum";

    constructor({ breadcrumbs, schema, context }: FernEnumExtension.Args) {
        super({ breadcrumbs, context });
        this.schema = schema;
    }

    public convert(): FernEnumExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.schema);
        if (extensionValue == null) {
            return undefined;
        }

        const result = FernEnumConfigSchema.safeParse(extensionValue);
        if (!result.success) {
            this.context.errorCollector.collect({
                message: `Invalid x-fern-enum extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        return result.data;
    }
}
