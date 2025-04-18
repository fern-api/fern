import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ErrorDiscriminationStrategy } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";

const ERROR_CONTENT_PROPERTY_NAME = "content";

export function convertErrorDiscriminationStrategy(
    rawStrategy: RawSchemas.ErrorDiscriminationSchema | undefined,
    file: FernFileContext
): ErrorDiscriminationStrategy {
    if (rawStrategy == null || rawStrategy.strategy === "status-code") {
        return ErrorDiscriminationStrategy.statusCode();
    }
    switch (rawStrategy.strategy) {
        case "property":
            return ErrorDiscriminationStrategy.property({
                discriminant: file.casingsGenerator.generateNameAndWireValue({
                    name: rawStrategy["property-name"],
                    wireValue: rawStrategy["property-name"]
                }),
                contentProperty: file.casingsGenerator.generateNameAndWireValue({
                    name: ERROR_CONTENT_PROPERTY_NAME,
                    wireValue: ERROR_CONTENT_PROPERTY_NAME
                })
            });
        default:
            assertNever(rawStrategy);
    }
}
