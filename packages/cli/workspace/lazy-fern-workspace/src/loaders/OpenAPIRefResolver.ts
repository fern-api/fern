import { AbsoluteFilePath, doesPathExistSync } from "@fern-api/fs-utils";
import { BaseResolver } from "@redocly/openapi-core";
import path from "path";

import { normalizeRefString } from "../utils/normalizeRefs";

/*
 * OpenAPIRefResolver is used to extend the behavior of the redocly OpenAPI parser.
 */
export class OpenAPIRefResolver extends BaseResolver {
    private absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;

    constructor(absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined) {
        super();
        this.absolutePathToOpenAPIOverrides = absolutePathToOpenAPIOverrides;
    }

    public resolveExternalRef(base: string | null, ref: string): string {
        const normalizedRef = normalizeRefString(ref);
        const result = super.resolveExternalRef(base, normalizedRef);

        // If it's an HTTP/HTTPS URL, return it as-is and let Redocly handle fetching
        if (result.startsWith("http://") || result.startsWith("https://")) {
            return result;
        }

        // For local files, check if they exist
        if (doesPathExistSync(AbsoluteFilePath.of(result))) {
            return result;
        }

        // If we fail to resolve the ref, we try to resolve it relative to the
        // absolutePathToOpenAPIOverrides as a best effort.
        //
        // This is especially useful for OpenAPI sources that require writing to
        // temporary directories (e.g. Protobuf).
        if (this.absolutePathToOpenAPIOverrides != null) {
            return path.resolve(path.dirname(this.absolutePathToOpenAPIOverrides), ref);
        }
        return result;
    }
}
