import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";
import { writeFile, mkdir } from "fs/promises";

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


describe("fern generate --local", () => {
    it("Keep files listed in .fernignore from unmodified", async () => {
        const pathOfDirectory = await init();

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
        });

        const absolutePathToLocalOutput = join(pathOfDirectory, RelativeFilePath.of("generated/typescript"));

        await writeFile(`${pathOfDirectory}/generated/typescript/.fernignore`, "fern.js\n**/*.txt");
        await writeFile(`${pathOfDirectory}/generated/typescript/fern.js`, "#!/usr/bin/env node\nconsole.log('Fern >>> OpenAPI')");
        await mkdir(`${pathOfDirectory}/generated/typescript/slam`);
        await writeFile(`${pathOfDirectory}/generated/typescript/slam/slam.txt`, "Practice schema-first API design with Fern");

        await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
        });

        expect(await doesPathExist(join(absolutePathToLocalOutput, RelativeFilePath.of("fern.js")))).toBe(true);
        expect(await doesPathExist(join(absolutePathToLocalOutput, RelativeFilePath.of(".fernignore")))).toBe(true);
        expect(await doesPathExist(join(absolutePathToLocalOutput, RelativeFilePath.of("slam")))).toBe(true);
        expect(await doesPathExist(join(absolutePathToLocalOutput, RelativeFilePath.of("slam/slam.txt")))).toBe(true);
    }, 180_000);
});
