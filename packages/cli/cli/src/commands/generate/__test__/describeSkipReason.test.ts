import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";
import { classifySkipReason, describeSkipReason } from "../describeSkipReason.js";

function makeGenerator(
    overrides: Partial<Pick<generatorsYml.GeneratorInvocation, "automation" | "absolutePathToLocalOutput" | "raw">> = {}
): generatorsYml.GeneratorInvocation {
    return {
        automation: { generate: true, upgrade: true, preview: true, verify: true },
        absolutePathToLocalOutput: undefined,
        raw: undefined,
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

describe("describeSkipReason", () => {
    it("returns null when the generator is eligible", () => {
        expect(describeSkipReason(makeGenerator(), undefined)).toBeNull();
    });

    it("reports automations.generate: false", () => {
        const g = makeGenerator({
            automation: { generate: false, upgrade: true, preview: true, verify: true }
        });
        expect(describeSkipReason(g, undefined)).toBe("automations.generate is false");
    });

    it("reports local-file-system output", () => {
        const g = makeGenerator({
            absolutePathToLocalOutput:
                "/tmp/out" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
        });
        expect(describeSkipReason(g, undefined)).toMatch(/local-file-system/);
    });

    it("reports generator-level autorelease: false", () => {
        const g = makeGenerator({ raw: { autorelease: false } as generatorsYml.GeneratorInvocation["raw"] });
        expect(describeSkipReason(g, undefined)).toBe("autorelease is false");
    });

    it("reports root-level autorelease: false when the generator has no override", () => {
        expect(describeSkipReason(makeGenerator(), false)).toMatch(/root/);
    });

    it("returns null when generator overrides root autorelease to true", () => {
        const g = makeGenerator({ raw: { autorelease: true } as generatorsYml.GeneratorInvocation["raw"] });
        expect(describeSkipReason(g, false)).toBeNull();
    });

    it("prioritizes automations.generate over autorelease when both would skip", () => {
        const g = makeGenerator({
            automation: { generate: false, upgrade: true, preview: true, verify: true },
            raw: { autorelease: false } as generatorsYml.GeneratorInvocation["raw"]
        });
        expect(describeSkipReason(g, undefined)).toBe("automations.generate is false");
    });

    it("reads the post-cascade automations.generate value (resolver handles root/group/generator overrides)", () => {
        // The configuration loader resolves the automation cascade (generator → group → root →
        // default true) at parse time, so by the time we see a generator here, `automation.generate`
        // is already the winner. This test pins that contract: if root is false but the generator
        // overrides to true, the resolver has already set automation.generate = true and we treat
        // the generator as eligible.
        const effectivelyEnabled = makeGenerator({
            // resolved boolean — simulates what resolveAutomationConfig produces after an override
            automation: { generate: true, upgrade: true, preview: true, verify: true }
        });
        expect(describeSkipReason(effectivelyEnabled, undefined)).toBeNull();
    });
});

describe("classifySkipReason", () => {
    it("returns null when the generator is eligible", () => {
        expect(classifySkipReason(makeGenerator(), undefined)).toBeNull();
    });

    it("reports opted_out for automations.generate: false", () => {
        const g = makeGenerator({
            automation: { generate: false, upgrade: true, preview: true, verify: true }
        });
        expect(classifySkipReason(g, undefined)).toBe("opted_out");
    });

    it("reports local_output for generators with a local-file-system target", () => {
        const g = makeGenerator({
            absolutePathToLocalOutput:
                "/tmp/out" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
        });
        expect(classifySkipReason(g, undefined)).toBe("local_output");
    });

    it("reports opted_out for generator-level autorelease: false", () => {
        const g = makeGenerator({ raw: { autorelease: false } as generatorsYml.GeneratorInvocation["raw"] });
        expect(classifySkipReason(g, undefined)).toBe("opted_out");
    });

    it("reports opted_out when root autorelease is false and the generator has no override", () => {
        expect(classifySkipReason(makeGenerator(), false)).toBe("opted_out");
    });
});
