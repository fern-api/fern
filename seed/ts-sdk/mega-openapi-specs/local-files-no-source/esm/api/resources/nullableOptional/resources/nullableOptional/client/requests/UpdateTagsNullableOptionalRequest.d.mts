/**
 * @example
 *     {
 *         userId: "userId"
 *     }
 */
export interface UpdateTagsNullableOptionalRequest {
    userId: string;
    tags: string[] | null;
    categories?: string[] | null;
    labels?: string[] | null;
}
