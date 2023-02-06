import { falsy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const NoInlineUnions: SpectralRule = {
    name: "no-inlined-oneOf",
    get: () => {
        return {
            given: [
                "$.components.schemas.*.properties[*]",
                "$.components.schemas.*.allOf[*]",
                "$.paths.*.*.requestBody.content.*.schema.properties[*]",
                "$.paths.*.*.responses.*.content.*.schema.properties[*]",
            ],
            message: "OneOf is inlined. Please refactor as a $ref.",
            resolved: false,
            then: [
                {
                    field: "oneOf",
                    function: falsy,
                },
            ],
        };
    },
};
