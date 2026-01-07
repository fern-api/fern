import {JSONPath} from "jsonpath-plus";

type OverlayAction = {
    target: string;
    description: string;
    update: unknown;
    remove: boolean;
}

type OverlaySpecification = {
    actions: OverlayAction[];
}

// TODO: How do we select an array item with jsonpath and then remove it?
// Use parent && parentPropety?
export function applyOpenAPIOverlay<T extends object>({
    data,
    overlay
}: {
    data: T;
    overlay: OverlaySpecification;
}): T {
    // TODO: Do we throw here on invalid overlay transformations?
    for (const action of overlay.actions) {
        const result = JSONPath({
            path: action.target,
            json: data,
            resultType: "all",
            callback: (_payload, _payloadType, fullPayload) => {
                console.log("fullPayload", fullPayload);
            }
        });
    }

    return data
    // const merged = mergeWith(data, mergeWith, overrides, (obj, src) =>
    //     Array.isArray(obj) && Array.isArray(src)
    //         ? src.every((element) => typeof element === "object") && obj.every((element) => typeof element === "object")
    //             ? // nested arrays of objects are merged
    //               undefined
    //             : // nested arrays of primitives are replaced
    //               [...src]
    //         : undefined
    // ) as T;
    // // Remove any nullified values
    // const filtered = omitDeepBy(merged, isNull, {
    //     ancestorKeys: allowNullKeys ?? [],
    //     allowOmissionCursor: false
    // });
    // return filtered as T;
}
