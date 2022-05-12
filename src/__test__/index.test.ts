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
        expect(postmanCollection).toHaveProperty("item");
        expect(postmanCollection.item?.length).toEqual(1);
        expect(postmanCollection.item?.[0]).toMatchObject({
            name: expect.stringMatching("PostsService"),
            item: expect.arrayContaining([
                expect.objectContaining({ name: "createPost" }),
                expect.objectContaining({ name: "getPost" }),
            ]),
        });
    });
});
