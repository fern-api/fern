import { FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { pickApiTypesSection } from "../pickApiTypesSection.js";

const parent = FernNavigation.V1.SlugGenerator.init("api-reference");

describe("pickApiTypesSection", () => {
    it("uses `types` when no sibling owns it", () => {
        expect(pickApiTypesSection(parent, new Set(["api-reference/calls"]))).toEqual({
            slug: "types",
            title: "Types"
        });
    });

    it("falls back to `schemas` when a sibling owns `types` (e.g. the GraphQL types section)", () => {
        expect(pickApiTypesSection(parent, new Set(["api-reference/types"]))).toEqual({
            slug: "schemas",
            title: "Schemas"
        });
    });

    it("numbers the slug when both `types` and `schemas` are taken", () => {
        const taken = new Set(["api-reference/types", "api-reference/schemas", "api-reference/types-2"]);
        expect(pickApiTypesSection(parent, taken)).toEqual({ slug: "types-3", title: "Types" });
    });
});
