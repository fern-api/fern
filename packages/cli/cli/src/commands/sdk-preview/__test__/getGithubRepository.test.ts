import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import { getGithubRepository } from "../getGithubRepository.js";

/**
 * getGithubRepository only reads `generator.raw?.github`, so we only need
 * to populate that path. The rest of GeneratorInvocation is irrelevant.
 */
function makeGenerator(github?: Record<string, unknown>): generatorsYml.GeneratorInvocation {
    const base = {} as generatorsYml.GeneratorInvocation;
    if (github !== undefined) {
        base.raw = { github } as unknown as generatorsYml.GeneratorInvocation["raw"];
    }
    return base;
}

describe("getGithubRepository", () => {
    it("extracts repository from push mode github config", () => {
        const generator = makeGenerator({ repository: "acme/ts-sdk", mode: "push" });
        expect(getGithubRepository(generator)).toBe("acme/ts-sdk");
    });

    it("extracts repository from pull-request mode github config", () => {
        const generator = makeGenerator({ repository: "acme/ts-sdk", mode: "pull-request" });
        expect(getGithubRepository(generator)).toBe("acme/ts-sdk");
    });

    it("extracts repository from commit-and-release mode github config", () => {
        const generator = makeGenerator({ repository: "acme/ts-sdk" });
        expect(getGithubRepository(generator)).toBe("acme/ts-sdk");
    });

    it("returns undefined for self-hosted config (uses uri instead of repository)", () => {
        const generator = makeGenerator({ uri: "https://github.example.com/acme/ts-sdk.git" });
        expect(getGithubRepository(generator)).toBeUndefined();
    });

    it("returns undefined when github config is missing", () => {
        const generator = makeGenerator();
        expect(getGithubRepository(generator)).toBeUndefined();
    });

    it("returns undefined when raw is undefined", () => {
        const generator = {} as generatorsYml.GeneratorInvocation;
        expect(getGithubRepository(generator)).toBeUndefined();
    });
});
