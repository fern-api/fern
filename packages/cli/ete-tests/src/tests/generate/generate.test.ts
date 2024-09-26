import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import stripAnsi from "strip-ansi";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";
import { readFile } from "fs/promises";
import { file } from "tmp-promise";
import { loggingExeca } from "@fern-api/logging-execa";
import { CONSOLE_LOGGER } from "../../../../task-context/node_modules/@fern-api/logger/src";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
// const FIXTURES = ["docs"];

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

        // Fails because ts cant issue commands to a temp directory cat ${filepath}
        const response = await loggingExeca(CONSOLE_LOGGER, `./ir-contains-fdr-definition-id.sh`, [filepath], {
            cwd: __dirname
        });
        expect(response.exitCode).toEqual(0);
    }, 180_000);

    it("missing docs page", async () => {
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
