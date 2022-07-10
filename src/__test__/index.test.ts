import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { parseWorkspaceDefinition } from "@fern-api/workspace-parser";
import path from "path";
import { convertToPostmanCollection } from "../convertToPostmanCollection";

describe("Postman Conversion", () => {
    it("Blog Post API", async () => {
        const testApiDir = path.join(__dirname, "test-api");
        const parsed = await parseWorkspaceDefinition({
            name: "Blog API",
            absolutePathToDefinition: path.join(testApiDir, "src"),
        });
        if (!parsed.didSucceed) {
            throw new Error(JSON.stringify(parsed.failures));
        }
        const intermediateRepresentation = generateIntermediateRepresentation(parsed.workspace);
        const postmanCollection = convertToPostmanCollection(intermediateRepresentation);
        expect(postmanCollection).toMatchSnapshot();
    });
});
