import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { exec } from "child_process";
import stripAnsi from "strip-ansi";
import { vi } from "vitest";

import { runFernCli, runFernCliWithoutAuthToken } from "../../utils/runFernCli";
import { init } from "../init/init";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern generate", () => {
    it("default api (fern init)", async () => {
        const pathOfDirectory = await init();

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory
        });

        expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("sdks/typescript")))).toBe(true);
    }, 180_000);

    it("ir contains fdr definitionid", async () => {
        const { stdout, stderr } = await runFernCli(["generate", "--log-level", "debug"], {
            cwd: join(fixturesDir, RelativeFilePath.of("basic")),
            reject: false
        });

        console.log("stdout", stdout);
        console.log("stderr", stderr);

        const filepath = extractFilepath(stdout);
        if (filepath == null) {
            throw new Error(`Failed to get path to IR:\n${stdout}`);
        }

        const process = exec(
            `./ir-contains-fdr-definition-id.sh ${filepath}`,
            { cwd: __dirname },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            }
        );
    }, 180_000);

    // TODO: Re-enable this test if and when it doesn't require the user to be logged in.
    // It's otherwise flaky on developer machines that haven't logged in with the fern CLI.
    //
    // biome-ignore lint/suspicious/noSkippedTests: allow
    it.skip("missing docs page", async () => {
        const { stdout } = await runFernCli(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs-missing-page")),
            reject: false
        });

        expect(
            stripAnsi(stdout)
                // for some reason, locally the output contains a newline that Circle doesn't
                .trim()
        ).toMatchSnapshot();
    }, 180_000);

    it("generate docs with no auth requires login", async () => {
        vi.stubEnv("FERN_TOKEN", undefined);
        const { stdout, stderr } = await runFernCliWithoutAuthToken(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs")),
            reject: false
        });
        const output = stdout + stderr;
        expect(output).toContain("Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable.");
    }, 180_000);

    it("generate docs with auth bypass fails", async () => {
        vi.stubEnv("FERN_TOKEN", undefined);
        const { stdout } = await runFernCliWithoutAuthToken(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs")),
            reject: false,
            env: {
                FERN_SELF_HOSTED: "true"
            }
        });
        expect(stdout).toContain("No token found. Please set the FERN_TOKEN environment variable.");
    }, 180_000);

    it("generate docs with auth bypass succeeds", async () => {
        vi.stubEnv("FERN_TOKEN", "dummy");

        const { stdout } = await runFernCliWithoutAuthToken(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs")),
            reject: false,
            env: {
                FERN_SELF_HOSTED: "true",
                FERN_TOKEN: "dummy"
            }
        });
        expect(stdout).toContain("ferndevtest.docs.dev.buildwithfern.com Started.");
    }, 180_000);

    it("generate docs with no docs.yml file fails", async () => {
        const { stdout } = await runFernCli(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("basic")),
            reject: false
        });
        expect(stdout).toContain("No docs.yml file found. Please make sure your project has one.");
    }, 180_000);
});

function extractFilepath(logLine: string): string | null {
    const prefix = "Wrote IR to disk:";
    const index = logLine.indexOf(prefix);

    if (index !== -1) {
        return logLine.slice(index + prefix.length).trim();
    }

    return null;
}
