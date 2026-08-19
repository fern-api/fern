import { describe, expect, it } from "vitest";

import { resolveAutomationConfig } from "../resolveAutomationConfig.js";

describe("resolveAutomationConfig", () => {
    it("defaults all features to true when no automation is specified", () => {
        const result = resolveAutomationConfig({
            rootAutomation: undefined,
            groupAutomation: undefined,
            generatorAutomation: undefined
        });

        expect(result).toEqual({
            generate: true,
            upgrade: true,
            preview: true,
            verify: true
        });
    });

    it("applies root-level overrides", () => {
        const result = resolveAutomationConfig({
            rootAutomation: { generate: false, preview: false },
            groupAutomation: undefined,
            generatorAutomation: undefined
        });

        expect(result).toEqual({
            generate: false,
            upgrade: true,
            preview: false,
            verify: true
        });
    });

    it("group-level overrides root-level", () => {
        const result = resolveAutomationConfig({
            rootAutomation: { generate: false, preview: false },
            groupAutomation: { preview: true },
            generatorAutomation: undefined
        });

        expect(result).toEqual({
            generate: false,
            upgrade: true,
            preview: true,
            verify: true
        });
    });

    it("generator-level overrides group-level and root-level", () => {
        const result = resolveAutomationConfig({
            rootAutomation: { generate: false, upgrade: false, preview: false, verify: false },
            groupAutomation: { preview: true },
            generatorAutomation: { generate: true, verify: true }
        });

        expect(result).toEqual({
            generate: true,
            upgrade: false,
            preview: true,
            verify: true
        });
    });

    it("generator-level overrides default when root and group are undefined", () => {
        const result = resolveAutomationConfig({
            rootAutomation: undefined,
            groupAutomation: undefined,
            generatorAutomation: { upgrade: false }
        });

        expect(result).toEqual({
            generate: true,
            upgrade: false,
            preview: true,
            verify: true
        });
    });

    it("partial overrides at each level only affect specified fields", () => {
        const result = resolveAutomationConfig({
            rootAutomation: { generate: false },
            groupAutomation: { upgrade: false },
            generatorAutomation: { preview: false }
        });

        expect(result).toEqual({
            generate: false,
            upgrade: false,
            preview: false,
            verify: true
        });
    });

    it("all features can be disabled", () => {
        const result = resolveAutomationConfig({
            rootAutomation: { generate: false, upgrade: false, preview: false, verify: false },
            groupAutomation: undefined,
            generatorAutomation: undefined
        });

        expect(result).toEqual({
            generate: false,
            upgrade: false,
            preview: false,
            verify: false
        });
    });
});
