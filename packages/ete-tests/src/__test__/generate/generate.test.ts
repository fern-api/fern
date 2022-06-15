import { installAndCompileGeneratedProject } from "@fern-typescript/testing-utils";
import execa from "execa";
import { readFile, rm } from "fs/promises";
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

            const cmd = execa("node", ["../cli/cli", "generate", fixturePath], {
                env: {
                    NODE_ENV: "development",
                },
            });
            cmd.stdout?.pipe(process.stdout);
            cmd.stderr?.pipe(process.stderr);
            await cmd;

            await installAndCompileGeneratedProject(outputPath);

            const expectedFilesBuffer = await readFile(path.join(fixturePath, "expectedFiles.txt"));
            const expectedFiles = expectedFilesBuffer
                .toString()
                .split("\n")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            for (const expectedFile of expectedFiles) {
                let fileContents: string;
                try {
                    fileContents = (await readFile(path.join(outputPath, expectedFile))).toString();
                } catch (e) {
                    throw new Error(`Expected file ${expectedFile} to exist, but it does not.`);
                }
                expect(fileContents).toMatchSnapshot();
            }
            await rm(outputPath, { force: true, recursive: true });
        },
        90_000
    );
}
