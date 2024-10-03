import { testParseOpenAPI } from "./testParseOpenApi";

describe("inline-schema-reference", () => {
    testParseOpenAPI("inline-schema-reference", "openapi.yml");
});
