import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { JSONPath } from "jsonpath-plus";
import yaml from "js-yaml";

/**
 * OpenAPI Overlay Specification v1.0.0
 * @see https://spec.openapis.org/overlay/latest.html
 */
interface OverlayDocument {
    overlay: string;
    info: {
        title: string;
        version: string;
    };
    extends?: string;
    actions: OverlayAction[];
}

interface OverlayAction {
    target: string;
    description?: string;
    update?: unknown;
    remove?: boolean;
}

/**
 * Applies an OpenAPI Overlay to the given OpenAPI document.
 *
 * OpenAPI Overlays provide a way to modify OpenAPI documents without directly editing
 * the source file. This is useful for adding custom extensions, modifying descriptions,
 * or making other changes that should be applied on top of the base specification.
 *
 * @see https://spec.openapis.org/overlay/latest.html
 *
 * @param absoluteFilePathToOverlay - Path to the overlay file (YAML or JSON)
 * @param data - The OpenAPI document to apply the overlay to
 * @param context - Task context for logging and error handling
 * @returns The OpenAPI document with the overlay applied
 */
export async function applyOverlays<T extends object>({
    absoluteFilePathToOverlay,
    data,
    context
}: {
    absoluteFilePathToOverlay: AbsoluteFilePath;
    data: T;
    context: TaskContext;
}): Promise<T> {
    const overlay = await parseOverlayFile(absoluteFilePathToOverlay, context);

    if (!validateOverlay(overlay, context)) {
        return data;
    }

    context.logger.debug(`Applying overlay "${overlay.info.title}" v${overlay.info.version}`);

    // Clone the data to avoid mutating the original
    let result = structuredClone(data);

    // Apply actions sequentially - each action operates on the result of the previous
    for (const action of overlay.actions) {
        result = applyAction(result, action, context);
    }

    return result;
}

async function parseOverlayFile(
    absoluteFilePathToOverlay: AbsoluteFilePath,
    context: TaskContext
): Promise<OverlayDocument> {
    let contents: string;
    try {
        contents = await readFile(absoluteFilePathToOverlay, "utf8");
    } catch (err) {
        return context.failAndThrow(`Failed to read overlay file at ${absoluteFilePathToOverlay}: ${err}`);
    }

    try {
        // Try JSON first, then YAML
        try {
            return JSON.parse(contents) as OverlayDocument;
        } catch {
            return yaml.load(contents, { json: true }) as OverlayDocument;
        }
    } catch (err) {
        return context.failAndThrow(`Failed to parse overlay file at ${absoluteFilePathToOverlay}: ${err}`);
    }
}

function validateOverlay(overlay: OverlayDocument, context: TaskContext): boolean {
    if (!overlay.overlay) {
        context.logger.error("Overlay file missing required 'overlay' version field");
        return false;
    }

    if (!overlay.info?.title || !overlay.info?.version) {
        context.logger.error("Overlay file missing required 'info.title' or 'info.version' field");
        return false;
    }

    if (!Array.isArray(overlay.actions) || overlay.actions.length === 0) {
        context.logger.error("Overlay file must have at least one action");
        return false;
    }

    for (let i = 0; i < overlay.actions.length; i++) {
        const action = overlay.actions[i];
        if (!action?.target) {
            context.logger.error(`Overlay action at index ${i} missing required 'target' field`);
            return false;
        }
        if (action.update === undefined && !action.remove) {
            context.logger.error(`Overlay action at index ${i} must have either 'update' or 'remove'`);
            return false;
        }
    }

    return true;
}

function applyAction<T extends object>(data: T, action: OverlayAction, context: TaskContext): T {
    const { target, update, remove } = action;

    try {
        if (remove) {
            return applyRemoveAction(data, target, context);
        } else if (update !== undefined) {
            return applyUpdateAction(data, target, update, context);
        }
    } catch (err) {
        context.logger.warn(`Failed to apply overlay action with target "${target}": ${err}`);
    }

    return data;
}

function applyRemoveAction<T extends object>(data: T, target: string, context: TaskContext): T {
    // Get parent objects and their property names for the matches
    const parents = JSONPath({
        path: target,
        json: data,
        resultType: "parent"
    }) as object[];

    const parentProperties = JSONPath({
        path: target,
        json: data,
        resultType: "parentProperty"
    }) as (string | number)[];

    if (parents.length === 0) {
        context.logger.debug(`No matches found for remove target: ${target}`);
        return data;
    }

    // Remove each matched element from its parent
    for (let i = 0; i < parents.length; i++) {
        const parent = parents[i];
        const property = parentProperties[i];

        if (parent && property !== undefined) {
            if (Array.isArray(parent) && typeof property === "number") {
                // For arrays, use splice to remove the element
                parent.splice(property, 1);
            } else {
                // For objects, delete the property
                delete (parent as Record<string | number, unknown>)[property];
            }
        }
    }

    context.logger.debug(`Removed ${parents.length} element(s) matching target: ${target}`);
    return data;
}

function applyUpdateAction<T extends object>(
    data: T,
    target: string,
    update: unknown,
    context: TaskContext
): T {
    // Special case: if target is "$" (root), merge directly into root
    if (target === "$") {
        if (isObject(update) && isObject(data)) {
            deepMerge(data, update);
            context.logger.debug("Applied update to document root");
        }
        return data;
    }

    // Get the matched values and their parents
    const matches = JSONPath({
        path: target,
        json: data,
        resultType: "all"
    }) as Array<{
        value: unknown;
        parent: object;
        parentProperty: string | number;
    }>;

    if (matches.length === 0) {
        context.logger.debug(`No matches found for update target: ${target}`);
        return data;
    }

    for (const match of matches) {
        const { value, parent, parentProperty } = match;

        if (parent && parentProperty !== undefined) {
            if (isObject(value) && isObject(update)) {
                // Merge objects recursively
                deepMerge(value, update);
            } else if (Array.isArray(value) && !Array.isArray(update)) {
                // Append to array if update is not an array
                value.push(update);
            } else {
                // Replace the value entirely
                (parent as Record<string | number, unknown>)[parentProperty] = update;
            }
        }
    }

    context.logger.debug(`Applied update to ${matches.length} element(s) matching target: ${target}`);
    return data;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep merge source into target, modifying target in place.
 * New properties are added, existing properties are overwritten.
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        if (isObject(sourceValue) && isObject(targetValue)) {
            // Recursively merge nested objects
            deepMerge(targetValue, sourceValue);
        } else {
            // Overwrite with source value
            target[key] = sourceValue;
        }
    }
}
