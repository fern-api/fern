import { describe, expect, it, vi } from "vitest";

const mockCloneRepository = vi.fn();

vi.mock("@fern-api/github", () => ({
    cloneRepository: (...args: unknown[]) => mockCloneRepository(...args)
}));

import { generateReadme } from "../api/generate-readme.js";
import { FernGeneratorCli } from "../configuration/sdk/index.js";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.go({
        publishInfo: {
            owner: "basic",
            repo: "basic-go",
            version: "0.0.1"
        }
    }),
    organization: "basic",
    remote: FernGeneratorCli.Remote.github({
        repoUrl: "https://github.com/basic/basic-go",
        installationToken: "ghs_xyz"
    })
};

describe("readme remote failures", () => {
    it("generates the readme when the remote cannot be cloned", async () => {
        mockCloneRepository.mockRejectedValue(new Error("SSL certificate problem: certificate signer not trusted"));

        const readme = await generateReadme({ readmeConfig: CONFIG });

        expect(mockCloneRepository).toHaveBeenCalled();
        expect(readme).toContain("# Basic Go Library");
    });
});
