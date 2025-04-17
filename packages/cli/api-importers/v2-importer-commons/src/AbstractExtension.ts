import { ErrorCollector } from "./ErrorCollector";

export declare namespace AbstractExtension {
    export interface Args {
        breadcrumbs: string[];
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

    constructor(protected readonly args: AbstractExtension.Args) {
        this.breadcrumbs = args.breadcrumbs;
    }

    protected getExtensionValue(value: unknown): unknown | undefined {
        if (typeof value !== "object" || value == null) {
            return undefined;
        }
        return (value as Record<string, unknown>)[this.key];
    }

    /**
     * Converts the OpenAPI extension to the target type
     * @param errorCollector Optional collector to track any conversion errors
     * @returns The converted target type Output
     */
    public abstract convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Output | undefined | Promise<Output | undefined>;
}
