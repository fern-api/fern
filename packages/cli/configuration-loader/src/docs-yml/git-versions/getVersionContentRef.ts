import { docsYml } from "@fern-api/configuration";

/**
 * Extracts the git ref (branch, tag, or commit SHA) a version entry builds its
 * content from, or `undefined` if the version resolves against the working tree.
 *
 * This is the single place that knows the docs.yml field shape for ref-backed
 * versions, so any change to how a ref is declared is a one-spot change.
 */
export function getVersionContentRef(version: docsYml.RawSchemas.VersionConfig): string | undefined {
    return version.ref;
}
