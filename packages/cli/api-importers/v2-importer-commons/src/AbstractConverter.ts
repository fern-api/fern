import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";

import { AbstractConverterContext } from "./AbstractConverterContext";

export type BaseIntermediateRepresentation = Omit<IntermediateRepresentation, "apiName" | "constants">;

export declare namespace AbstractConverter {
    export interface Args<Context> {
        breadcrumbs?: string[];
        context: Context;
    }

    export type AbstractArgs = Args<AbstractConverterContext<object>>;
}

/**
 * Interface for converting OpenAPI specifications to a target type
 * @template Output The target type to convert to
 */
export abstract class AbstractConverter<Context extends AbstractConverterContext<object>, Output> {
    protected breadcrumbs: string[] = [];
    protected context: Context;

    /**
     * String primitive type constant
     */
    protected static STRING = FernIr.TypeReference.primitive({
        v1: "STRING",
        v2: FernIr.PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    });

    constructor({ breadcrumbs = [], context }: AbstractConverter.Args<Context>) {
        this.breadcrumbs = breadcrumbs;
        this.context = context;
    }

    /**
     * Converts the OpenAPI specification to the target type
     * @returns The converted target type Output
     */
    public abstract convert(): Output | undefined | Promise<Output | undefined>;
}
