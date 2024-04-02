import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-header", () => {
    testParseOpenAPI("x-fern-header", "openapi.yml");
});
