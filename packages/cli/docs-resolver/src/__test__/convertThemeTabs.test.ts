import { describe, expect, it } from "vitest";

import { convertThemeTabs } from "../DocsDefinitionResolver.js";

describe("convertThemeTabs", () => {
    it("passes through the shorthand style string", () => {
        expect(convertThemeTabs("bubble")).toBe("bubble");
        expect(convertThemeTabs(undefined)).toBeUndefined();
    });

    it("uppercases placement and alignment to match the FDR enums", () => {
        expect(convertThemeTabs({ style: "default", alignment: "center", placement: "header" })).toEqual({
            style: "default",
            alignment: "CENTER",
            placement: "HEADER"
        });
        expect(convertThemeTabs({ placement: "sidebar", alignment: "left" })).toEqual({
            style: undefined,
            alignment: "LEFT",
            placement: "SIDEBAR"
        });
    });

    it("leaves unset placement and alignment undefined", () => {
        expect(convertThemeTabs({ style: "bubble" })).toEqual({
            style: "bubble",
            alignment: undefined,
            placement: undefined
        });
    });
});
