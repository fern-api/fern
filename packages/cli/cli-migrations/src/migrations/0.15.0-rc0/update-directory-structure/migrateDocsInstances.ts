import { docsYml } from "@fern-api/configuration-loader";
import { CliError } from "@fern-api/task-context";
import { DocsURL } from "./docs-config/index.js";

export function migrateDocsInstances(docsURLs: docsYml.RawSchemas.DocsInstance[]): DocsURL[] {
    return docsURLs.map((docsURL) => {
        if (Array.isArray(docsURL.customDomain)) {
            throw new CliError({
                message: "Expected custom-domain to be a string, but it was an array.",
                code: CliError.Code.ConfigError
            });
        }
        return {
            ...docsURL,
            customDomain: docsURL.customDomain
        };
    });
}
