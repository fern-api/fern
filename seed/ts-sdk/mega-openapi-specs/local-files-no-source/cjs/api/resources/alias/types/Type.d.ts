import type * as SeedApi from "../../../index.js";
/**
 * A simple type with just a name.
 */
export interface Type {
    id: SeedApi.alias.TypeId;
    name: string;
}
