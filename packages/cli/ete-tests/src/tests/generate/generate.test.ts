import { exec } from "child_process";
import stripAnsi from "strip-ansi";

import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
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
    // eslint-disable-next-line jest/no-disabled-tests
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
});

function extractFilepath(logLine: string): string | null {
    const prefix = "Wrote IR to disk:";
    const index = logLine.indexOf(prefix);

    if (index !== -1) {
        return logLine.slice(index + prefix.length).trim();
    }

    return null;
}
