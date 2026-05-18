/**
 * @example
 *     {
 *         id: "id"
 *     }
 */
export interface PatchComplexServiceRequest {
    id: string;
    name?: string | null;
    age?: number | null;
    active?: boolean | null;
    metadata?: Record<string, unknown> | null;
    tags?: string[] | null;
    email?: string | null;
    nickname?: string | null;
    bio?: string | null;
    profileImageUrl?: string | null;
    settings?: Record<string, unknown> | null;
}
