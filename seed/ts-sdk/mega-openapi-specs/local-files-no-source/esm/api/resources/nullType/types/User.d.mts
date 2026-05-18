export interface User {
    id: string;
    name: string;
    /** Always null for active users. */
    deleted_at: unknown | null;
}
