/**
 * @example
 *     {
 *         accountId: "accountId",
 *         accountIdBody: "accountId",
 *         otherProperty: "otherProperty"
 *     }
 */
export interface PostWithBodyAndDuplicatePathParam {
    accountId: string;
    /** This should be excluded from the request wrapper since it duplicates the path param */
    accountIdBody?: string;
    otherProperty: string;
}
