import { describe, expect, it } from "vitest";

import { convertThemeCodeBlocks } from "../DocsDefinitionResolver.js";

describe("convertThemeCodeBlocks", () => {
    it("omits the key when theme.code-blocks is not set", () => {
        expect(convertThemeCodeBlocks(undefined)).toEqual({});
        expect(convertThemeCodeBlocks({})).toEqual({});
    });

    it("maps light and dark themes to the FDR code-blocks key", () => {
        expect(convertThemeCodeBlocks({ light: "github-light", dark: "github-dark-dimmed" })).toEqual({
            "code-blocks": { light: "github-light", dark: "github-dark-dimmed" }
        });
        expect(convertThemeCodeBlocks({ dark: "github-dark" })).toEqual({
            "code-blocks": { light: undefined, dark: "github-dark" }
        });
    });
});
