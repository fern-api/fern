import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { bundle, Source } from "@redocly/openapi-core";
import { OpenAPI } from "openapi-types";

import { OpenAPIRefResolver } from "../loaders/OpenAPIRefResolver";

export async function parseOpenAPI({
    absolutePathToOpenAPI,
    absolutePathToOpenAPIOverrides,
    parsed
}: {
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides?: AbsoluteFilePath;
    parsed?: OpenAPI.Document;
}): Promise<OpenAPI.Document> {
    const result =
        parsed != null
            ? await bundle({
                  ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                  doc: {
                      source: new Source(absolutePathToOpenAPI, "<openapi>"),
                      parsed
                  },
                  externalRefResolver: new OpenAPIRefResolver(absolutePathToOpenAPIOverrides)
              })
            : await bundle({
                  ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                  ref: absolutePathToOpenAPI,
                  externalRefResolver: new OpenAPIRefResolver(absolutePathToOpenAPIOverrides)
              });

    return result.bundle.parsed;
}
