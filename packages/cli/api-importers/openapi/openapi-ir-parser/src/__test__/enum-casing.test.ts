import { testParseOpenAPI } from "./testParseOpenApi";

describe("examples", () => {
    testParseOpenAPI("enum-casing", "openapi.yml");
});
