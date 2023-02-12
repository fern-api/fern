import { falsy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const NoInlineObjects: SpectralRule = {
    name: "no-inlined-objects",
    get: () => {
        return {
            given: [
                "$.components.schemas.*.properties[*]",
                "$.components.schemas.*.allOf[*]",
                "$.paths.*.*.requestBody.content.*.schema.properties[*]",
                "$.paths.*.*.responses.*.content.*.schema.properties[*]",
            ],
            message: "Object is inlined. Please refactor as a $ref.",
            resolved: false,
            then: [
                {
                    field: "properties",
                    function: falsy,
                },
            ],
        };
    },
};
