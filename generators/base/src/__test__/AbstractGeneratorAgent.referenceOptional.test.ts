import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { createLogger, LogLevel } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { describe, expect, it } from "vitest";
import { AbstractGeneratorAgent } from "../AbstractGeneratorAgent.js";
import { ReferenceConfigBuilder } from "../reference/index.js";
import { RawGithubConfig } from "../utils/index.js";

const FAILURE = new Error("SSL certificate problem: certificate signer not trusted");

function createConfig({ referenceOptional }: { referenceOptional: boolean }): FernGeneratorExec.GeneratorConfig {
    const config: FernGeneratorExec.GeneratorConfig = {
        dryRun: false,
        irFilepath: "/ir.json",
        output: {
            path: "/output",
            mode: FernGeneratorExec.OutputMode.downloadFiles(),
            snippetFilepath: undefined
        },
        workspaceName: "workspace",
        organization: "organization",
        customConfig: undefined,
        environment: FernGeneratorExec.GeneratorEnvironment.local(),
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false
    };
    // `referenceOptional` is not part of the published generator-exec schema; the CLI writes it into
    // config.json and generators preserve it via `unrecognizedObjectKeys: "passthrough"`.
    return referenceOptional ? Object.assign(config, { referenceOptional: true }) : config;
}

class TestGeneratorAgent extends AbstractGeneratorAgent<never> {
    public skipReadme(): undefined {
        return this.skipReadmeOrThrow(FAILURE);
    }

    protected getLanguage(): FernGeneratorCli.Language {
        throw FAILURE;
    }

    protected getReadmeConfig(): FernGeneratorCli.ReadmeConfig {
        throw FAILURE;
    }

    protected getGitHubConfig(): RawGithubConfig {
        throw FAILURE;
    }
}

function createAgent({ referenceOptional }: { referenceOptional: boolean }): {
    agent: TestGeneratorAgent;
    warnings: string[];
} {
    const warnings: string[] = [];
    const logger = createLogger((level, ...args) => {
        if (level === LogLevel.Warn) {
            warnings.push(args.join(" "));
        }
    });
    return { agent: new TestGeneratorAgent({ logger, config: createConfig({ referenceOptional }) }), warnings };
}

describe("AbstractGeneratorAgent with --reference-optional", () => {
    it("warns and skips the README instead of failing", () => {
        const { agent, warnings } = createAgent({ referenceOptional: true });
        expect(agent.skipReadme()).toBeUndefined();
        expect(warnings).toEqual([expect.stringContaining("Skipping README.md generation")]);
        expect(warnings[0]).toContain(FAILURE.message);
    });

    it("warns and skips the reference instead of failing", async () => {
        const { agent, warnings } = createAgent({ referenceOptional: true });
        await expect(agent.generateReference(new ReferenceConfigBuilder())).resolves.toBeUndefined();
        expect(warnings).toEqual([expect.stringContaining("Skipping API reference (reference.md) generation")]);
        expect(warnings[0]).toContain(FAILURE.message);
    });
});

describe("AbstractGeneratorAgent without --reference-optional", () => {
    it("fails README generation", () => {
        const { agent, warnings } = createAgent({ referenceOptional: false });
        expect(() => agent.skipReadme()).toThrow(FAILURE);
        expect(warnings).toEqual([]);
    });

    it("fails reference generation", async () => {
        const { agent, warnings } = createAgent({ referenceOptional: false });
        await expect(agent.generateReference(new ReferenceConfigBuilder())).rejects.toThrow(FAILURE);
        expect(warnings).toEqual([]);
    });
});
