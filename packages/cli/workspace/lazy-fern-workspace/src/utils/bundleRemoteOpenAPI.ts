import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { isHttpUrl } from "@fern-api/core-utils";
import { BaseResolver, bundle, Source } from "@redocly/openapi-core";
import { resolveRelativeServerUrls } from "./resolveRelativeServerUrls.js";
import { type RemoteTextResource, safeFetchRemoteText } from "./safeRemoteUrl.js";

type RemoteLoader = (url: string) => Promise<RemoteTextResource>;

class SafeRemoteOpenAPIResolver extends BaseResolver {
    /** The URL each loaded document was served from, after redirects. */
    public readonly finalUrls = new Map<string, string>();

    constructor(private readonly loadRemote: RemoteLoader) {
        super();
    }

    public override async loadExternalRef(absoluteRef: string): Promise<Source> {
        if (!isHttpUrl(absoluteRef)) {
            return super.loadExternalRef(absoluteRef);
        }
        const resource = await this.loadRemote(absoluteRef);
        this.finalUrls.set(absoluteRef, resource.url ?? absoluteRef);
        return new Source(absoluteRef, resource.body, resource.mimeType);
    }
}

/**
 * Bundles a remote OpenAPI document and all relative references into one in-memory document. Relative
 * `servers` URLs are resolved against the URL the document was served from (after redirects), because the
 * bundle no longer knows where it came from. Pass `resolveRelativeServers: false` when overrides or overlays
 * are applied later, since they may select or replace `servers` by the URL as written.
 */
export async function bundleRemoteOpenAPI(
    url: string,
    loadRemote: RemoteLoader = safeFetchRemoteText,
    { resolveRelativeServers = true }: { resolveRelativeServers?: boolean } = {}
): Promise<unknown> {
    const resolver = new SafeRemoteOpenAPIResolver(loadRemote);
    const result = await bundle({
        ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
        ref: url,
        externalRefResolver: resolver
    });
    const errors = result.problems.filter((problem) => problem.severity === "error");
    if (errors.length > 0) {
        throw new Error(errors.map((problem) => problem.message).join("; "));
    }
    if (!resolveRelativeServers) {
        return result.bundle.parsed;
    }
    return resolveRelativeServerUrls(result.bundle.parsed, resolver.finalUrls.get(url) ?? url);
}
