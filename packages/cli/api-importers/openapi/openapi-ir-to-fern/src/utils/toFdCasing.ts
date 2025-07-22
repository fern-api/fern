import { CasingOverridesSchema } from "@fern-api/fern-definition-schema/src/schemas";
import { CasingOverrides } from "@fern-api/openapi-ir";

export function toFdCasing(casing: CasingOverrides): CasingOverridesSchema {
    return {
        camel: casing.camel,
        pascal: casing.pascal,
        snake: casing.snake,
        "screaming-snake": casing.screamingSnake
    };
}
