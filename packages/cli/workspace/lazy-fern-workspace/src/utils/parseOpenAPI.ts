import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { bundle, Source } from "@redocly/openapi-core";
import { logger } from "@redocly/openapi-core/lib/logger";
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
    const originalInfo = logger.info.bind(logger);
    const originalWarn = logger.warn.bind(logger);
    const originalError = logger.error.bind(logger);

    logger.info = () => {
        void 0;
    };
    logger.warn = () => {
        void 0;
    };
    logger.error = () => {
        void 0;
    };

    try {
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
    } finally {
        logger.info = originalInfo;
        logger.warn = originalWarn;
        logger.error = originalError;
    }
}
