import { getDirectoryContents } from "@fern-api/core-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { GeneratorConfig } from "@fern-fern/ir-model/generators";
import { installAndCompileGeneratedProjects } from "@fern-typescript/testing-utils";
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

                const parseWorkspaceResult = await loadWorkspace({
                    name: undefined,
                    absolutePathToDefinition: apiPath,
                });
                if (!parseWorkspaceResult.didSucceed) {
                    throw new Error(JSON.stringify(parseWorkspaceResult.failures));
                }
                const intermediateRepresentation = await generateIntermediateRepresentation(
                    parseWorkspaceResult.workspace
                );

                await writeFile(irPath, JSON.stringify(intermediateRepresentation, undefined, 4));

                const config: GeneratorConfig = {
                    irFilepath: irPath,
                    output: {
                        path: outputPath,
                    },
                    publish: null,
                    helpers: {
                        encodings: {},
                    },
                    customConfig: {
                        mode: "client",
                    },
                    workspaceName: "my-api",
                    organization: "fern-api",
                    environment: { _type: "local" },
                };

                await writeFile(configPath, JSON.stringify(config, undefined, 4));
                await runGenerator(configPath);

                const directoryContents = await getDirectoryContents(path.join(outputPath, "client"));
                expect(directoryContents).toMatchSnapshot();

                await installAndCompileGeneratedProjects(outputPath);

                await rm(configPath);
                await rm(outputPath, { recursive: true });
            },
            90_000
        );
    }
});
