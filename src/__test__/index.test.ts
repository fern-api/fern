import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadWorkspace } from "@fern-api/workspace-loader";
import path from "path";
import { convertToPostmanCollection } from "../convertToPostmanCollection";

describe("Postman Conversion", () => {
    it("Blog Post API", async () => {
        const testApiDir = path.join(__dirname, "test-api");
        const maybeLoadedWorkspace = await loadWorkspace({
            name: "Blog API",
            absolutePathToDefinition: path.join(testApiDir, "src"),
        });
        if (!maybeLoadedWorkspace.didSucceed) {
            throw new Error(JSON.stringify(maybeLoadedWorkspace.failures));
        }
        const intermediateRepresentation = generateIntermediateRepresentation(maybeLoadedWorkspace.workspace);
        const postmanCollection = convertToPostmanCollection(intermediateRepresentation);
        expect(postmanCollection).toMatchSnapshot();
    });
});
