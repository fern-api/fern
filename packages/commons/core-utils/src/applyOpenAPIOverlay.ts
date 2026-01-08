import { JSONPath } from "jsonpath-plus";
import { mergeWithOverrides } from "./mergeWithOverrides";

type OverlayAction = {
    target: string;
    description: string;
    update: unknown;
    remove: boolean;
};

type OverlaySpecification = {
    actions: OverlayAction[];
};

export function applyOpenAPIOverlay<T extends object>({
    data,
    overlay
}: {
    data: T;
    overlay: OverlaySpecification;
}): T {
    for (const action of overlay.actions) {
        JSONPath({
            path: action.target,
            json: data,
            resultType: "all",
            callback: (_payload, _payloadType, { parent, parentProperty }) => {
                console.log("parent", parent, parentProperty);
                console.log("action", action);
                if (typeof parent !== "object" || parent == null) {
                    throw new Error(`Invalid target returned for json path: ${action.target}`);
                }

                if (action.remove) {
                    if (Array.isArray(parent)) {
                        console.log("splicing", parentProperty);
                        parent.splice(Number(parentProperty), 1);
                    } else {
                        delete parent[parentProperty];
                    }
                } else {
                    if (typeof action.update !== "object" || action.update == null) {
                        throw new Error(
                            `Invalid update value type for json path: ${action.target}: ${typeof action.update}`
                        );
                    }
                    // For array targets with non-array update values, the spec
                    // requires we append the value to the array.
                    if (Array.isArray(parent[parentProperty]) && !Array.isArray(action.update)) {
                        parent[parentProperty].push(action.update);
                    } else {
                        parent[parentProperty] = mergeWithOverrides({
                            data: parent[parentProperty],
                            overrides: action.update
                        });
                    }
                }
                console.log("data", JSON.stringify(data, null, 2));
            }
        });
    }

    // TODO: Should we be removing nullish values similar to mergeWithOverrides?
    return data;
}
