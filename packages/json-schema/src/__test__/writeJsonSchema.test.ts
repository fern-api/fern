import { readFile } from "fs/promises";
import { getAbsolutePathToFernJsonSchema, getFernJsonSchema } from "../writeJsonSchema";

describe("writeJsonSchema", () => {
    it("is up-to-date", async () => {
        const pathToJsonSchema = await getAbsolutePathToFernJsonSchema();

        const actualJsonSchemaStr = await readFile(pathToJsonSchema);
        const actualJsonSchema = JSON.parse(actualJsonSchemaStr.toString());

        const expectedFernJsonSchema = getFernJsonSchema();

        expect(actualJsonSchema).toEqual(expectedFernJsonSchema);
    });
});
