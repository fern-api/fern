import { assertNever } from "@fern-api/core-utils";
import { Dimensions } from "@fern-api/react-commons";
import { Orientation } from "./types";

export function getRelevationDimensionForOrientation(dimensions: Dimensions, orientation: Orientation): number {
    switch (orientation) {
        case "vertical":
            return dimensions.height;
        case "horizontal":
            return dimensions.width;
        default:
            assertNever(orientation);
    }
}
