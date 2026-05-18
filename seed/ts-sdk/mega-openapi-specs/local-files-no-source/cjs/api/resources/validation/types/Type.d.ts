import type * as SeedApi from "../../../index.js";
/**
 * Defines properties with default values and validation rules.
 */
export interface Type {
    decimal: number;
    even: number;
    name: string;
    shape: SeedApi.validation.Shape;
}
