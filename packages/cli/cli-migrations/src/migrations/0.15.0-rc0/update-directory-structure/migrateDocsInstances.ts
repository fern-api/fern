import { docsYml } from "@fern-api/configuration-loader";

import { DocsURL } from "./docs-config";

export function migrateDocsInstances(docsURLs: docsYml.RawSchemas.DocsInstance[]): DocsURL[] {
    return docsURLs.map((docsURL) => {
        if (Array.isArray(docsURL.customDomain)) {
            throw new Error("Expected custom-domain to be a string, but it was an array.");
        }
        return {
            ...docsURL,
            customDomain: docsURL.customDomain
        };
    });
}
