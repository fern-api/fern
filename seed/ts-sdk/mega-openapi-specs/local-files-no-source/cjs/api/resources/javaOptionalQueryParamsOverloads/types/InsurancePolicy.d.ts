import type * as SeedApi from "../../../index.js";
/**
 * Insurance policy details
 */
export interface InsurancePolicy {
    id: string;
    userId: string;
    policyType: SeedApi.javaOptionalQueryParamsOverloads.PolicyType;
    isExpired: boolean;
    coverageAmount: number;
}
