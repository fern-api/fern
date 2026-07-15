import { describe, expect, it } from "vitest";

import { planVariantJsonStripping, VariantStripInput } from "../union/planVariantJsonStripping.js";

const DISCRIMINATOR = "type";

describe("planVariantJsonStripping", () => {
    it("strips only the discriminant for a variant with no suppressed base properties", () => {
        const variants: VariantStripInput[] = [
            { discriminantValue: "circle", declaresDiscriminant: false, baseWireNamesToOmit: [] }
        ];
        const { locals, varByDiscriminant } = planVariantJsonStripping(variants, DISCRIMINATOR);
        expect(locals).toHaveLength(1);
        expect(locals[0]).toMatchObject({
            varName: "jsonWithoutDiscriminator",
            objName: "jsonObject",
            wireNames: ["type"],
            commentKind: "discriminant"
        });
        expect(varByDiscriminant.get("circle")).toBe("jsonWithoutDiscriminator");
    });

    it("keeps the discriminant when the variant declares a property with that wire name", () => {
        // The variant redeclares `type`, so it must not be stripped; with no base properties to
        // strip either, the variant reads the raw `json` (absent from the map).
        const variants: VariantStripInput[] = [
            { discriminantValue: "circle", declaresDiscriminant: true, baseWireNamesToOmit: [] }
        ];
        const { locals, varByDiscriminant } = planVariantJsonStripping(variants, DISCRIMINATOR);
        expect(locals).toHaveLength(0);
        expect(varByDiscriminant.has("circle")).toBe(false);
    });

    it("shares one local across variants that strip the same set", () => {
        const variants: VariantStripInput[] = [
            { discriminantValue: "circle", declaresDiscriminant: false, baseWireNamesToOmit: ["name", "id"] },
            { discriminantValue: "square", declaresDiscriminant: false, baseWireNamesToOmit: ["name", "id"] }
        ];
        const { locals, varByDiscriminant } = planVariantJsonStripping(variants, DISCRIMINATOR);
        // Identical strip sets → a single shared local, emitted once.
        expect(locals).toHaveLength(1);
        expect(locals[0]).toMatchObject({
            varName: "jsonWithoutDiscriminator",
            wireNames: ["type", "name", "id"],
            commentKind: "discriminant-and-base-properties"
        });
        expect(varByDiscriminant.get("circle")).toBe("jsonWithoutDiscriminator");
        expect(varByDiscriminant.get("square")).toBe("jsonWithoutDiscriminator");
    });

    it("emits distinct locals for two distinct strip sets and points each variant at its own", () => {
        // The multi-set selection path: `circle` strips the discriminant + `radius`; `square` strips the
        // discriminant + `side`. Each variant must strip only its own union-owned properties, so they get
        // separate locals — `square` must NOT reuse `circle`'s local (that would drop `square.side` or
        // keep `radius`). The second distinct discriminant-stripping set is suffixed to avoid a name clash.
        const variants: VariantStripInput[] = [
            { discriminantValue: "circle", declaresDiscriminant: false, baseWireNamesToOmit: ["radius"] },
            { discriminantValue: "square", declaresDiscriminant: false, baseWireNamesToOmit: ["side"] }
        ];
        const { locals, varByDiscriminant } = planVariantJsonStripping(variants, DISCRIMINATOR);

        expect(locals).toHaveLength(2);
        expect(locals[0]).toMatchObject({
            varName: "jsonWithoutDiscriminator",
            objName: "jsonObject",
            wireNames: ["type", "radius"]
        });
        expect(locals[1]).toMatchObject({
            varName: "jsonWithoutDiscriminator2",
            objName: "jsonWithoutDiscriminator2Object",
            wireNames: ["type", "side"]
        });

        expect(varByDiscriminant.get("circle")).toBe("jsonWithoutDiscriminator");
        expect(varByDiscriminant.get("square")).toBe("jsonWithoutDiscriminator2");

        // Each local removes only its own variant's union-owned properties.
        expect(locals[0]?.wireNames).not.toContain("side");
        expect(locals[1]?.wireNames).not.toContain("radius");
    });

    it("distinguishes strip sets whose wire names differ only by boundary (NUL-keyed signature)", () => {
        // `["a b", "c"]` and `["a", "b c"]` share the same space-joined string but are different sets;
        // keying on a NUL join keeps them distinct so they do not collapse into one shared local.
        const variants: VariantStripInput[] = [
            { discriminantValue: "first", declaresDiscriminant: true, baseWireNamesToOmit: ["a b", "c"] },
            { discriminantValue: "second", declaresDiscriminant: true, baseWireNamesToOmit: ["a", "b c"] }
        ];
        const { locals, varByDiscriminant } = planVariantJsonStripping(variants, DISCRIMINATOR);
        expect(locals).toHaveLength(2);
        expect(varByDiscriminant.get("first")).toBe("jsonWithoutBaseProperties");
        expect(varByDiscriminant.get("second")).toBe("jsonWithoutBaseProperties2");
    });

    it("uses the base-properties local name and comment when only base properties are stripped", () => {
        const variants: VariantStripInput[] = [
            { discriminantValue: "circle", declaresDiscriminant: true, baseWireNamesToOmit: ["name"] }
        ];
        const { locals } = planVariantJsonStripping(variants, DISCRIMINATOR);
        expect(locals).toHaveLength(1);
        expect(locals[0]).toMatchObject({
            varName: "jsonWithoutBaseProperties",
            objName: "basePropertiesJsonObject",
            wireNames: ["name"],
            commentKind: "base-properties"
        });
    });
});
