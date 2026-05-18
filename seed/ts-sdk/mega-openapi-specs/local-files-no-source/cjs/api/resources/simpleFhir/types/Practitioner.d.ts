import type * as SeedApi from "../../../index.js";
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
