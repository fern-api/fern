import { falsy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const NoInlinedEnums: SpectralRule = {
    name: "no-inlined-enums",
    get: () => {
        return {
            given: [
                "$.components.schemas.*.properties[*]",
                "$.paths.*.*.requestBody.content.*.schema.properties[*]",
                "$.paths.*.*.responses.*.content.*.schema.properties[*]",
            ],
            message: "Enum is inlined. Please refactor as a $ref.",
            then: [
                {
                    field: "enum",
                    function: falsy,
                },
            ],
        };
    },
};
