import { describe, expect, it } from "vitest";
import { remapFileIdsToPaths } from "../astro/buildAstroPreviewModel.js";

const SVG_ID = "bc2eecf9-7976-42d6-9c06-c0d6dc443d7f";
const PNG_ID = "b7404fc3-2f42-45c5-85bc-aa99fadde1af";
const fileIdToPath = new Map([
    [SVG_ID, "assets/brand.svg"],
    [PNG_ID, "assets/green.png"]
]);

describe("remapFileIdsToPaths", () => {
    it("rewrites nav file icons and images from fileIds to paths", () => {
        const config = {
            title: "Product switcher",
            root: {
                type: "productgroup",
                children: [
                    { type: "product", title: "SVG", icon: `file:${SVG_ID}`, image: PNG_ID },
                    { type: "product", title: "FA", icon: "fa-solid fa-plug" },
                    {
                        type: "product",
                        title: "Tabs",
                        child: { type: "tabbed", children: [{ type: "tab", icon: `file:${PNG_ID}` }] }
                    }
                ]
            }
        };

        expect(remapFileIdsToPaths(config, fileIdToPath)).toEqual({
            title: "Product switcher",
            root: {
                type: "productgroup",
                children: [
                    { type: "product", title: "SVG", icon: "file:assets/brand.svg", image: "assets/green.png" },
                    { type: "product", title: "FA", icon: "fa-solid fa-plug" },
                    {
                        type: "product",
                        title: "Tabs",
                        child: { type: "tabbed", children: [{ type: "tab", icon: "file:assets/green.png" }] }
                    }
                ]
            }
        });
    });

    it("leaves unknown file refs, URLs and non-string values untouched", () => {
        const config = {
            icon: "file:unknown-id",
            url: "https://example.com/icon.svg",
            hidden: false,
            order: 3,
            missing: undefined,
            empty: null
        };

        expect(remapFileIdsToPaths(config, fileIdToPath)).toEqual(config);
    });
});
