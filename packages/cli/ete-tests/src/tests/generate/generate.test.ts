import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import stripAnsi from "strip-ansi";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern generate", () => {
    it("default api (fern init)", async () => {
        const pathOfDirectory = await init();

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
        });

        expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("generated/typescript")))).toBe(true);
    }, 180_000);

    // to prevent overloading algolia, we only
    // run the docs test on main or tags
    (isOnMainOrTagOnCircle() ? it : it.skip)(
        "docs",
        async () => {
            await runFernCli(["generate"], {
                cwd: join(fixturesDir, RelativeFilePath.of("docs")),
            });
        },
        180_000
    );

    it("missing docs page", async () => {
        const { stdout } = await runFernCli(["generate"], {
            cwd: join(fixturesDir, RelativeFilePath.of("docs-missing-page")),
            reject: false,
        });

        expect(
            stripAnsi(stdout)
                // for some reason, locally the output contains a newline that Circle doesn't
                .trim()
        ).toMatchSnapshot();
    });
});

function isOnMainOrTagOnCircle(): boolean {
    const { CIRCLE_BRANCH, CIRCLE_TAG } = process.env;
    return CIRCLE_BRANCH === "main" || CIRCLE_TAG != null;
}
