import type * as SeedApi from "../../../index.mjs";
export type ResourceList = SeedApi.simpleFhir.ResourceList.Account | SeedApi.simpleFhir.ResourceList.Patient | SeedApi.simpleFhir.ResourceList.Practitioner | SeedApi.simpleFhir.ResourceList.Script;
export declare namespace ResourceList {
    interface Account extends SeedApi.simpleFhir.Account {
        resource_type: "Account";
    }
    interface Patient extends SeedApi.simpleFhir.Patient {
        resource_type: "Patient";
    }
    interface Practitioner extends SeedApi.simpleFhir.Practitioner {
        resource_type: "Practitioner";
    }
    interface Script extends SeedApi.simpleFhir.Script {
        resource_type: "Script";
    }
}
