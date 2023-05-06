import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

const FIXTURES = ["docs"];

describe("fern generate", () => {
    it("default api (fern init)", async () => {
        const pathOfDirectory = await init();

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
        });

        expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("generated/typescript")))).toBe(true);
    }, 180_000);

    const fixturesDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
    for (const fixtureName of FIXTURES) {
        // eslint-disable-next-line jest/expect-expect
        it(
            // eslint-disable-next-line jest/valid-title
            fixtureName,
            async () => {
                await runFernCli(["generate"], {
                    cwd: join(fixturesDir, RelativeFilePath.of(fixtureName)),
                });
            },
            180_000
        );
    }
});
