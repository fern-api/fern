import { AbstractConverter } from "./AbstractConverter";
import { AbstractConverterContext } from "./AbstractConverterContext";

export abstract class AbstractExtension<
    Context extends AbstractConverterContext<object>,
    Output
> extends AbstractConverter<Context, Output> {
    /**
     * The extension key in the OpenAPI spec, e.g. "x-fern-ignore"
     */
    public abstract readonly key: string;

    protected getExtensionValue(value: unknown): unknown | undefined {
        if (typeof value !== "object" || value == null) {
            return undefined;
        }
        return (value as Record<string, unknown>)[this.key];
    }
}
