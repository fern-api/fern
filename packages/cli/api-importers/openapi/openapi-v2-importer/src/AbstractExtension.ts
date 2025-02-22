import { AbstractConverterContext } from "./AbstractConverterContext";
import { ErrorCollector } from "./ErrorCollector";

export declare namespace AbstractExtension {
    export interface Args {
        breadcrumbs?: string[];
    }
}

/**
 * Abstract base class for OpenAPI extensions
 */
export abstract class AbstractExtension<Context extends AbstractConverterContext<any>, Output> {
    protected breadcrumbs: string[] = [];

    constructor({ breadcrumbs = [] }: AbstractExtension.Args) {
        this.breadcrumbs = breadcrumbs;
    }

    /**
     * Validates the OpenAPI extension
     * @param context The converter context
     * @param errorCollector Collector to track validation errors
     * @returns The validation output or undefined if validation fails
     */
    public abstract validate({ context, errorCollector }: { context: Context; errorCollector: ErrorCollector }): Output | undefined;
}
