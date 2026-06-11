import { afterEach, describe, expect, it } from "vitest";
import { getDocsDeployMode } from "../docsDeployMode.js";

describe("getDocsDeployMode", () => {
    const originalEnv = process.env.FERN_DOCS_DEPLOY_MODE;

    afterEach(() => {
        if (originalEnv === undefined) {
            delete process.env.FERN_DOCS_DEPLOY_MODE;
        } else {
            process.env.FERN_DOCS_DEPLOY_MODE = originalEnv;
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
});
