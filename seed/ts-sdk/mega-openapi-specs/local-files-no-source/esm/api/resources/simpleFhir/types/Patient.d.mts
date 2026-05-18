import type * as SeedApi from "../../../index.mjs";
export interface Patient extends SeedApi.simpleFhir.BaseResource {
    resource_type: Patient.ResourceType;
    name: string;
    scripts: SeedApi.simpleFhir.Script[];
}
export declare namespace Patient {
    const ResourceType: {
        readonly Patient: "Patient";
    };
    type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
}
