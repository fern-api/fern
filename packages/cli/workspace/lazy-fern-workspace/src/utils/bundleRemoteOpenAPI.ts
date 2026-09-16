import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { BaseResolver, bundle, Source } from "@redocly/openapi-core";

import { type RemoteTextResource, safeFetchRemoteText } from "./safeRemoteUrl.js";

type RemoteLoader = (url: string) => Promise<RemoteTextResource>;

class SafeRemoteOpenAPIResolver extends BaseResolver {
    constructor(private readonly loadRemote: RemoteLoader) {
        super();
    }

    public override async loadExternalRef(absoluteRef: string): Promise<Source> {
        if (!absoluteRef.startsWith("http://") && !absoluteRef.startsWith("https://")) {
            return super.loadExternalRef(absoluteRef);
        }
        const resource = await this.loadRemote(absoluteRef);
        return new Source(absoluteRef, resource.body, resource.mimeType);
    }
}

/** Bundles a remote OpenAPI document and all relative references into one in-memory document. */
export async function bundleRemoteOpenAPI(
    url: string,
    loadRemote: RemoteLoader = safeFetchRemoteText
): Promise<unknown> {
    const result = await bundle({
        ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
        ref: url,
        externalRefResolver: new SafeRemoteOpenAPIResolver(loadRemote)
    });
    const errors = result.problems.filter((problem) => problem.severity === "error");
    if (errors.length > 0) {
        throw new Error(errors.map((problem) => problem.message).join("; "));
    }
    return result.bundle.parsed;
}
