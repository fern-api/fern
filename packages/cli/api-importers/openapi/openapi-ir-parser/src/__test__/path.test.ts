import { testParseOpenAPI } from "./testParseOpenApi";

describe("path parsing", () => {
    testParseOpenAPI("path", "openapi.yml");
});
