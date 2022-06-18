import { GeneratorConfig } from "@fern-api/generator-runner";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { runGenerator } from "../generator/runGenerator";

const FIXTURES = ["trace"];
const FIXTURES_PATH = path.join(__dirname, "fixtures");

describe("runGenerator", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(
            fixture,
            async () => {
                const fixturePath = path.join(FIXTURES_PATH, fixture);
                const configPath = path.join(fixturePath, "config.json");
                const irFilepath = path.join(fixturePath, "ir.json");
                const relativeOutputPath = "generated";

                const config: GeneratorConfig = {
                    irFilepath: irFilepath,
                    workspaceVersion: "0.0.0",
                    output: {
                        path: path.join(fixturePath, relativeOutputPath),
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
                // TODO snapshot
                await rm(configPath);
            },
            15_000
        );
    }
});
