import { TypeReference, PrimitiveTypeV2 } from "@fern-api/ir-sdk";

export const STRING_TYPE_REFERENCE = TypeReference.primitive({
    v1: "STRING",
    v2: PrimitiveTypeV2.string({ default: undefined, validation: undefined })
});


