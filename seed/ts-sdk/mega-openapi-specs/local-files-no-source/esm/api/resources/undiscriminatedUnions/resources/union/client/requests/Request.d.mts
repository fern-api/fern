import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         union: {
 *             "string": {
 *                 "key": "value"
 *             }
 *         }
 *     }
 */
export interface Request {
    union?: SeedApi.undiscriminatedUnions.MetadataUnion | null;
}
