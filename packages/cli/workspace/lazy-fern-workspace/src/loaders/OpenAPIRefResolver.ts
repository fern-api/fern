import { BaseResolver } from "@redocly/openapi-core";
import path from "path";

import { doesPathExistSync } from "@fern-api/fs-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

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
        const result = super.resolveExternalRef(base, ref);
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
