import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { exec } from "child_process";
import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "../init/init.js";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern generate", () => {
    it.concurrent("default api (fern init)", async ({ signal }) => {
        const pathOfDirectory = await init({ signal });

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
            signal
        });

        expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("sdks/typescript")))).toBe(true);
    }, 180_000);

    it.concurrent("ir contains fdr definitionid", async ({ signal }) => {
        if (globalThis.process.env.FERN_ORG_TOKEN_DEV == null) {
            throw new Error("FERN_ORG_TOKEN_DEV is not set");
        }
        const { stdout, stderr } = await runFernCli(["generate", "--log-level", "debug"], {
            cwd: join(fixturesDir, RelativeFilePath.of("basic")),
            reject: false,
            signal
        });

        console.log("stdout", stdout);
        console.log("stderr", stderr);

        const filepath = extractFilepath(stdout);
        if (filepath == null) {
            throw new Error(`Failed to get path to IR:\n${stdout}`);
        }

        exec(`./ir-contains-fdr-definition-id.sh ${filepath}`, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }, 180_000);

    // TODO: Re-enable this test if and when it doesn't require the user to be logged in.
    // It's otherwise flaky on developer machines that haven't logged in with the fern CLI.
    //
    // biome-ignore lint/suspicious/noSkippedTests: allow
    it.skip("missing docs page", async ({ signal }) => {
        const { stdout } = await runFernCli(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs-missing-page")),
            reject: false,
            signal
        });

        expect(
            stripAnsi(stdout)
                // for some reason, locally the output contains a newline that Circle doesn't
                .trim()
        ).toMatchSnapshot();
    }, 180_000);

    it.concurrent("generate docs with no auth requires login", async ({ signal }) => {
        const { stdout, stderr } = await runFernCli(["generate", "--docs", "--no-prompt"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs")),
            reject: false,
            env: {
                FERN_TOKEN: ""
            },
            includeAuthToken: false,
            signal
        });
        const output = stdout + stderr;
        expect(output).toContain(
            "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable."
        );
    }, 180_000);

    it.concurrent("generate docs with FDR origin override and token succeeds", async ({ signal }) => {
        const { stdout } = await runFernCli(["generate", "--docs", "--no-prompt"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs")),
            reject: false,
            env: {
                FERN_FDR_ORIGIN: "http://localhost:8080",
                FERN_TOKEN: "dummy"
            },
            includeAuthToken: false,
            signal
        });
        expect(stdout).toContain("ferndevtest.docs.dev.buildwithfern.com Started.");
    }, 180_000);

    it.concurrent("generate docs with no docs.yml file fails", async ({ signal }) => {
        const { stdout } = await runFernCli(["generate", "--docs"], {
            cwd: join(fixturesDir, RelativeFilePath.of("basic")),
            reject: false,
            signal
        });
        expect(stdout).toContain("No docs.yml file found. Please make sure your project has one.");
    }, 180_000);

    it.concurrent("lists available groups when no group specified", async ({ signal }) => {
        const { stdout, failed } = await runFernCli(["generate", "--local"], {
            cwd: join(fixturesDir, RelativeFilePath.of("no-default-group")),
            reject: false,
            signal
        });
        expect(failed).toBe(true);
        const stripped = stripAnsi(stdout);
        expect(stripped).toContain("No group specified");
        expect(stripped).toContain("--group sdk");
        expect(stripped).toContain("--group docs");
    }, 90_000);
});

function extractFilepath(logLine: string): string | null {
    const prefix = "Wrote IR to disk:";
    const index = logLine.indexOf(prefix);

    if (index !== -1) {
        return logLine.slice(index + prefix.length).trim();
    }

    return null;
}
