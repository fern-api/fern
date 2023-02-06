import { truthy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const OneOfRequiresDiscriminant: SpectralRule = {
    name: "one-of-requires-discriminant",
    get: () => {
        return {
            given: ["$..oneOf"],
            message:
                "OneOf is missing discriminant and mapping. See https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism.",
            then: {
                field: "discriminant",
                function: truthy,
            },
        };
    },
};
