import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { bundle, Source } from "@redocly/openapi-core";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI } from "openapi-types";

import { OpenAPIRefResolver } from "../loaders/OpenAPIRefResolver.js";
import { findCircularRefs } from "./findCircularRefs.js";

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
