import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli.js";

// The flag rules of `fern generate` live in the argument handler, which only the built CLI runs. Each rule stops the
// command before it reads a project or calls any service, so these run in an empty folder and need no network.

describe("fern generate flag rules", () => {
    let directory: string;

    beforeAll(async () => {
        directory = await mkdtemp(path.join(tmpdir(), "fern-generate-flags-"));
    });

    afterAll(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    async function generate(args: string[]) {
        const result = await runFernCli(["generate", ...args], {
            cwd: directory,
            includeAuthToken: false,
            reject: false
        });
        return { exitCode: result.exitCode, output: stripAnsi(`${result.stdout}\n${result.stderr}`) };
    }

    it.each([
        { args: ["--api", "petstore", "--docs"], message: "Cannot specify both --api and --docs. Please choose one." },
        { args: ["--id", "stable"], message: "The --id flag can only be used with --preview." },
        { args: ["--preview", "--id", "stable"], message: "The --id flag can only be used with --docs." },
        { args: ["--skip-upload"], message: "The --skip-upload flag can only be used with --preview." },
        { args: ["--preview", "--skip-upload"], message: "The --skip-upload flag can only be used with --docs." },
        {
            args: ["--fernignore", "./.fernignore", "--local"],
            message: "The --fernignore flag is not supported with local generation (--local or --runner)."
        },
        {
            args: ["--fernignore", "./.fernignore", "--runner", "docker"],
            message: "The --fernignore flag is not supported with local generation (--local or --runner)."
        },
        {
            args: ["--skip-fernignore", "--fernignore", "./.fernignore"],
            message: "The --skip-fernignore and --fernignore flags cannot be used together."
        },
        {
            args: ["--dynamic-ir-only", "--version", "1.0.0", "--local"],
            message: "The --dynamic-ir-only flag is not supported with local generation (--local or --runner)."
        },
        {
            args: ["--dynamic-ir-only"],
            message: "The --dynamic-ir-only flag requires a version to be specified with --version."
        },
        {
            args: ["--dynamic-ir-only", "--version", "1.0.0", "--docs"],
            message: "The --dynamic-ir-only flag can only be used for API generation, not docs generation."
        },
        { args: ["--output", "./out"], message: "The --output flag currently only works with --preview." },
        { args: ["--package", "--preview"], message: "The --package flag cannot be used with --preview." },
        { args: ["--package-only", "--preview"], message: "The --package flag cannot be used with --preview." },
        {
            args: ["--package", "--docs"],
            message: "The --package flag can only be used for API generation, not docs generation."
        },
        { args: ["--package-mode", "docker"], message: "The --package-mode flag can only be used with --package." },
        {
            args: ["--preview", "--output", "./out", "--docs"],
            message: "The --output flag is not supported for docs generation."
        },
        {
            args: ["--sdk-config", "./sdk-config.yml", "--docs"],
            message: "The --sdk-config flag can only be used for API generation, not docs generation."
        },
        {
            args: ["--target", "typescript", "--docs"],
            message: "The --target flag can only be used for API generation, not docs generation."
        }
    ])("rejects `generate $args`", async ({ args, message }) => {
        const { exitCode, output } = await generate(args);

        expect(output).toContain(message);
        expect(exitCode).toBe(1);
    }, 60_000);

    it.each([
        { args: ["--docs", "--group", "sdks"], warning: "--group is ignored when generating docs" },
        {
            args: ["--docs", "--generator", "fernapi/fern-typescript-sdk"],
            warning: "--generator is ignored when generating docs"
        },
        { args: ["--docs", "--version", "1.0.0"], warning: "--version is ignored when generating docs" }
    ])("warns about `generate $args` and goes on to look for the project", async ({ args, warning }) => {
        const { output } = await generate(args);

        expect(output).toContain(warning);
        expect(output).toContain('Directory "fern" not found.');
    }, 60_000);

    it("does not warn about those flags when they are used for SDKs", async () => {
        const { output } = await generate(["--group", "sdks", "--version", "1.0.0"]);

        expect(output).not.toContain("is ignored when generating docs");
        expect(output).toContain('Directory "fern" not found.');
    }, 60_000);
});
