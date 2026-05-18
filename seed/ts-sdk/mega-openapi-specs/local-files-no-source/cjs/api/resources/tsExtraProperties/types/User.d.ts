export interface User {
    id: string;
    user_name: string;
    created_at: string;
    updated_at?: string | undefined;
    /** Accepts any additional properties */
    [key: string]: any;
}
