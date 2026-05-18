import type * as SeedApi from "../../../index.js";
export type FieldValue = {
    type: "primitive_value";
    value?: SeedApi.circularReferences.PrimitiveValue | undefined;
} | {
    type: "object_value";
} | {
    type: "container_value";
    value?: SeedApi.circularReferences.ContainerValue | undefined;
};
