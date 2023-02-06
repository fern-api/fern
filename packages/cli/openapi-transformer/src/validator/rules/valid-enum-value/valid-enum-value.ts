import { pattern } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const ValidEnumValue: SpectralRule = {
    name: "valid-enum-value",
    get: () => {
        return {
            given: ["$.components.schemas.*.enum[*]"],
            message:
                "Enum value {{error}} is not suitable for code generation.\nAdd an entry to x-enum-names where the key is {{}} and the value is a name that starts with a letter and contains only letters, numbers, and underscores.",
            resolved: false,
            then: [
                {
                    function: pattern,
                    functionOptions: {
                        match: "^[a-zA-Z][a-zA-Z0-9_]*$",
                    },
                },
            ],
        };
    },
};
