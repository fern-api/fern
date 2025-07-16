import { createMockTaskContext } from "@fern-api/task-context";

import { convertColorsConfiguration, getColorType } from "../convertColorsConfiguration";

describe("getColorType", () => {
    it("should return dark if background is dark", () => {
        expect(getColorType({ background: "#000" })).toBe("dark");
    });

    it("should return light if background is light", () => {
        expect(getColorType({ background: "#fff" })).toBe("light");
    });

    it("should return light if accentPrimary is dark", () => {
        expect(getColorType({ accentPrimary: "#000" })).toBe("light");
    });

    it("should return dark if accentPrimary is light", () => {
        expect(getColorType({ accentPrimary: "#fff" })).toBe("dark");
    });

    it("should return dark if both background and accentPrimary are dark", () => {
        expect(getColorType({ background: { dark: "#000" }, accentPrimary: { dark: "#000" } })).toBe("dark");
    });

    it("should return light if both background and accentPrimary are light", () => {
        expect(getColorType({ background: { light: "#fff" }, accentPrimary: { light: "#fff" } })).toBe("light");
    });

    it("should return darkAndLight if background and accentPrimary are both darkAndLight", () => {
        expect(
            getColorType({
                background: { dark: "#000", light: "#fff" },
                accentPrimary: { dark: "#000", light: "#fff" }
            })
        ).toBe("darkAndLight");
    });

    it("should return dark if background is dark and accentPrimary is dark", () => {
        expect(getColorType({ background: { dark: "#000" }, accentPrimary: { dark: "#fff" } })).toBe("dark");
    });

    it("should return light if background is light and accentPrimary is light", () => {
        expect(getColorType({ background: { light: "#fff" }, accentPrimary: { light: "#000" } })).toBe("light");
    });

    it("should return darkAndLight if background is dark and accentPrimary is light", () => {
        expect(getColorType({ background: { dark: "#000" }, accentPrimary: { light: "#000" } })).toBe("darkAndLight");
    });
});

describe("convertColorsConfiguration", () => {
    it("should support accentPrimaryDeprecated", () => {
        const rawConfig = {
            accentPrimaryDeprecated: "#5D65EE"
        };
        expect(convertColorsConfiguration(rawConfig, createMockTaskContext())).toMatchSnapshot();
    });
});
