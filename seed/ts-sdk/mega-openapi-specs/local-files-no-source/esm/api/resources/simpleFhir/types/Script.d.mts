import type * as SeedApi from "../../../index.mjs";
export interface Script extends SeedApi.simpleFhir.BaseResource {
    resource_type: Script.ResourceType;
    name: string;
}
export declare namespace Script {
    const ResourceType: {
        readonly Script: "Script";
    };
    type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
}
