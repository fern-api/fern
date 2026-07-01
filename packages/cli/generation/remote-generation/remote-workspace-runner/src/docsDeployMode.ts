/**
 * Controls which docs deployment backend the CLI writes to.
 *
 * Set via FERN_DOCS_DEPLOY_MODE environment variable:
 *   - "ledger"  (default) — docs-ledger only (fast, incremental).
 *   - "legacy"            — existing startDocsRegister / finishDocsRegister flow (opt-in).
 *
 * Self-hosted deployments (FERN_SELF_HOSTED=true) always use legacy mode because
 * the self-hosted FDR does not expose ledger endpoints or S3 infrastructure.
 */
export type DocsDeployMode = "legacy" | "ledger";

const VALID_MODES = new Set<DocsDeployMode>(["legacy", "ledger"]);

export function getDocsDeployMode(): DocsDeployMode {
    if (process.env.FERN_SELF_HOSTED === "true") {
        return "legacy";
    }
    const raw = process.env.FERN_DOCS_DEPLOY_MODE?.toLowerCase().trim();
    if (raw == null || raw === "") {
        return "ledger";
    }
    if (isValidMode(raw)) {
        return raw;
    }
    // biome-ignore lint/suspicious/noConsole: intentional user-facing warning for invalid env var
    console.warn(
        `[fern] Unrecognized FERN_DOCS_DEPLOY_MODE="${raw}" — falling back to "ledger". Valid values: ledger, legacy.`
    );
    return "ledger";
}

function isValidMode(value: string): value is DocsDeployMode {
    return VALID_MODES.has(value as DocsDeployMode);
}
