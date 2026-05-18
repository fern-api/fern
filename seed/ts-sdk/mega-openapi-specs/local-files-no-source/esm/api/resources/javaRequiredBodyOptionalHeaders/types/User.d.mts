/**
 * User entity
 */
export interface User {
    id: string;
    name: string;
    email: string;
    age?: (number | null) | undefined;
    createdAt: string;
}
