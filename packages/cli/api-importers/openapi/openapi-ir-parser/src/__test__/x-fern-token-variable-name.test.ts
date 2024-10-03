import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-token-variable-name", () => {
    testParseOpenAPI("x-fern-token-variable-name", "openapi.yml");
});
