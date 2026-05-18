/**
 * @example
 *     {
 *         query: "query",
 *         department: "department"
 *     }
 */
export interface SearchUsersNullableOptionalRequest {
    query: string;
    department: string | null;
    role?: string | null;
    isActive?: boolean | null;
}
