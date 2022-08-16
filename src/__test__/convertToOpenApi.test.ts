import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { convertToOpenApi } from "../convertToOpenApi";

const FIXTURES = ["test-api", "all-auth", "any-auth"];

describe("convertToOpenApi", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixture, async () => {
            const fixtureDir = path.join(__dirname, "fixtures", fixture);
            const maybeLoadedWorkspace = await loadWorkspace({
                absolutePathToWorkspace: fixtureDir,
                version: 2,
            });
            if (!maybeLoadedWorkspace.didSucceed) {
                throw new Error(JSON.stringify(maybeLoadedWorkspace.failures));
            }
            const intermediateRepresentation = await generateIntermediateRepresentation(maybeLoadedWorkspace.workspace);
            const openApi = convertToOpenApi({
                apiName: "BlogPost API",
                apiVersion: "0.0.0",
                ir: intermediateRepresentation,
            });

            const generatedDir = path.join(fixtureDir, "generated");
            await mkdir(generatedDir, { recursive: true });
            await writeFile(path.join(generatedDir, "openapi.json"), JSON.stringify(openApi, undefined, 4));

            expect(openApi).toMatchSnapshot();
        });
    }
});
