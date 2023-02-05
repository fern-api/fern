import { truthy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const OneOfRequiresDiscriminant: SpectralRule = {
    name: "one-of-requires-discriminant",
    get: () => {
        return {
            given: ["$..oneOf"],
            message: "discriminant is required",
            then: {
                field: "discriminant",
                function: truthy,
            },
        };
    },
};
