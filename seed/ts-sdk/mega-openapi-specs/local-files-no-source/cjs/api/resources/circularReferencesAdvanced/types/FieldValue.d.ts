import type * as SeedApi from "../../../index.js";
export type FieldValue = {
    type: "primitive_value";
    value?: SeedApi.circularReferencesAdvanced.PrimitiveValue | undefined;
} | {
    type: "object_value";
} | {
    type: "container_value";
    value?: SeedApi.circularReferencesAdvanced.ContainerValue | undefined;
};
