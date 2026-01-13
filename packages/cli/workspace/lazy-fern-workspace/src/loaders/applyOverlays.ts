import { applyOpenAPIOverlay, type OverlayAction } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";

// Module-level temp directory - created once and reused
let tempDir: string | undefined;

interface OverlayDocument {
    overlay: string;
    info: {
        title: string;
        version: string;
    };
    extends?: string;
    actions: OverlayAction[];
}

async function getTempDir(): Promise<string> {
    if (tempDir === undefined) {
        const dir = await tmp.dir({ prefix: "fern-overlay-" });
        tempDir = dir.path;
    }
    return tempDir;
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
 * @param absoluteFilePathToOpenAPI - Path to the original OpenAPI file (for naming the output)
 * @param data - The OpenAPI document to apply the overlay to
 * @param context - Task context for logging and error handling
 * @returns The OpenAPI document with the overlay applied
 */
export async function applyOverlays<T extends object>({
    absoluteFilePathToOverlay,
    absoluteFilePathToOpenAPI,
    data,
    context
}: {
    absoluteFilePathToOverlay: AbsoluteFilePath;
    absoluteFilePathToOpenAPI: AbsoluteFilePath;
    data: T;
    context: TaskContext;
}): Promise<T> {
    const overlay = await parseOverlayFile(absoluteFilePathToOverlay, context);

    if (!validateOverlay(overlay, context)) {
        return data;
    }

    context.logger.debug(`Applying overlay "${overlay.info.title}" v${overlay.info.version}`);

    const result = applyOpenAPIOverlay({
        data,
        overlay
    });

    // Write the overlaid result to a temp file for debugging/inspection
    const dir = await getTempDir();
    const originalFileName = path.basename(absoluteFilePathToOpenAPI);
    const outputFileName = `${path.parse(originalFileName).name}.overlaid.json`;
    const outputPath = path.join(dir, outputFileName);

    await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");
    context.logger.info(`Wrote overlaid OpenAPI spec to: ${outputPath}`);

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
