import type * as SeedApi from "../../../index.mjs";
/**
 * Response with pagination info like Auth0
 */
export interface PaginatedUserResponse {
    users: SeedApi.clientSideParams.User[];
    start: number;
    limit: number;
    length: number;
    total?: (number | null) | undefined;
}
