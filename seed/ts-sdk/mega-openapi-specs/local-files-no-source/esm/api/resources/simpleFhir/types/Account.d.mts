import type * as SeedApi from "../../../index.mjs";
export interface Account extends SeedApi.simpleFhir.BaseResource {
    resource_type: Account.ResourceType;
    name: string;
    patient?: (SeedApi.simpleFhir.Patient | null) | undefined;
    practitioner?: (SeedApi.simpleFhir.Practitioner | null) | undefined;
}
export declare namespace Account {
    const ResourceType: {
        readonly Account: "Account";
    };
    type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
}
