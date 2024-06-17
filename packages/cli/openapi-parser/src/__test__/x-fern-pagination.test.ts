import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-pagination", () => {
    testParseOpenAPI("x-fern-pagination", "openapi.yml");
});
