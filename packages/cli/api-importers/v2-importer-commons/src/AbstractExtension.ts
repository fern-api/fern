import { AbstractConverterContext } from "./AbstractConverterContext";

export declare namespace AbstractExtension {
    export interface Args {
        breadcrumbs: string[];
        context: AbstractConverterContext<object>;
    }
}

export abstract class AbstractExtension<Output> {
    /**
     * The extension key in the OpenAPI spec, e.g. "x-fern-ignore"
     */
    public abstract readonly key: string;
    /**
     * The breadcrumbs representing the path to this extension in the OpenAPI spec
     */
    protected readonly breadcrumbs: string[];
    protected readonly context: AbstractConverterContext<object>;

    constructor(args: AbstractExtension.Args) {
        this.breadcrumbs = args.breadcrumbs;
        this.context = args.context;
    }

    protected getExtensionValue(value: unknown, fallbackKey?: string): unknown | undefined {
        if (typeof value !== "object" || value == null) {
            return undefined;
        }
        const primaryExtensionValue = (value as Record<string, unknown>)[this.key];
        if (primaryExtensionValue != null) {
            return primaryExtensionValue;
        }
        if (fallbackKey != null) {
            return (value as Record<string, unknown>)[fallbackKey];
        }
        return undefined;
    }

    /**
     * Converts the OpenAPI extension to the target type
     * @returns The converted target type Output
     */
    public abstract convert(): Output | undefined | Promise<Output | undefined>;
}
