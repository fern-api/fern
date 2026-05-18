import type * as SeedApi from "../../../index.js";
export type ContainerValue = SeedApi.circularReferences.ContainerValue.List | SeedApi.circularReferences.ContainerValue.Optional;
export declare namespace ContainerValue {
    interface List {
        type: "list";
        value?: SeedApi.circularReferences.FieldValue[] | undefined;
    }
    interface Optional {
        type: "optional";
        value?: (SeedApi.circularReferences.FieldValue | null) | undefined;
    }
}
