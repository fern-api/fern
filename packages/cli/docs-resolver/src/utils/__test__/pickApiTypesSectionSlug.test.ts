import { FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { pickApiTypesSectionSlug } from "../pickApiTypesSectionSlug.js";

const parent = FernNavigation.V1.SlugGenerator.init("api-reference");

describe("pickApiTypesSectionSlug", () => {
    it("uses `types` when no sibling owns it", () => {
        expect(pickApiTypesSectionSlug(parent, new Set(["api-reference/calls"]))).toBe("types");
    });

    it("falls back to `schemas` when a sibling owns `types` (e.g. the GraphQL types section)", () => {
        expect(pickApiTypesSectionSlug(parent, new Set(["api-reference/types"]))).toBe("schemas");
    });

    it("numbers the slug when both `types` and `schemas` are taken", () => {
        const taken = new Set(["api-reference/types", "api-reference/schemas", "api-reference/types-2"]);
        expect(pickApiTypesSectionSlug(parent, taken)).toBe("types-3");
    });
});
