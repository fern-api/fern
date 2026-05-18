import type * as SeedApi from "../../../index.js";
export interface BaseResource {
    id: string;
    related_resources: SeedApi.simpleFhir.ResourceList[];
    memo: SeedApi.simpleFhir.Memo;
}
