import { JSONPath } from "jsonpath-plus";
import { merge } from "lodash-es";

/**
 * OpenAPI Overlay Specification v1.0.0
 * @see https://spec.openapis.org/overlay/latest.html
 */

type OverlayAction = {
    target: string;
    description: string;
    update: unknown;
    remove: boolean;
};

export function applyOpenAPIOverlay<T extends object>({
    data,
    overlay
}: {
    data: T;
    overlay: {
        actions: OverlayAction[];
    };
}): T {
    const output = data;
    for (const action of overlay.actions) {
        const results = JSONPath({
            path: action.target,
            json: output,
            resultType: "all"
        }) as Array<{ value: unknown; parent: unknown; parentProperty: string | number }>;

        for (const { value, parent, parentProperty } of results) {
            // When parent is null, this indicates we're targeting the root
            if (parent == null) {
                if (action.remove) {
                    // Root removal doesn't make sense in this context
                    throw new Error(`Cannot remove the root object with path: ${action.target}`);
                } else {
                    if (typeof action.update !== "object" || action.update == null) {
                        throw new Error(
                            `Update values must be objects or arrays. Value provided for path ${action.target} is of type ${typeof action.update}`
                        );
                    }
                    // Merge the update directly into the root data object
                    merge(output, action.update);
                }
                continue;
            }

            if (typeof parent !== "object") {
                throw new Error(`Invalid target returned for json path: ${action.target}`);
            }

            const parentObj = parent as Record<string | number, unknown> | unknown[];

            if (action.remove) {
                if (Array.isArray(parentObj)) {
                    // Find the index by value since this action could delete
                    // multiple items and the `parentProperty` resolved by the query
                    // may point to the wrong index.
                    const indexToRemove = parentObj.findIndex((item) => item === value);
                    if (indexToRemove !== -1) {
                        parentObj.splice(indexToRemove, 1);
                    }
                } else {
                    delete parentObj[parentProperty];
                }
            } else {
                if (typeof action.update !== "object" || action.update == null) {
                    throw new Error(
                        `Update values must be objects or arrays. Value provided for path ${action.target} is of type ${typeof action.update}`
                    );
                }

                // For array targets with non-array update values, the spec
                // requires we append the value to the array.
                if (Array.isArray(value) && !Array.isArray(action.update)) {
                    value.push(action.update);
                } else {
                    // Merge the update value into the target
                    if (typeof value !== "object" || value == null) {
                        throw new Error(`Invalid target value type for json path: ${action.target}: ${typeof value}`);
                    }
                    const updatedValue = merge(value, action.update);
                    if (Array.isArray(parentObj)) {
                        // We are okay to update by index here since this action
                        // won't modify the array length.
                        const index = Number(parentProperty);
                        if (Number.isNaN(index)) {
                            throw new Error(
                                `Invalid array index resolved for json path query: ${action.target}: ${parentProperty}`
                            );
                        }
                        parentObj[index] = updatedValue;
                    } else {
                        parentObj[parentProperty] = updatedValue;
                    }
                }
            }
        }
    }

    return output;
}
