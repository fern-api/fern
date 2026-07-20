import pluralize from "pluralize";
import React from "react";

/**
 * Renders inventory counts using the third-party `pluralize` library, which
 * gets inlined into the uploaded component source by the CLI's bundling step.
 */
export const PlantInventory: React.FC<{ count: number }> = ({ count }) => {
    return <div data-testid="plant-inventory">We currently have {pluralize("plant", count, true)} in stock.</div>;
};
