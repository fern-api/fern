import { ItemCursorElement } from "@fern-api/ir-sdk";

const INDEXED_COMPONENT_PATTERN = /^(?<property>[^[\]]+)\[(?<index>-?\d+)\]$/;

const ELEMENT_BY_INDEX: Record<string, ItemCursorElement> = {
    "0": ItemCursorElement.First,
    "-1": ItemCursorElement.Last
};

export type ParsedNextCursorPath =
    /** The cursor is a property on the response, e.g. `$response.next_cursor`. */
    | { type: "responseProperty" }
    /** The cursor is a property on an element of the results, e.g. `$response.data[-1].token`. */
    | {
          type: "itemCursor";
          resultsComponents: string[];
          itemComponents: string[];
          element: ItemCursorElement;
      }
    | { type: "invalid"; message: string };

/**
 * Parses the components of a `next_cursor` pagination path, which may index into the results
 * to read the cursor off one of the page's elements (e.g. `$response.data[-1].token`).
 */
export function parseNextCursorPath(propertyComponents: string[]): ParsedNextCursorPath {
    const indexedComponents = propertyComponents.flatMap((component, index) =>
        INDEXED_COMPONENT_PATTERN.test(component) ? [index] : []
    );
    const indexedComponentIndex = indexedComponents[0];
    if (indexedComponentIndex == null) {
        return { type: "responseProperty" };
    }
    if (indexedComponents.length > 1) {
        return {
            type: "invalid",
            message: "the cursor may only be read from a single element of the results"
        };
    }

    const indexedComponent = propertyComponents[indexedComponentIndex] ?? "";
    const groups = INDEXED_COMPONENT_PATTERN.exec(indexedComponent)?.groups;
    const property = groups?.property;
    const index = groups?.index;
    if (property == null || index == null) {
        return { type: "invalid", message: `'${indexedComponent}' is not a valid results index` };
    }

    const element = ELEMENT_BY_INDEX[index];
    if (element == null) {
        return {
            type: "invalid",
            message: `'[${index}]' is not a supported results index; only '[0]' (the first element) and '[-1]' (the last element) are supported`
        };
    }

    const itemComponents = propertyComponents.slice(indexedComponentIndex + 1);
    if (itemComponents.length === 0) {
        return {
            type: "invalid",
            message: "the cursor must be a property of the indexed element (e.g. $response.data[-1].token)"
        };
    }

    return {
        type: "itemCursor",
        resultsComponents: [...propertyComponents.slice(0, indexedComponentIndex), property],
        itemComponents,
        element
    };
}
