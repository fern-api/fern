import type * as SeedApi from "../../../index.mjs";
/**
 * Defines properties with default values and validation rules.
 */
export interface Type {
    decimal: number;
    even: number;
    name: string;
    shape: SeedApi.validation.Shape;
}
