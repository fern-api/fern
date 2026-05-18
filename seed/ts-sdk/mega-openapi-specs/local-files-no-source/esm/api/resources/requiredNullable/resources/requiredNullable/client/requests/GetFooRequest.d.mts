/**
 * @example
 *     {
 *         required_baz: "required_baz",
 *         required_nullable_baz: "required_nullable_baz"
 *     }
 */
export interface GetFooRequest {
    /** An optional baz */
    optional_baz?: string | null;
    /** An optional baz */
    optional_nullable_baz?: string | null;
    /** A required baz */
    required_baz: string;
    /** A required baz */
    required_nullable_baz: string | null;
}
