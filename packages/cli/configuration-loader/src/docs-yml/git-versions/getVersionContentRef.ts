import { docsYml } from "@fern-api/configuration";

/**
 * Extracts the git ref (tag, branch, or commit SHA) a version entry builds its
 * content from, or `undefined` if the version resolves against the working tree.
 *
 * This is the single place that knows the docs.yml field shape for ref-backed
 * versions, so collapsing `tag:`/`branch:` into a single `ref:` field later is a
 * one-spot change.
 */
export function getVersionContentRef(version: docsYml.RawSchemas.VersionConfig): string | undefined {
    return version.branch ?? version.tag;
}
