import type * as SeedApi from "../../../index.mjs";
export interface Practitioner extends SeedApi.simpleFhir.BaseResource {
    resource_type: Practitioner.ResourceType;
    name: string;
}
export declare namespace Practitioner {
    const ResourceType: {
        readonly Practitioner: "Practitioner";
    };
    type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
}
