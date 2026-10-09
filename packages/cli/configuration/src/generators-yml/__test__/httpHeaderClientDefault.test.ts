import { describe, expect, it } from "vitest";

import { serialization } from "../schemas/index.js";

describe("generators.yml HttpHeaderSchema client-default", () => {
    it("retains client-default on a global header declaration", async () => {
        const parsed = await serialization.fernDefinition.HttpHeaderSchema.parseOrThrow({
            type: "optional<string>",
            name: "myHeader",
            env: "MY_HEADER",
            "client-default": "default-value"
        });

        expect(typeof parsed).toBe("object");
        if (typeof parsed === "object") {
            expect(parsed["client-default"]).toBe("default-value");
        }
    });

    it("still accepts a header declaration without client-default", async () => {
        const parsed = await serialization.fernDefinition.HttpHeaderSchema.parseOrThrow({
            type: "optional<string>",
            name: "myHeader",
            env: "MY_HEADER"
        });

        expect(typeof parsed).toBe("object");
        if (typeof parsed === "object") {
            expect(parsed["client-default"]).toBeUndefined();
        }
    });
});
