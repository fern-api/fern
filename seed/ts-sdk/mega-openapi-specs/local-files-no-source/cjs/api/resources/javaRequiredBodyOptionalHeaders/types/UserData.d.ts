/**
 * User data for creation/update
 */
export interface UserData {
    name: string;
    email: string;
    /** User's age */
    age?: (number | null) | undefined;
}
