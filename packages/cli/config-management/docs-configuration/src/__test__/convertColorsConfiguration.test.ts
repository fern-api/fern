import { createMockTaskContext } from "@fern-api/task-context";
import tinycolor from "tinycolor2";
import { convertThemedColorConfig, getColorType } from "../convertColorsConfiguration";

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

describe("convertThemedColorConfig", () => {
    it("correctly interprets dark", () => {
        const rawConfig = {
            background: "#000",
            accentPrimary: "#fff"
        };
        const converted = convertThemedColorConfig(rawConfig, createMockTaskContext(), "dark");
        expect(converted).toMatchSnapshot();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(tinycolor.isReadable(converted.accentPrimary!, converted.background!)).toBe(true);
    });

    it("converts dark to light", () => {
        const rawConfig = {
            background: "#000",
            accentPrimary: "#fff"
        };
        const converted = convertThemedColorConfig(rawConfig, createMockTaskContext(), "light");
        expect(converted).toMatchSnapshot();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(tinycolor.isReadable(converted.accentPrimary!, converted.background!)).toBe(true);
    });

    it("correctly interprets light", () => {
        const rawConfig = {
            background: "#fff",
            accentPrimary: "#000"
        };
        const converted = convertThemedColorConfig(rawConfig, createMockTaskContext(), "light");
        expect(converted).toMatchSnapshot();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(tinycolor.isReadable(converted.accentPrimary!, converted.background!)).toBe(true);
    });

    it("converts light to dark", () => {
        const rawConfig = {
            background: "#fff",
            accentPrimary: "#000"
        };
        const converted = convertThemedColorConfig(rawConfig, createMockTaskContext(), "dark");
        expect(converted).toMatchSnapshot();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(tinycolor.isReadable(converted.accentPrimary!, converted.background!)).toBe(true);
    });
});
