import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-version", () => {
    testParseOpenAPI("x-fern-version", "openapi.yml");
});
