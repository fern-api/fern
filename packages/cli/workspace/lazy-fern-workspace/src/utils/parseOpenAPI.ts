import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { bundle, Source } from "@redocly/openapi-core";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI } from "openapi-types";

import { OpenAPIRefResolver } from "../loaders/OpenAPIRefResolver.js";
import { type CircularRefInfo, findCircularRefs } from "./findCircularRefs.js";

export async function parseOpenAPI({
    absolutePathToOpenAPI,
    absolutePathToOpenAPIOverrides,
    absolutePathToOpenAPIOverlays,
    parsed,
    logger
}: {
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides?: AbsoluteFilePath;
    absolutePathToOpenAPIOverlays?: AbsoluteFilePath;
    parsed?: OpenAPI.Document;
    logger?: Logger;
}): Promise<OpenAPI.Document> {
    try {
        const result =
            parsed != null
                ? await bundle({
                      ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                      doc: {
                          source: new Source(absolutePathToOpenAPI, "<openapi>"),
                          parsed
                      },
                      externalRefResolver: new OpenAPIRefResolver({
                          absolutePathToOpenAPIOverrides,
                          absolutePathToOpenAPIOverlays
                      })
                  })
                : await bundle({
                      ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                      ref: absolutePathToOpenAPI,
                      externalRefResolver: new OpenAPIRefResolver({
                          absolutePathToOpenAPIOverrides,
                          absolutePathToOpenAPIOverlays
                      })
                  });

        return result.bundle.parsed;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Self-referencing circular pointer")) {
            // Fall back to the unbundled document so processing can continue
            const document = parsed ?? (await readAndParseFile(absolutePathToOpenAPI));

            const circularRefs = findCircularRefs(document);
            const details =
                circularRefs.length > 0
                    ? circularRefs
                          .map((ref) => {
                              const cyclePath = ref.cycle.join(" -> ");
                              return `  - at ${ref.path} ($ref: ${ref.ref})\n    cycle: ${cyclePath}`;
                          })
                          .join("\n")
                    : "  (unable to determine exact location — check your spec for $ref cycles)";

            if (logger) {
                logger.warn(
                    [
                        `Circular $ref detected in ${absolutePathToOpenAPI}.`,
                        `The following references form a cycle:`,
                        details,
                        `Continuing without full reference resolution.`
                    ].join("\n")
                );
            }

            // Break circular $ref cycles so downstream converters don't infinite-loop.
            // Each circularRef.ref is a JSON pointer like "#/components/schemas/X".
            // We collect unique back-edge targets and replace their $ref with an
            // empty object, which the converter treats as an opaque type.
            if (circularRefs.length > 0) {
                breakCircularRefCycles(document, circularRefs);
            }

            return document;
        }
        throw error;
    }
}

async function readAndParseFile(absoluteFilePath: AbsoluteFilePath): Promise<OpenAPI.Document> {
    const contents = await readFile(absoluteFilePath, "utf-8");
    const fileName = absoluteFilePath.toLowerCase();
    if (fileName.endsWith(".json")) {
        return JSON.parse(contents) as OpenAPI.Document;
    }
    return yaml.load(contents) as OpenAPI.Document;
}

/**
 * Mutates `document` in-place to break circular $ref cycles identified by
 * `findCircularRefs`. For each cycle we find the back-edge — the $ref entry
 * whose target is the start of the cycle — and replace it with an empty
 * object schema so the converter doesn't infinite-loop following $ref chains.
 */
function breakCircularRefCycles(document: unknown, circularRefs: CircularRefInfo[]): void {
    if (typeof document !== "object" || document == null) {
        return;
    }

    // Collect the set of $ref values that close a cycle (the back-edges).
    // For each cycle [A, B, C, A], the back-edge is the $ref from C → A.
    const backEdgeRefs = new Set<string>();
    for (const info of circularRefs) {
        if (info.ref.startsWith("#/")) {
            backEdgeRefs.add(info.ref);
        }
    }

    replaceCircularRefs(document, backEdgeRefs);
}

/**
 * Walks the document tree and replaces any `{ "$ref": "<target>" }` objects
 * whose target is in `targets` with `{ type: "object" }` (an opaque schema).
 * Mutates the parent object/array in-place.
 */
function replaceCircularRefs(obj: unknown, targets: Set<string>): void {
    if (typeof obj !== "object" || obj == null) {
        return;
    }

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i];
            if (isCircularRefObject(item, targets)) {
                obj[i] = { type: "object", "x-fern-circular-ref": true };
            } else {
                replaceCircularRefs(item, targets);
            }
        }
        return;
    }

    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
        const value = record[key];
        if (isCircularRefObject(value, targets)) {
            record[key] = { type: "object", "x-fern-circular-ref": true };
        } else {
            replaceCircularRefs(value, targets);
        }
    }
}

function isCircularRefObject(value: unknown, targets: Set<string>): boolean {
    if (typeof value !== "object" || value == null || Array.isArray(value)) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record.$ref === "string" && targets.has(record.$ref);
}
