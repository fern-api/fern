export interface Resource {
    id: string;
    name: string;
    description?: (string | null) | undefined;
    created_at: string;
    updated_at: string;
    metadata?: (Record<string, unknown> | null) | undefined;
}
