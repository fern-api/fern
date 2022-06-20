import { getDirectoryContents } from "@fern-api/commons";
import { installAndCompileGeneratedProject } from "@fern-typescript/testing-utils";
import execa from "execa";
import { rm } from "fs/promises";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern generate tests", () => {
    itFixture("simple-model");
    // itFixture("hathora");
});

function itFixture(fixtureName: string) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const outputPath = path.join(fixturePath, "generated");
            await rm(outputPath, { force: true, recursive: true });

            const cmd = execa("node", [path.join(__dirname, "../../../../cli/cli"), "generate", fixturePath], {
                env: {
                    NODE_ENV: "development",
                },
            });
            cmd.stdout?.pipe(process.stdout);
            cmd.stderr?.pipe(process.stderr);
            await cmd;

            const directoryContents = await getDirectoryContents(outputPath);
            expect(directoryContents).toMatchSnapshot();

            await installAndCompileGeneratedProject(outputPath);

            await rm(outputPath, { force: true, recursive: true });
        },
        90_000
    );
}
