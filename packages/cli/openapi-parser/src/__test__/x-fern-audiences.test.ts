import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-audiences", () => {
    testParseOpenAPI("x-fern-audiences", "openapi.yml");
});
