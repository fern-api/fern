/**
 * @example
 *     {
 *         accountId: "accountId",
 *         otherProperty: "otherProperty"
 *     }
 */
export interface PostWithBodyAndDuplicatePathParam {
    /** This should be excluded from the request wrapper since it duplicates the path param */
    accountId?: string;
    otherProperty: string;
}
