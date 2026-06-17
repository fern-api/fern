import { afterEach, describe, expect, it } from "vitest";
import { getDocsDeployMode } from "../docsDeployMode.js";

describe("getDocsDeployMode", () => {
    const originalDeployMode = process.env.FERN_DOCS_DEPLOY_MODE;
    const originalSelfHosted = process.env.FERN_SELF_HOSTED;

    afterEach(() => {
        if (originalDeployMode === undefined) {
            delete process.env.FERN_DOCS_DEPLOY_MODE;
        } else {
            process.env.FERN_DOCS_DEPLOY_MODE = originalDeployMode;
        }
        if (originalSelfHosted === undefined) {
            delete process.env.FERN_SELF_HOSTED;
        } else {
            process.env.FERN_SELF_HOSTED = originalSelfHosted;
        }
    });

    it("defaults to legacy when env var is unset", () => {
        delete process.env.FERN_DOCS_DEPLOY_MODE;
        expect(getDocsDeployMode()).toBe("legacy");
    });

    it("defaults to legacy when env var is empty", () => {
        process.env.FERN_DOCS_DEPLOY_MODE = "";
        expect(getDocsDeployMode()).toBe("legacy");
    });

    it("returns ledger", () => {
        process.env.FERN_DOCS_DEPLOY_MODE = "ledger";
        expect(getDocsDeployMode()).toBe("ledger");
    });

    it("is case-insensitive", () => {
        process.env.FERN_DOCS_DEPLOY_MODE = "LEDGER";
        expect(getDocsDeployMode()).toBe("ledger");
    });

    it("trims whitespace", () => {
        process.env.FERN_DOCS_DEPLOY_MODE = "  ledger  ";
        expect(getDocsDeployMode()).toBe("ledger");
    });

    it("falls back to legacy for unrecognized values", () => {
        process.env.FERN_DOCS_DEPLOY_MODE = "banana";
        expect(getDocsDeployMode()).toBe("legacy");
    });

    it("forces legacy when FERN_SELF_HOSTED=true, even if deploy mode is ledger", () => {
        process.env.FERN_SELF_HOSTED = "true";
        process.env.FERN_DOCS_DEPLOY_MODE = "ledger";
        expect(getDocsDeployMode()).toBe("legacy");
    });

    it("does not force legacy when FERN_SELF_HOSTED is not 'true'", () => {
        process.env.FERN_SELF_HOSTED = "false";
        process.env.FERN_DOCS_DEPLOY_MODE = "ledger";
        expect(getDocsDeployMode()).toBe("ledger");
    });
});
