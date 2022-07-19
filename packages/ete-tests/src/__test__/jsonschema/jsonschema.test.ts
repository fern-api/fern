import { ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA, FERN_JSON_SCHEMA } from "@fern-api/jsonschema-generation";
import { readFile } from "fs/promises";

describe("jsonschema-tests", () => {
    it("jsonschema-accurate", async () => {
        const currentJsonSchema = JSON.parse((await readFile(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA)).toString());
        expect(currentJsonSchema).toMatchObject(FERN_JSON_SCHEMA);
    });
});
