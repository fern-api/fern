import { AbstractConverterContext } from "./AbstractConverterContext";
import { ErrorCollector } from "./ErrorCollector";

export declare namespace AbstractConverter {
    export interface Args {
        breadcrumbs?: string[];
    }
}

/**
 * Interface for converting OpenAPI specifications to a target type
 * @template Output The target type to convert to
 */
export abstract class AbstractConverter<Context extends AbstractConverterContext<object>, Output> {
    protected breadcrumbs: string[] = [];

    constructor({ breadcrumbs = [] }: AbstractConverter.Args = {}) {
        this.breadcrumbs = breadcrumbs;
    }

    /**
     * Converts the OpenAPI specification to the target type
     * @param errorCollector Optional collector to track any conversion errors
     * @returns The converted target type Output
     */
    public abstract convert({
        context,
        errorCollector
    }: {
        context: Context;
        errorCollector: ErrorCollector;
    }): Output | undefined | Promise<Output | undefined>;
}
