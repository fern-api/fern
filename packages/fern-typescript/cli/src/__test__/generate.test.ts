import { getDirectoryContents } from "@fern-api/commons";
import { GeneratorConfig } from "@fern-api/generator-runner";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { runGenerator } from "../generator/runGenerator";

const FIXTURES = ["trace"];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

describe("runGenerator", () => {
    for (const fixture of FIXTURES) {
        it(
            // eslint-disable-next-line jest/valid-title
            fixture,
            async () => {
                const fixturePath = path.join(FIXTURES_PATH, fixture);
                const configPath = path.join(fixturePath, "config.json");
                const irPath = path.join(fixturePath, "ir.json");
                const relativeOutputPath = "generated";
                const outputPath = path.join(fixturePath, relativeOutputPath);

                const config: GeneratorConfig = {
                    irFilepath: irPath,
                    workspaceVersion: "0.0.0",
                    output: {
                        path: outputPath,
                        pathRelativeToRootOnHost: relativeOutputPath,
                    },
                    helpers: {
                        encodings: {},
                    },
                    customConfig: {
                        mode: "client",
                        packageName: "trace",
                    },
                };

                await writeFile(configPath, JSON.stringify(config, undefined, 4));
                await runGenerator(configPath);

                const directoryContents = await getDirectoryContents(outputPath);
                expect(directoryContents).toMatchSnapshot();

                await rm(configPath);
                await rm(outputPath, { recursive: true });
            },
            60_000
        );
    }
});
