import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         userId: "userId",
 *         body: {
 *             name: "name",
 *             email: "email"
 *         }
 *     }
 */
export interface UpdateUserRequest {
    userId: string;
    /** If true, validate the update without persisting */
    dryRun?: boolean | null;
    body: SeedApi.javaRequiredBodyOptionalHeaders.UserData;
}
