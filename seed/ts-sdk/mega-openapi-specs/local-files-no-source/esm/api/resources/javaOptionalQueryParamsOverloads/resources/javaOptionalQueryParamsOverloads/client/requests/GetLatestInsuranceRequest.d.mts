import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         userId: "userId"
 *     }
 */
export interface GetLatestInsuranceRequest {
    userId: string;
    /** Include expired insurance policies */
    includeExpired?: boolean | null;
    /** Filter by policy type */
    policyType?: SeedApi.javaOptionalQueryParamsOverloads.PolicyType | null;
}
