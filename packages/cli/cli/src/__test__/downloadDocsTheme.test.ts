import path from "path";
import { describe, expect, it } from "vitest";
import { isThemeResponse, relativizeAssetPaths } from "../commands/docs-theme/downloadDocsTheme.js";

const OUT_DIR = path.resolve("/tmp/fern-theme-out");

describe("relativizeAssetPaths", () => {
    it("rewrites downloaded absolute paths relative to the theme dir and leaves everything else", () => {
        const resolved = {
            logo: { dark: path.join(OUT_DIR, "logo-dark.png"), light: path.join(OUT_DIR, "logo-light.png") },
            favicon: path.join(OUT_DIR, "favicon.ico"),
            colors: { accentPrimary: "#76b900" },
            css: [path.join(OUT_DIR, "style.css"), "https://cdn.example.com/remote.css"],
            js: [
                { url: "https://cdn.example.com/lib.js" },
                { path: path.join(OUT_DIR, "module.js"), strategy: "lazy" }
            ],
            typography: { bodyFont: { paths: [{ path: path.join(OUT_DIR, "body.woff2"), weight: "400" }] } },
            "some-other-abs": "/etc/hosts"
        };

        expect(relativizeAssetPaths(resolved, OUT_DIR)).toEqual({
            logo: { dark: "logo-dark.png", light: "logo-light.png" },
            favicon: "favicon.ico",
            colors: { accentPrimary: "#76b900" },
            css: ["style.css", "https://cdn.example.com/remote.css"],
            js: [{ url: "https://cdn.example.com/lib.js" }, { path: "module.js", strategy: "lazy" }],
            typography: { bodyFont: { paths: [{ path: "body.woff2", weight: "400" }] } },
            "some-other-abs": "/etc/hosts"
        });
    });
});

describe("isThemeResponse", () => {
    it("accepts a response with a config object", () => {
        expect(isThemeResponse({ name: "nvidia", config: { colors: {} } })).toBe(true);
    });

    it("rejects responses without a config object", () => {
        expect(isThemeResponse(null)).toBe(false);
        expect(isThemeResponse({ name: "nvidia" })).toBe(false);
        expect(isThemeResponse({ config: [] })).toBe(false);
        expect(isThemeResponse({ config: "x" })).toBe(false);
    });
});
