import { FERN_JSON_SCHEMA, FERN_JSON_SCHEMA_FILENAME } from "@fern-api/jsonschema-generation";
import { readFile } from "fs/promises";
import path from "path";

const ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA = path.join(__dirname, `../../../../../${FERN_JSON_SCHEMA_FILENAME}`);

describe("jsonschema-tests", () => {
    it("jsonschema-accurate", async () => {
        const currentJsonSchema = JSON.parse((await readFile(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA)).toString());
        expect(currentJsonSchema).toMatchObject(FERN_JSON_SCHEMA);
    });
});
