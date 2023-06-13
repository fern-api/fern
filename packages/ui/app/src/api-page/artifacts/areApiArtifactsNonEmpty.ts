import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v1/resources/read";

export function areApiArtifactsNonEmpty(apiArtifacts: FernRegistryDocsRead.ApiArtifacts.Raw): boolean {
    return apiArtifacts.sdks.length > 0 || apiArtifacts.postman != null;
}
