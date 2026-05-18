/**
 * Represents a user in the system.
 * Windows users should use DOMAIN\username format.
 */
export interface User {
    /** The unique identifier */
    id: string;
    /**
     * The user's name.
     * For Windows: DOMAIN\username
     */
    name: string;
    /** The user's email address */
    email: string;
}
