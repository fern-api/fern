import { compile } from "@fern-api/compiler";
import { parseFernInput } from "fern-api";
import path from "path";
import { convertToPostmanCollection } from "../convertToPostmanCollection";

describe("Postman Conversion", () => {
    it("Blog Post API", async () => {
        const testApiDir = path.join(__dirname, "test-api");
        const files = await parseFernInput(path.join(testApiDir, "src"));
        const compilerResult = await compile(files, "Blog API");
        if (!compilerResult.didSucceed) {
            throw new Error(JSON.stringify(compilerResult.failure));
        }
        const postmanCollection = convertToPostmanCollection(compilerResult.intermediateRepresentation);
        expect(postmanCollection).toMatchSnapshot();
    });
});
