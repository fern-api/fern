import { getDirectoryContents } from "@fern-api/commons";
import { compile } from "@fern-api/compiler";
import { GeneratorConfig } from "@fern-api/generator-runner";
import { installAndCompileGeneratedProject } from "@fern-typescript/testing-utils";
import { parseFernInput } from "fern-api";
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
                const apiPath = path.join(fixturePath, "api");
                const relativeOutputPath = "generated";
                const outputPath = path.join(fixturePath, relativeOutputPath);

                await rm(outputPath, { recursive: true, force: true });
                await rm(configPath, { force: true });

                const files = await parseFernInput(apiPath);
                const compilerResult = await compile(files, undefined);
                if (!compilerResult.didSucceed) {
                    throw new Error(JSON.stringify(compilerResult.failure));
                }
                await writeFile(irPath, JSON.stringify(compilerResult.intermediateRepresentation, undefined, 4));

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

                await installAndCompileGeneratedProject(outputPath);

                const directoryContents = await getDirectoryContents(path.join(outputPath, "src"));
                expect(directoryContents).toMatchSnapshot();

                await rm(configPath);
                await rm(outputPath, { recursive: true });
            },
            90_000
        );
    }
});
