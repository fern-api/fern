import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ErrorDiscriminationStrategy } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext.js";

const ERROR_CONTENT_PROPERTY_NAME = "content";

export function convertErrorDiscriminationStrategy(
    rawStrategy: RawSchemas.ErrorDiscriminationSchema | undefined,
    _file: FernFileContext
): ErrorDiscriminationStrategy {
    if (rawStrategy == null || rawStrategy.strategy === "status-code") {
        return ErrorDiscriminationStrategy.statusCode();
    }
    switch (rawStrategy.strategy) {
        case "property":
            return ErrorDiscriminationStrategy.property({
                discriminant: rawStrategy["property-name"],
                contentProperty: ERROR_CONTENT_PROPERTY_NAME
            });
        default:
            assertNever(rawStrategy);
    }
}
