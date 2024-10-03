import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-property-name", () => {
    testParseOpenAPI("x-fern-property-name", "openapi.yml");
});
