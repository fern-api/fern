import { AbsoluteFilePath } from "@fern-api/core-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { convertToPostmanCollection } from "../convertToPostmanCollection";

const FIXTURES = ["test-api", "all-auth", "any-auth"];

describe("convertToOpenApi", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixture, async () => {
            const fixtureDir = path.join(__dirname, "fixtures", fixture);
            const maybeLoadedWorkspace = await loadWorkspace({
                absolutePathToWorkspace: AbsoluteFilePath.of(fixtureDir),
            });
            if (!maybeLoadedWorkspace.didSucceed) {
                throw new Error(JSON.stringify(maybeLoadedWorkspace.failures));
            }
            const intermediateRepresentation = await generateIntermediateRepresentation(maybeLoadedWorkspace.workspace);
            const postmanCollection = convertToPostmanCollection(intermediateRepresentation);

            const generatedDir = path.join(fixtureDir, "generated");
            await mkdir(generatedDir, { recursive: true });
            await writeFile(
                path.join(generatedDir, "collection.json"),
                JSON.stringify(postmanCollection, undefined, 4)
            );

            expect(postmanCollection).toMatchSnapshot();
        });
    }
});
