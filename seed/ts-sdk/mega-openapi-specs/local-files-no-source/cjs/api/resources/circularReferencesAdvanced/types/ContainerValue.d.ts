import type * as SeedApi from "../../../index.js";
export type ContainerValue = SeedApi.circularReferencesAdvanced.ContainerValue.List | SeedApi.circularReferencesAdvanced.ContainerValue.Optional;
export declare namespace ContainerValue {
    interface List {
        type: "list";
        value?: SeedApi.circularReferencesAdvanced.FieldValue[] | undefined;
    }
    interface Optional {
        type: "optional";
        value?: (SeedApi.circularReferencesAdvanced.FieldValue | null) | undefined;
    }
}
