import { testParseOpenAPI } from "./testParseOpenApi";

describe("open api parser", () => {
    testParseOpenAPI("streaming", "openapi.yml");
});
