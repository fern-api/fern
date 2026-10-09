import { describe, expect, it } from "vitest";
import { normalizeRepoUrlToHttps } from "../normalizeRepoUrl.js";

describe("normalizeRepoUrlToHttps", () => {
    it("converts GitHub slug to HTTPS URL", () => {
        expect(normalizeRepoUrlToHttps("acme/docs", "github")).toBe("https://github.com/acme/docs");
    });

    it("converts GitLab slug to HTTPS URL", () => {
        expect(normalizeRepoUrlToHttps("acme/docs", "gitlab")).toBe("https://gitlab.com/acme/docs");
    });

    it("converts Bitbucket slug to HTTPS URL", () => {
        expect(normalizeRepoUrlToHttps("acme/docs", "bitbucket")).toBe("https://bitbucket.org/acme/docs");
    });

    it("passes through an HTTPS URL unchanged", () => {
        const url = "https://github.enterprise.com/acme/docs";
        expect(normalizeRepoUrlToHttps(url, "github")).toBe(url);
    });

    it("passes through an HTTP URL unchanged", () => {
        const url = "http://gitlab.internal/acme/docs";
        expect(normalizeRepoUrlToHttps(url, "gitlab")).toBe(url);
    });
});
