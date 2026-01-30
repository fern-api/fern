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
    /** This body property is renamed to accountIdBody in the SDK since it duplicates the path param name */
    accountIdBody?: string;
    otherProperty: string;
}
