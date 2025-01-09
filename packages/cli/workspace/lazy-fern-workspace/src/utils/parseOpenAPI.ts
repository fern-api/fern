import { Source, bundle } from "@redocly/openapi-core";
import { OpenAPI } from "openapi-types";

import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export async function parseOpenAPI({
    absolutePathToOpenAPI,
    parsed
}: {
    absolutePathToOpenAPI: AbsoluteFilePath;
    parsed?: OpenAPI.Document;
}): Promise<OpenAPI.Document> {
    const result =
        parsed != null
            ? await bundle({
                  ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                  doc: {
                      source: new Source(absolutePathToOpenAPI, "<openapi>"),
                      parsed
                  }
              })
            : await bundle({
                  ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                  ref: absolutePathToOpenAPI
              });
    return result.bundle.parsed;
}
