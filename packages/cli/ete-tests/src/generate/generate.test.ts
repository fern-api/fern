import { getDirectoryContents } from "@fern-api/core-utils";
import { installAndCompileGeneratedProjects } from "@fern-typescript/testing-utils";
import { rm } from "fs/promises";
import path from "path";
import { runFernCli } from "../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern generate", () => {
    itFixture("simple-model");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const outputPath = path.join(fixturePath, "generated");
            await rm(outputPath, { force: true, recursive: true });

            await runFernCli(["--api", fixturePath, "generate", "--local", "--keepDocker"], {
                cwd: FIXTURES_DIR,
            });

            const directoryContents = await getDirectoryContents(path.join(outputPath, "model"));
            expect(directoryContents).toMatchSnapshot();

            await installAndCompileGeneratedProjects(outputPath);

            await rm(outputPath, { force: true, recursive: true });
        },
        90_000
    );
}
