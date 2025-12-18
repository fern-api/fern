import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

/**
 * Applies an OpenAPI Overlay to the given OpenAPI document.
 *
 * OpenAPI Overlays provide a way to modify OpenAPI documents without directly editing
 * the source file. This is useful for adding custom extensions, modifying descriptions,
 * or making other changes that should be applied on top of the base specification.
 *
 * @see https://github.com/OAI/Overlay-Specification for the OpenAPI Overlay specification
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
    // TODO: Implement OpenAPI Overlay application
    // The overlay specification defines operations like:
    // - update: Modify existing values at a target path
    // - remove: Delete values at a target path
    //
    // For now, return the data unchanged as a stub
    context.logger.debug(`Overlay file specified at ${absoluteFilePathToOverlay}, but overlay application is not yet implemented`);
    return data;
}
