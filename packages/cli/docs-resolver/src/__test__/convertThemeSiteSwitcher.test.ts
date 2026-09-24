import { DocsV1Write } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { convertThemeSiteSwitcher } from "../DocsDefinitionResolver.js";

describe("convertThemeSiteSwitcher", () => {
    it("maps showProducts to the FDR show-products key", () => {
        const converted = convertThemeSiteSwitcher({
            enabled: true,
            order: ["/dynamo", "/nemo"],
            hide: ["/internal"],
            labels: { "/holoscan/sdk-user-guide": "Holoscan SDK" },
            showProducts: true
        });
        expect(converted).toEqual({
            enabled: true,
            order: ["/dynamo", "/nemo"],
            hide: ["/internal"],
            labels: { "/holoscan/sdk-user-guide": "Holoscan SDK" },
            "show-products": true
        });
        const parsed = DocsV1Write.DocsThemeConfigSchema.safeParse({ "site-switcher": converted });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data["site-switcher"]?.["show-products"]).toBe(true);
        }
    });

    it("passes through undefined", () => {
        expect(convertThemeSiteSwitcher(undefined)).toBeUndefined();
    });
});
