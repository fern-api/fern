/**
 * Controls which docs deployment backend the CLI writes to.
 *
 * Set via FERN_DOCS_DEPLOY_MODE environment variable:
 *   - "legacy"  (default) — existing startDocsRegister / finishDocsRegister flow only.
 *   - "dual"              — legacy flow + new docs-ledger register/finish (dual write).
 *   - "ledger"            — docs-ledger only (fast, incremental).
 */
export type DocsDeployMode = "legacy" | "dual" | "ledger";

const VALID_MODES = new Set<DocsDeployMode>(["legacy", "dual", "ledger"]);

export function getDocsDeployMode(): DocsDeployMode {
    const raw = process.env.FERN_DOCS_DEPLOY_MODE?.toLowerCase().trim();
    if (raw == null || raw === "") {
        return "legacy";
    }
    if (isValidMode(raw)) {
        return raw;
    }
    // Fall back to legacy for unrecognized values, but warn at debug level
    // (the caller can surface this via context.logger.debug).
    return "legacy";
}

function isValidMode(value: string): value is DocsDeployMode {
    return VALID_MODES.has(value as DocsDeployMode);
}
