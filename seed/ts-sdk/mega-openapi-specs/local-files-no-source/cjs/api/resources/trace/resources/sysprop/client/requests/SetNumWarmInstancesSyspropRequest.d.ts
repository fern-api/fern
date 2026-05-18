import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         language: "JAVA",
 *         numWarmInstances: 1
 *     }
 */
export interface SetNumWarmInstancesSyspropRequest {
    language: SeedApi.trace.Language;
    numWarmInstances: number;
}
