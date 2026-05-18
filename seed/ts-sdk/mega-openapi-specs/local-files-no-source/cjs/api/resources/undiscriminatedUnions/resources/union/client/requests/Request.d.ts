import type * as SeedApi from "../../../../../../index.js";
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
