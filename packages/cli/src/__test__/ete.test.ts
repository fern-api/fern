import execa from "execa";
import { readdirSync } from "fs";
import { readFile, rm } from "fs/promises";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("ETE tests", () => {
    const fixtures = readdirSync(FIXTURES_DIR);
    for (const fixture of fixtures) {
        it(
            fixture,
            async () => {
                const fixturePath = path.join(FIXTURES_DIR, fixture);
                const outputPath = path.join(fixturePath, "generated");
                await rm(outputPath, { force: true, recursive: true });

                await execa("node", ["./cli", fixturePath], {
                    env: {
                        NODE_ENV: "development",
                    },
                });

                const expectedFilesBuffer = await readFile(path.join(fixturePath, "expectedFiles.txt"));
                const expectedFiles = expectedFilesBuffer
                    .toString()
                    .split("\n")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
                for (const expectedFile of expectedFiles) {
                    const fileContents = await readFile(path.join(outputPath, expectedFile));
                    expect(fileContents.toString()).toMatchSnapshot();
                }
            },
            10_000
        );
    }
});
