import { AbsoluteFilePath, doesPathExistSync } from "@fern-api/fs-utils";
import { BaseResolver } from "@redocly/openapi-core";
import path from "path";

/*
 * OpenAPIRefResolver is used to extend the behavior of the redocly OpenAPI parser.
 */
export class OpenAPIRefResolver extends BaseResolver {
    private absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
    private absolutePathToOpenAPIOverlays: AbsoluteFilePath | undefined;

    constructor({
        absolutePathToOpenAPIOverrides,
        absolutePathToOpenAPIOverlays
    }: {
        absolutePathToOpenAPIOverrides?: AbsoluteFilePath;
        absolutePathToOpenAPIOverlays?: AbsoluteFilePath;
    }) {
        super();
        this.absolutePathToOpenAPIOverrides = absolutePathToOpenAPIOverrides;
        this.absolutePathToOpenAPIOverlays = absolutePathToOpenAPIOverlays;
    }

    public resolveExternalRef(base: string | null, ref: string): string {
        const result = super.resolveExternalRef(base, ref);

        // If it's an HTTP/HTTPS URL, return it as-is and let Redocly handle fetching
        if (result.startsWith("http://") || result.startsWith("https://")) {
            return result;
        }

        // For local files, check if they exist
        if (doesPathExistSync(AbsoluteFilePath.of(result))) {
            return result;
        }

        // If we fail to resolve the ref, we try to resolve it relative to the
        // absolutePathToOpenAPIOverlays first (since overlays are applied after overrides),
        // then fall back to absolutePathToOpenAPIOverrides as a best effort.
        //
        // This is especially useful for OpenAPI sources that require writing to
        // temporary directories (e.g. Protobuf) and for resolving refs in overlays
        // that may be relative to the overlay file location.
        if (this.absolutePathToOpenAPIOverlays != null) {
            const overlayResolved = path.resolve(path.dirname(this.absolutePathToOpenAPIOverlays), ref);
            if (doesPathExistSync(AbsoluteFilePath.of(overlayResolved))) {
                return overlayResolved;
            }
        }

        if (this.absolutePathToOpenAPIOverrides != null) {
            return path.resolve(path.dirname(this.absolutePathToOpenAPIOverrides), ref);
        }
        return result;
    }
}
