import { AbstractConverter, AbstractConverterContext, AbstractExtension, ErrorCollector, FernEnumConfig } from "../";
import { FernEnumConfigSchema } from "../schemas/EnumSchema";

export declare namespace FernEnumExtension {
    export interface Args extends AbstractConverter.Args {
        schema: object;
    }

    export type Output = FernEnumConfig;
}

export class FernEnumExtension extends AbstractExtension<AbstractConverterContext<object>, FernEnumExtension.Output> {
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
        context: AbstractConverterContext<object>;
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
